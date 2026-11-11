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


@pytest.mark.parametrize("kind", range(10))
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
                else ("RESOLVE_ROAD", {"choice": room["game"]["road"]["choices"][-1]["key"]})
                if phase == "road"
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


def land(room, tile, die=1):
    p = room["game"]["players"][room["game"]["active"]]
    p["position"], p["furthest"] = tile - die, tile - die
    return domain.apply(room, p["id"], "ROLL_DIE", {}, clock=1000, randbelow=lambda n: die - 1)[0]


@pytest.mark.parametrize(
    "tile,kind",
    [
        (6, "box"),
        (11, "hazard"),
        (16, "minigame"),
        (23, "dare"),
        (29, "dragon"),
        (33, "shrine"),
        (53, "curse"),
        (69, "camp"),
    ],
)
def test_eight_road_encounter_categories_are_playable(tile, kind):
    room = land(party(), tile)
    assert room["game"]["phase"] == "road"
    assert room["game"]["road"]["kind"] == kind
    assert room["game"]["road"]["choices"]
    assert room["turnDeadline"] == (121000 if kind == "dare" else 46000)


def test_dragon_trial_failure_retreats_and_ward_absorbs_it():
    room = land(party(), 29)
    actor = room["hostId"]
    room, _ = domain.apply(
        room, actor, "RESOLVE_ROAD", {"choice": "trial"}, clock=2000, randbelow=lambda n: 0
    )
    assert room["game"]["challenge"]["context"] == "dragon"
    assert room["game"]["challenge"]["rewardPoints"] == 75
    failed, event = domain.apply(room, actor, "SUBMIT_CHALLENGE", {"answer": 3}, clock=3000)
    assert failed["game"]["players"][0]["position"] == 26
    assert event[0]["payload"]["route"] == [28, 27, 26]
    room["game"]["players"][0]["wards"] = 1
    protected, _ = domain.apply(room, actor, "SKIP_CHALLENGE", {}, clock=3000)
    assert protected["game"]["players"][0]["position"] == 29
    assert protected["game"]["players"][0]["wards"] == 0
    won, _ = domain.apply(room, actor, "SUBMIT_CHALLENGE", {"answer": 0}, clock=3000)
    assert won["game"]["players"][0]["position"] == 31
    assert won["game"]["players"][0]["gold"] == 4


@pytest.mark.parametrize("draw,outcome", [(0, "gold"), (1, "gold"), (2, "mimic"), (3, "game")])
def test_box_uses_server_draw_and_bounded_outcomes(draw, outcome):
    room = land(party(), 6)
    room, _ = domain.apply(
        room,
        room["hostId"],
        "RESOLVE_ROAD",
        {"choice": "open"},
        clock=2000,
        randbelow=lambda n: draw,
    )
    p = room["game"]["players"][0]
    if outcome == "gold":
        assert p["gold"] == 4
    elif outcome == "mimic":
        assert p["gold"] == 0 and p["points"] == 0
    else:
        assert room["game"]["phase"] == "challenge"


def test_road_dare_optout_and_rewards_are_explicit_and_bounded():
    room = land(party(), 23)
    actor = room["hostId"]
    passed, _ = domain.apply(room, actor, "RESOLVE_ROAD", {"choice": "leave"}, clock=2000)
    assert passed["game"]["players"][0]["points"] == 1
    dared, _ = domain.apply(room, actor, "RESOLVE_ROAD", {"choice": "dare"}, clock=2000)
    assert dared["game"]["players"][0]["points"] == 26
    assert dared["game"]["players"][0]["gold"] == 1
    with pytest.raises(domain.GameError):
        domain.apply(room, actor, "RESOLVE_ROAD", {"choice": "reward_me"})


def test_hex_reduces_only_next_roll_and_progress_cannot_be_farmed():
    room = land(party(1), 53)
    room, _ = domain.apply(room, room["hostId"], "RESOLVE_ROAD", {"choice": "hex"}, clock=2000)
    room, _ = domain.apply(room, room["hostId"], "ROLL_DIE", {}, clock=3000, randbelow=lambda n: 0)
    assert room["game"]["players"][0]["position"] == 54
    assert room["game"]["players"][0]["hex"] == 0
    p = room["game"]["players"][0]
    before = p["points"]
    domain.move(p, -3)
    domain.move(p, 3)
    assert p["points"] == before


