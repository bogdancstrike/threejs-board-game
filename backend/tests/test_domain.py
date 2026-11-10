from copy import deepcopy
from itertools import cycle
from uuid import uuid4

import pytest

from app import domain


def party(count=2, mode="classic"):
    host = str(uuid4())
    room = domain.initial_room(str(uuid4()), "ABC234", host, "Ada", "verdant", mode)
    for i in range(1, count):
        domain.join(room, str(uuid4()), f"Player {i + 1}")
    for p in room["game"]["players"]:
        p["ready"] = True
    room, _ = domain.apply(room, host, "START_GAME", {}, clock=0)
    return room


def test_character_claim_is_unique_and_rejected_command_does_not_mutate_room():
    room = party()
    room["phase"] = "lobby"
    before = deepcopy(room)
    second = room["game"]["players"][1]["id"]
    with pytest.raises(domain.GameError, match="already claimed"):
        domain.apply(room, second, "SELECT_CHARACTER", {"character": "lyra"})
    assert room == before


def test_all_members_must_be_ready_and_only_host_can_start():
    room = domain.initial_room(str(uuid4()), "ABC234", str(uuid4()), "Host", "verdant")
    guest = domain.join(room, str(uuid4()), "Guest")
    with pytest.raises(domain.GameError, match="host"):
        domain.apply(room, guest["id"], "START_GAME", {})
    with pytest.raises(domain.GameError, match="mark ready"):
        domain.apply(room, room["hostId"], "START_GAME", {})


def test_server_draws_dice_and_rejects_client_points_and_out_of_turn_roll():
    room = party()
    host, guest = [p["id"] for p in room["game"]["players"]]
    for payload in [{"dice": 6}, {"points": 999}, {"position": 92}]:
        with pytest.raises(domain.GameError, match="unsupported"):
            domain.apply(room, host, "ROLL_DIE", payload)
    with pytest.raises(domain.GameError, match="another player"):
        domain.apply(room, guest, "ROLL_DIE", {})
    result, events = domain.apply(room, host, "ROLL_DIE", {}, randbelow=lambda n: 2)
    assert events[0]["payload"]["dice"] == 3
    assert events[0]["payload"]["route"] == [1, 2, 3]
    assert result["game"]["players"][0]["points"] == 3
    assert result["game"]["active"] == 1


def test_story_choice_rewards_and_affordability():
    room = party()
    room["game"]["players"][0]["position"] = 3
    room, _ = domain.apply(room, room["hostId"], "ROLL_DIE", {}, randbelow=lambda n: 0)
    assert room["game"]["phase"] == "event"
    assert room["game"]["active"] == 0
    with pytest.raises(domain.GameError):
        domain.apply(room, room["hostId"], "CHOOSE", {"index": 1.0})
    room, _ = domain.apply(room, room["hostId"], "CHOOSE", {"index": 1})
    assert room["game"]["players"][0]["clues"] == 2
    assert room["game"]["players"][0]["points"] == 41
    assert room["game"]["active"] == 1


@pytest.mark.parametrize("kind", range(6))
def test_challenge_types_are_validated_and_private_answers_are_not_public(kind):
    room = party()
    card = domain.challenge(kind, 1000)
    room["game"].update(phase="challenge", challenge=card)
    public = domain.public_room(room)
    assert "_answer" not in public["game"]["challenge"]
    answer = card.get("_answer")
    result, _ = domain.apply(
        room, room["hostId"], "SUBMIT_CHALLENGE", {"answer": answer}, clock=6000
    )
    assert result["game"]["phase"] == "ready"
    assert result["game"]["active"] == 1
    assert result["game"]["players"][0]["points"] in (0, 50)


def test_expired_challenge_does_not_award_points_and_skip_is_not_punished():
    room = party()
    room["game"].update(phase="challenge", challenge=domain.challenge(0, 1000))
    result, _ = domain.apply(room, room["hostId"], "SUBMIT_CHALLENGE", {"answer": 0}, clock=40000)
    assert result["game"]["players"][0]["points"] == 0
    assert result["game"]["active"] == 1
    result, _ = domain.apply(room, room["hostId"], "SKIP_CHALLENGE", {}, clock=1500)
    assert result["game"]["players"][0]["points"] == 0


def test_score_race_closes_round_and_uses_points_instead_of_first_finisher():
    room = party(3, "score")
    room["game"]["active"] = 1
    room["game"]["players"][1]["position"] = 91
    room["game"]["players"][2]["points"] = 300
    second, third = room["game"]["players"][1:]
    room, _ = domain.apply(room, second["id"], "ROLL_DIE", {}, randbelow=lambda n: 0)
    assert room["finishing"] and room["phase"] == "playing"
    room, _ = domain.apply(room, third["id"], "ROLL_DIE", {}, randbelow=lambda n: 0)
    assert room["phase"] == "finished"
    assert room["game"]["winner"] == 2


def test_completed_classic_game_can_return_to_lobby_without_losing_names_or_characters():
    room = party()
    room["game"]["players"][0]["position"] = 91
    room, _ = domain.apply(room, room["hostId"], "ROLL_DIE", {}, randbelow=lambda n: 0)
    assert room["game"]["winner"] == 0
    assert room["game"]["players"][0]["points"] == 101
    room, _ = domain.apply(room, room["hostId"], "REQUEST_REMATCH", {})
    assert room["phase"] == "lobby"
    assert room["game"]["players"][0]["name"] == "Ada"
    assert room["game"]["players"][0]["position"] == 0
    assert not any(p["ready"] for p in room["game"]["players"])


def test_complete_eight_player_games_preserve_invariants():
    for mode in ("classic", "score"):
        room = party(8, mode)
        rolls = cycle([1, 2, 3, 4, 5, 0])
        for _ in range(2000):
            if room["phase"] == "finished":
                break
            active = room["game"]["players"][room["game"]["active"]]["id"]
            phase = room["game"]["phase"]
            action, payload = (
                ("ROLL_DIE", {})
                if phase == "ready"
                else ("CHOOSE", {"index": 1})
                if phase == "event"
                else ("SKIP_CHALLENGE", {})
            )
            room, _ = domain.apply(
                room, active, action, payload, randbelow=lambda n, rolls=rolls: next(rolls) % n
            )
            assert all(
                0 <= p["position"] <= 92 and p["points"] >= 0 for p in room["game"]["players"]
            )
        assert room["phase"] == "finished"
        assert len({p["character"] for p in room["game"]["players"]}) == 8
