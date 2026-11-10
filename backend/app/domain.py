"""Framework-free match rules. Persistence and transports call this aggregate boundary."""

from __future__ import annotations

import copy
import itertools
import secrets
import time
from uuid import uuid4

from .catalogue import CHARACTERS, MAPS

COLORS = ["#cbb17a", "#90c7ba", "#c49adc", "#e89783", "#8bbbd3", "#c5cb89", "#dfb5c8", "#d4a777"]


class GameError(Exception):
    def __init__(self, code: str, message: str, status: int = 409):
        self.code, self.message, self.status = code, message, status
        super().__init__(message)


def now_ms() -> int:
    return int(time.time() * 1000)


def clean_name(value: str) -> str:
    name = " ".join(value.split())
    if not 1 <= len(name) <= 24 or any(ord(c) < 32 for c in name):
        raise GameError("invalid_name", "Choose a player name between 1 and 24 characters.", 422)
    return name


def player(player_id: str, name: str, character: str, index: int) -> dict:
    return {
        "id": player_id,
        "name": clean_name(name),
        "character": character,
        "position": 0,
        "gold": 0,
        "clues": 0,
        "points": 0,
        "completed": 0,
        "ready": False,
        "tint": COLORS[index % 8],
    }


def initial_room(
    room_id: str, code: str, host_id: str, name: str, map_id: str, mode="classic", challenges=True
) -> dict:
    if map_id not in MAPS or mode not in ("classic", "score"):
        raise GameError("invalid_rules", "Choose a valid world and rule preset.", 422)
    game = {
        "version": 1,
        "map": map_id,
        "players": [player(host_id, name, "lyra", 0)],
        "active": 0,
        "turn": 1,
        "phase": "ready",
        "mystery": None,
        "challenge": None,
        "dice": 0,
        "journal": [],
        "winner": None,
    }
    return {
        "id": room_id,
        "code": code,
        "hostId": host_id,
        "phase": "lobby",
        "mode": mode,
        "challenges": challenges,
        "game": game,
        "turnDeadline": None,
        "finishing": False,
    }


def journal(game: dict, text: str) -> None:
    game["journal"].insert(0, {"text": text, "turn": game["turn"]})
    del game["journal"][50:]


def member(room: dict, actor: str) -> dict:
    result = next((p for p in room["game"]["players"] if p["id"] == actor), None)
    if not result:
        raise GameError("not_a_member", "This session does not belong to this room.", 403)
    return result


def join(room: dict, actor: str, name: str) -> dict:
    if room["phase"] != "lobby":
        raise GameError("already_started", "This expedition has already started.")
    players = room["game"]["players"]
    if len(players) >= 8:
        raise GameError("room_full", "This room already has eight adventurers.")
    name = clean_name(name)
    if any(p["name"].casefold() == name.casefold() for p in players):
        raise GameError("name_taken", "Another adventurer is already using that name.")
    used = {p["character"] for p in players}
    character = next(c for c in CHARACTERS if c not in used)
    result = player(actor, name, character, len(players))
    players.append(result)
    return result


def tile_kind(index: int) -> str:
    if index == 0:
        return "start"
    if index == 92:
        return "finish"
    return (
        "portal"
        if index % 17 == 0
        else "fortune"
        if index % 9 == 0
        else "treasure"
        if index % 7 == 0
        else "mystery"
        if index % 4 == 0
        else "path"
    )


def award(p: dict, points: int) -> None:
    p["points"] = max(0, p["points"] + points)


def finish(room: dict, active: int) -> bool:
    game, p = room["game"], room["game"]["players"][active]
    if p["position"] != 92:
        return False
    if not p.get("finishAwarded"):
        p["finishAwarded"] = True
        award(p, 100)
        journal(game, f"{p['name']} reached {MAPS[game['map']]['regions'][3]}! +100 points.")
    if room["mode"] == "score" and len(game["players"]) > 1:
        room["finishing"] = True
        return False
    game["phase"], game["winner"], room["phase"], room["turnDeadline"] = (
        "won",
        active,
        "finished",
        None,
    )
    return True