def test_hotseat_controller_plays_all_seats_without_granting_remote_impersonation():
    room = party(3)
    room["hotseat"] = True
    room["game"]["active"] = 1
    room, _ = domain.apply(room, room["hostId"], "ROLL_DIE", {}, randbelow=lambda n: 0)
    assert room["game"]["players"][1]["position"] == 1
    room["phase"] = "lobby"
    second = room["game"]["players"][1]["id"]
    room, _ = domain.apply(
        room, room["hostId"], "SELECT_CHARACTER", {"playerId": second, "character": "orion"}
    )
    assert room["game"]["players"][1]["character"] == "orion"
    room["hotseat"] = False
    with pytest.raises(domain.GameError):
        domain.apply(
            room, room["hostId"], "SELECT_CHARACTER", {"playerId": second, "character": "kael"}
        )


def test_maze_rejects_teleport_and_alchemy_checks_values_on_server():
    room = party()
    room["game"].update(phase="challenge", challenge=domain.challenge(8, 1000))
    cheated, _ = domain.apply(
        room, room["hostId"], "SUBMIT_CHALLENGE", {"answer": [0, 24]}, clock=2000
    )
    assert cheated["game"]["players"][0]["completed"] == 0
    path = [0, 1, 6, 5, 6, 1, 0, 5]  # valid moves but not the goal
    failed, _ = domain.apply(room, room["hostId"], "SUBMIT_CHALLENGE", {"answer": path}, clock=2000)
    assert failed["game"]["players"][0]["completed"] == 0
    won, _ = domain.apply(
        room,
        room["hostId"],
        "SUBMIT_CHALLENGE",
        {"answer": [0, 1, 6, 11, 12, 13, 18, 23, 24]},
        clock=2000,
    )
    assert won["game"]["players"][0]["completed"] == 1
    room["game"]["challenge"] = domain.challenge(9, 1000)
    good, _ = domain.apply(
        room, room["hostId"], "SUBMIT_CHALLENGE", {"answer": [0, 1, 2]}, clock=2000
    )
    assert good["game"]["players"][0]["completed"] == 1


def test_memory_cannot_be_submitted_during_reveal_and_wards_are_capped():
    room = party()
    card = domain.challenge(2, 1000)
    room["game"].update(phase="challenge", challenge=card)
    with pytest.raises(domain.GameError, match="disappear"):
        domain.apply(
            room, room["hostId"], "SUBMIT_CHALLENGE", {"answer": card["sequence"]}, clock=2000
        )
    room = land(party(), 33)
    room["game"]["players"][0]["wards"] = 2
    room, _ = domain.apply(room, room["hostId"], "RESOLVE_ROAD", {"choice": "ward"})
    assert room["game"]["players"][0]["wards"] == 2


@pytest.mark.parametrize(
    "kind,payload",
    [
        ("SELECT_CHARACTER", {"character": "missing"}),
        ("SELECT_CHARACTER", {"character": "lyra", "tint": []}),
        ("SET_NAME", {"name": {}}),
        ("SET_NAME", {"name": "Player 2"}),
        ("SET_READY", {"ready": "yes"}),
        ("SET_WORLD", {"map": "missing"}),
        ("REQUEST_REMATCH", {}),
        ("FLY_TO_FINISH", {}),
    ],
)
def test_lobby_rejects_invalid_changes_without_mutating_the_party(kind, payload):
    room = party()
    room["phase"] = "lobby"
    before = deepcopy(room)
    with pytest.raises(domain.GameError):
        domain.apply(room, room["hostId"], kind, payload)
    assert room == before


def test_valid_name_aura_world_changes_and_lobby_phase_lock():
    room = party()
    room["phase"] = "lobby"
    actor = room["hostId"]
    room, _ = domain.apply(room, actor, "SET_NAME", {"name": "  Captain   Rowan "})
    room, _ = domain.apply(
        room, actor, "SELECT_CHARACTER", {"character": "orion", "tint": "#8fc5b3"}
    )
    room, _ = domain.apply(room, actor, "SET_WORLD", {"map": "dragonkind"})
    assert room["game"]["players"][0]["name"] == "Captain Rowan"
    assert room["game"]["players"][0]["tint"] == "#8fc5b3"
    assert room["game"]["map"] == "dragonkind"
    assert not any(p["ready"] for p in room["game"]["players"])
    room["phase"] = "playing"
    with pytest.raises(domain.GameError):
        domain.apply(room, actor, "SET_NAME", {"name": "After start"})