def end_turn(room: dict, clock: int) -> None:
    game = room["game"]
    game["mystery"], game["challenge"] = None, None
    if finish(room, game["active"]):
        return
    next_player = (game["active"] + 1) % len(game["players"])
    if room["finishing"] and next_player == 0:
        winner = max(
            range(len(game["players"])),
            key=lambda i: (game["players"][i]["points"], game["players"][i]["position"], -i),
        )
        game["phase"], game["winner"], room["phase"], room["turnDeadline"] = (
            "won",
            winner,
            "finished",
            None,
        )
        journal(game, f"{game['players'][winner]['name']} wins the score expedition!")
        return
    game["active"], game["turn"], game["phase"] = next_player, game["turn"] + 1, "ready"
    room["turnDeadline"] = clock + 120_000


def move(p: dict, steps: int) -> list[int]:
    previous = p["position"]
    p["position"] = max(0, min(92, previous + steps))
    direction = 1 if p["position"] >= previous else -1
    route = (
        list(range(previous + direction, p["position"] + direction, direction))
        if p["position"] != previous
        else []
    )
    award(p, max(0, p["position"] - previous))
    return route


def challenge(seed: int, clock: int) -> dict:
    kind = ["riddle", "count", "memory", "pattern", "balance", "rhythm"][seed % 6]
    result = {
        "id": str(uuid4()),
        "type": kind,
        "startedAt": clock,
        "deadline": clock + 30_000,
        "title": "",
        "prompt": "",
        "options": [],
        "_answer": None,
    }
    if kind == "riddle":
        result.update(
            title="The portal riddle",
            prompt="What has cities but no houses, forests but no trees, and rivers but no water?",
            options=["A map", "A dream", "A mirror", "A cloud"],
            _answer=0,
        )
    elif kind == "count":
        count = 7 + seed % 7
        result.update(
            title="Crystal count",
            prompt="How many crystals shine in the cavern?",
            symbols=["◆"] * count,
            options=[str(count - 1), str(count + 2), str(count), str(count + 1)],
            _answer=2,
        )
    elif kind == "memory":
        symbols = ["☾", "✦", "◇", "❀"]
        sequence = [symbols[(seed // (i + 1) + i) % 4] for i in range(4)]
        result.update(
            title="Rune memory",
            prompt="Remember the four runes, then repeat their order.",
            sequence=sequence,
            revealUntil=clock + 4000,
            options=symbols,
            _answer=sequence,
        )
    elif kind == "pattern":
        result.update(
            title="The forest pattern",
            prompt="Which rune completes the forest’s pattern?",
            symbols=["◇", "☾", "✦", "◇", "☾", "?"],
            options=["❀", "◇", "✦", "☾"],
            _answer=2,
        )
    elif kind == "balance":
        result.update(
            title="Bridge balance",
            prompt="Stop the lantern inside the golden zone.",
            target={"min": 40, "max": 65},
            period=2400,
        )
    elif kind == "rhythm":
        result.update(
            title="The bard’s rhythm",
            prompt="Tap four times on the glowing beat. The server checks your rhythm.",
            taps=[],
            beat=700,
        )
    return result


def apply(
    room: dict,
    actor: str,
    kind: str,
    payload: dict,
    *,
    clock: int | None = None,
    randbelow=secrets.randbelow,
) -> tuple[dict, list[dict]]:
    room = copy.deepcopy(room)
    clock = now_ms() if clock is None else clock
    p = member(room, actor)
    game, players = room["game"], room["game"]["players"]
    allowed = {
        "SELECT_CHARACTER": {"character", "tint"},
        "SET_NAME": {"name"},
        "SET_READY": {"ready"},
        "START_GAME": set(),
        "ROLL_DIE": set(),
        "CHOOSE": {"index"},
        "SUBMIT_CHALLENGE": {"answer"},
        "CHALLENGE_TAP": set(),
        "SKIP_CHALLENGE": set(),
        "REQUEST_REMATCH": set(),
        "SET_WORLD": {"map"},
        "SKIP_TURN": set(),
    }
    if kind not in allowed or set(payload) - allowed[kind]:
        raise GameError("invalid_command", "That command contains unsupported fields.", 422)
    host_actions = {"START_GAME", "REQUEST_REMATCH", "SET_WORLD", "SKIP_TURN"}
    if kind in host_actions and actor != room["hostId"]:
        raise GameError("host_only", "Only the host can do that.", 403)
    lobby_actions = {"SELECT_CHARACTER", "SET_NAME", "SET_READY", "START_GAME", "SET_WORLD"}
    if kind in lobby_actions and room["phase"] != "lobby":
        raise GameError("not_in_lobby", "The party is already on its expedition.")
    event = {"type": kind, "payload": {"actorId": actor}}
    if kind == "SELECT_CHARACTER":
        selected = payload.get("character")
        if not isinstance(selected, str) or selected not in CHARACTERS:
            raise GameError("invalid_character", "Choose a character from the roster.", 422)
        if any(v["id"] != actor and v["character"] == selected for v in players):
            raise GameError("character_taken", "Another player has already claimed this character.")
        tint = payload.get("tint", p["tint"])
        if tint != p["tint"] and tint not in {
            "#cbb17a",
            "#a88bcf",
            "#8fc5b3",
            "#8dbed2",
            "#da998d",
        }:
            raise GameError("invalid_tint", "Choose an available aura color.", 422)
        p["character"], p["ready"], p["tint"] = selected, False, tint
    elif kind == "SET_NAME":
        if not isinstance(payload.get("name"), str):
            raise GameError("invalid_name", "Player names must be text.", 422)
        name = clean_name(payload["name"])
        if any(v["id"] != actor and v["name"].casefold() == name.casefold() for v in players):
            raise GameError("name_taken", "That player name is already in this room.")
        p["name"] = name
    elif kind == "SET_READY":
        if not isinstance(payload.get("ready"), bool):
            raise GameError("invalid_ready", "Ready must be true or false.", 422)
        p["ready"] = payload["ready"]
    elif kind == "SET_WORLD":
        if not isinstance(payload.get("map"), str) or payload.get("map") not in MAPS:
            raise GameError("invalid_world", "Choose one of the available worlds.", 422)
        game["map"] = payload["map"]
        for participant in players:
            participant["ready"] = False
    elif kind == "START_GAME":
        if not all(v["ready"] for v in players):
            raise GameError("not_ready", "Every player must choose a character and mark ready.")
        room["phase"], room["turnDeadline"] = "playing", clock + 120_000
        journal(game, f"The party begins its expedition through {MAPS[game['map']]['name']}.")
    elif kind == "REQUEST_REMATCH":
        if room["phase"] != "finished":
            raise GameError("not_finished", "Finish this expedition before requesting a rematch.")
        room["phase"], room["finishing"], room["turnDeadline"] = "lobby", False, None
        game.update(
            active=0,
            turn=1,
            phase="ready",
            mystery=None,
            challenge=None,
            dice=0,
            journal=[],
            winner=None,
        )
        for v in players:
            v.update(position=0, gold=0, clues=0, points=0, completed=0, ready=False)
            v.pop("finishAwarded", None)
    else:
        if room["phase"] != "playing":
            raise GameError("not_playing", "Start an expedition first.")
        active = game["active"]
        if players[active]["id"] != actor and kind != "SKIP_TURN":
            raise GameError("wrong_turn", "It is another player’s turn.", 403)
        if kind == "ROLL_DIE":
            if game["phase"] != "ready":
                raise GameError("wrong_phase", "Resolve the current encounter first.")
            die = randbelow(6) + 1
            game["dice"] = die
            route = move(p, die)
            event["type"] = "DIE_ROLLED"
            event["payload"].update(dice=die, route=route, playerIndex=active)
            journal(game, f"{p['name']} rolled {die} and reached tile {p['position'] + 1}.")
            if finish(room, active):
                return room, [event]
            tile = tile_kind(p["position"])
            if tile == "mystery":
                if room["challenges"] and p["position"] % 8 == 0:
                    game["phase"], game["challenge"] = (
                        "challenge",
                        challenge(randbelow(100_000), clock),
                    )
                else:
                    game["phase"], game["mystery"] = (
                        "event",
                        randbelow(len(MAPS[game["map"]]["encounters"])),
                    )
                room["turnDeadline"] = clock + 30_000
            else:
                if tile == "treasure":
                    p["gold"] += 3
                    award(p, 30)
                    journal(game, f"{p['name']} found a treasure: 3 gold and 30 points.")
                elif tile == "fortune":
                    p["gold"] += 2
                    p["clues"] += 1
                    award(p, 35)
                    journal(game, f"Fortune favors {p['name']}: 2 gold, a clue and 35 points.")
                elif tile == "portal":
                    route.extend(move(p, 3))
                    journal(game, f"{p['name']} takes an ancient portal three tiles forward.")
                end_turn(room, clock)
        elif kind == "CHOOSE":
            if game["phase"] != "event":
                raise GameError("wrong_phase", "There is no mystery to resolve.")
            index = payload.get("index")
            if type(index) is not int or index not in (0, 1):
                raise GameError("invalid_choice", "Choose one of the offered options.", 422)
            story = MAPS[game["map"]]["encounters"][game["mystery"]]
            choice = story["choices"][index]
            if p["gold"] + choice["gold"] < 0:
                raise GameError("insufficient_gold", "You do not have enough gold for that choice.")
            p["gold"] += choice["gold"]
            p["clues"] += choice["clues"]
            award(p, max(0, choice["gold"]) * 10 + choice["clues"] * 20)
            route = move(p, choice["move"])
            event["payload"].update(route=route, playerIndex=active)
            journal(game, f"{p['name']} — {story['title']}: {choice['label']}.")
            end_turn(room, clock)
        elif kind in {"SUBMIT_CHALLENGE", "CHALLENGE_TAP", "SKIP_CHALLENGE"}:
            card = game.get("challenge")
            if game["phase"] != "challenge" or not card:
                raise GameError("wrong_phase", "There is no active challenge.")
            if kind == "CHALLENGE_TAP" and card["type"] == "rhythm":
                taps = card["taps"]
                if len(taps) < 4:
                    taps.append(clock - card["startedAt"])
                return room, [event]
            if kind == "CHALLENGE_TAP":
                raise GameError("wrong_challenge", "This challenge does not use rhythm taps.")
            if (
                kind == "SUBMIT_CHALLENGE"
                and card["type"] == "memory"
                and clock < card["revealUntil"]
            ):
                raise GameError("still_revealing", "Wait for the memory runes to disappear.")
            answer = payload.get("answer")
            success = False
            if kind != "SKIP_CHALLENGE" and clock <= card["deadline"]:
                if card["type"] == "balance":
                    phase = ((clock - card["startedAt"]) % card["period"]) / card["period"]
                    value = (1 - abs(phase * 2 - 1)) * 100
                    success = card["target"]["min"] <= value <= card["target"]["max"]
                elif card["type"] == "rhythm":
                    taps = card["taps"]
                    success = len(taps) == 4 and all(
                        abs((b - a) - card["beat"]) <= 220 for a, b in itertools.pairwise(taps)
                    )
                else:
                    success = type(answer) is type(card["_answer"]) and answer == card["_answer"]
            if success:
                p["completed"] += 1
                p["gold"] += 2
                award(p, 50)
            journal(
                game,
                f"{p['name']} {'completed' if success else 'passed'} {card['title']}."
                + (" +50 points and 2 gold!" if success else " The adventure continues."),
            )
            event["payload"].update(success=success, playerIndex=active)
            end_turn(room, clock)
        elif kind == "SKIP_TURN":
            journal(game, f"The host passed {players[active]['name']}’s turn.")
            end_turn(room, clock)
    return room, [event]


def public_room(room: dict, connected: set[str] | None = None) -> dict:
    def clean(value):
        if isinstance(value, dict):
            return {key: clean(item) for key, item in value.items() if not key.startswith("_")}
        if isinstance(value, list):
            return [clean(item) for item in value]
        return value

    result = clean(room)
    for p in result["game"]["players"]:
        p["connected"] = p["id"] in (connected or set())
    return result