def test_room_capacity_membership_and_unique_names():
    room = party(8)
    room["phase"] = "lobby"
    with pytest.raises(domain.GameError, match="eight"):
        domain.join(room, str(uuid4()), "Ninth")
    with pytest.raises(domain.GameError, match="belong"):
        domain.member(room, str(uuid4()))
    room = party(2)
    with pytest.raises(domain.GameError, match="started"):
        domain.join(room, str(uuid4()), "Late")
    room["phase"] = "lobby"
    with pytest.raises(domain.GameError, match="name"):
        domain.join(room, str(uuid4()), "ADA")
    room["hotseat"] = True
    with pytest.raises(domain.GameError):
        domain.apply(room, room["hostId"], "SET_NAME", {"playerId": {}, "name": "Bad"})
    with pytest.raises(domain.GameError):
        domain.initial_room(str(uuid4()), "ABC234", str(uuid4()), "Name", "missing")


@pytest.mark.parametrize("tile,key,resource", [(29, "pay", "gold"), (11, "clue", "clues")])
def test_safe_passage_requires_and_consumes_resources(tile, key, resource):
    room = land(party(), tile)
    actor = room["hostId"]
    with pytest.raises(domain.GameError):
        domain.apply(room, actor, "RESOLVE_ROAD", {"choice": key})
    room["game"]["players"][0][resource] = 3 if resource == "gold" else 1
    result, _ = domain.apply(room, actor, "RESOLVE_ROAD", {"choice": key})
    assert result["game"]["players"][0][resource] == 0
    assert result["game"]["players"][0]["position"] == tile


def test_shrine_study_camp_recovery_and_failed_dangers():
    room = land(party(), 33)
    result, _ = domain.apply(room, room["hostId"], "RESOLVE_ROAD", {"choice": "study"})
    assert result["game"]["players"][0]["clues"] == 1
    room = land(party(), 69)
    room["game"]["players"][0]["hex"] = 2
    result, _ = domain.apply(room, room["hostId"], "RESOLVE_ROAD", {"choice": "rest"})
    assert result["game"]["players"][0]["gold"] == 2
    assert result["game"]["players"][0]["hex"] == 0
    for tile in [11, 53]:
        room = land(party(), tile)
        room, _ = domain.apply(
            room,
            room["hostId"],
            "RESOLVE_ROAD",
            {"choice": "trial"},
            clock=2000,
            randbelow=lambda n: 0,
        )
        assert room["game"]["phase"] == "challenge"
        result, _ = domain.apply(room, room["hostId"], "SKIP_CHALLENGE", {}, clock=3000)
        p = result["game"]["players"][0]
        assert p["position"] == (9 if tile == 11 else 53)
        assert p["hex"] == (2 if tile == 53 else 0)
        assert p["points"] >= 0
    with pytest.raises(domain.GameError):
        domain.apply(party(), room["hostId"], "RESOLVE_ROAD", {"choice": "rest"})


def test_rhythm_uses_server_taps_and_wrong_phase_actions_are_rejected():
    room = party()
    actor = room["hostId"]
    for kind in ["CHOOSE", "SUBMIT_CHALLENGE", "CHALLENGE_TAP", "RESOLVE_ROAD"]:
        with pytest.raises(domain.GameError):
            domain.apply(room, actor, kind, {"index": 1} if kind == "CHOOSE" else {})
    room["game"].update(phase="challenge", challenge=domain.challenge(5, 1000))
    for clock in [1100, 1800, 2500, 3200, 3900]:
        room, _ = domain.apply(room, actor, "CHALLENGE_TAP", {}, clock=clock)
    assert len(room["game"]["challenge"]["taps"]) == 4
    result, _ = domain.apply(room, actor, "SUBMIT_CHALLENGE", {}, clock=4000)
    assert result["game"]["players"][0]["completed"] == 1
    room["game"]["challenge"] = domain.challenge(0, 1000)
    with pytest.raises(domain.GameError):
        domain.apply(room, actor, "CHALLENGE_TAP", {}, clock=2000)
    with pytest.raises(domain.GameError):
        domain.apply(room, actor, "ROLL_DIE", {})


def test_story_purchase_is_atomic_and_host_can_advance_a_disconnected_turn():
    room = party()
    actor = room["hostId"]
    # Find an authored story with a purchase, rather than assuming catalogue order.
    stories = domain.MAPS[room["game"]["map"]]["encounters"]
    index, choice_index = next(
        (i, j)
        for i, story in enumerate(stories)
        for j, c in enumerate(story["choices"])
        if c["gold"] < 0
    )
    room["game"].update(phase="event", mystery=index)
    before = deepcopy(room)
    with pytest.raises(domain.GameError):
        domain.apply(room, actor, "CHOOSE", {"index": choice_index})
    assert room == before
    room, _ = domain.apply(room, actor, "SKIP_TURN", {})
    assert room["game"]["active"] == 1 and room["game"]["phase"] == "ready"
