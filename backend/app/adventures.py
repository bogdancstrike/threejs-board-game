"""Road encounters: disclosed risks, server outcomes and bounded game-only setbacks."""

from __future__ import annotations

import secrets

from . import cards
from .catalogue import CATALOGUE

STOPS = {stop["tile"]: stop for stop in CATALOGUE.get("roadStops", [])}


def choice(key, label, detail):
    return {"key": key, "label": label, "detail": detail}


def draw_card(room, p, clock, randbelow=secrets.randbelow):
    """Every Adventure tile between the start and the finish holds a party card."""
    if not room["challenges"] or not 0 < p["position"] < 92:
        return False
    return cards.begin(room, p, clock, None, randbelow)


def begin(room, p, clock, randbelow=secrets.randbelow):
    """Named roadside stops keep their own encounter, once per player."""
    stop = STOPS.get(p["position"])
    if not stop or not room["challenges"] or p["position"] in p.get("visitedStops", []):
        return False
    p.setdefault("visitedStops", []).append(p["position"])
    if stop["kind"] == "dare":
        return cards.begin(room, p, clock, stop, randbelow)
    kind = stop["kind"]
    options = []
    if kind == "dragon":
        options = [
            choice(
                "trial",
                "Face the guardian",
                "Win: +75 points, +4 gold, forward 2. Fail: back 3 and lose up to 2 gold.",
            ),
            choice("pay", "Offer a golden tribute", "Pay 3 gold and pass safely."),
            choice("retreat", "Take the quiet detour", "Move back 1 tile. No score loss."),
        ]
    elif kind == "box":
        options = [
            choice(
                "open",
                "Open the mystery box",
                "Server draws: 50% treasure, 25% mimic (−20 points, up to −2 gold), 25% mini-game.",
            ),
            choice("leave", "Leave it sealed", "Continue without reward or penalty."),
        ]
    elif kind == "hazard":
        options = [
            choice(
                "trial",
                "Brave the crossing",
                "Win: +50 points and +2 gold. Fail: back 2 and −15 points.",
            ),
            choice("clue", "Use a clue to find safe footing", "Spend 1 clue and pass safely."),
            choice("retreat", "Follow the safe detour", "Move back 1 tile. No score loss."),
        ]
    elif kind == "curse":
        options = [
            choice(
                "trial",
                "Break the hex",
                "Win: +50 points and +2 gold. Fail: your next roll is reduced by 2 (minimum 1).",
            ),
            choice(
                "hex",
                "Carry the hex for a clue",
                "+1 clue and +20 points. Next roll reduced by 2 (minimum 1).",
            ),
        ]
    elif kind == "shrine":
        options = [
            choice(
                "ward",
                "Receive a protective ward",
                "Block the next danger penalty. Maximum 2 wards.",
            ),
            choice("study", "Study the shrine", "+1 clue and +20 points."),
        ]
    elif kind == "camp":
        options = [
            choice("rest", "Rest and mend your pack", "+2 gold. Clear your next-roll hex."),
            choice(
                "ward",
                "Prepare a protective ward",
                "Block the next danger penalty. Maximum 2 wards.",
            ),
        ]
    else:
        options = [
            choice(
                "trial",
                "Play the road spirit’s game",
                "Win: +50 points and +2 gold. No failure penalty.",
            ),
            choice("leave", "Keep exploring", "No reward or penalty."),
        ]
    room["game"].update(
        phase="road",
        road={
            **stop,
            "choices": options,
            "dare": None,
            "deadline": clock + 45_000,
        },
    )
    room["turnDeadline"] = clock + 45_000
    return True


def setback(room, p, kind):
    from . import domain

    if p.get("wards", 0):
        p["wards"] -= 1
        domain.journal(room["game"], f"{p['name']}’s protective ward absorbed the danger.")
        return []
    if kind == "dragon":
        p["gold"] = max(0, p["gold"] - 2)
        domain.journal(
            room["game"], f"The dragon drives {p['name']} back 3 tiles and takes up to 2 gold."
        )
        return domain.move(p, -3)
    if kind == "hazard":
        domain.award(p, -15)
        domain.journal(room["game"], f"{p['name']} slips back 2 tiles and loses up to 15 points.")
        return domain.move(p, -2)
    if kind == "curse":
        p["hex"] = 2
        domain.journal(room["game"], f"A hex slows {p['name']}’s next roll by 2 (minimum 1).")
    if kind == "box":
        p["gold"] = max(0, p["gold"] - 2)
        domain.award(p, -20)
        domain.journal(
            room["game"], f"A mimic nips {p['name']}’s purse: up to 2 gold and 20 points lost."
        )
    return []


def resolve(room, p, key, clock, randbelow):
    from . import domain

    card = room["game"].get("road")
    if not card or room["game"]["phase"] != "road":
        raise domain.GameError("wrong_phase", "There is no road encounter to resolve.")
    if not any(c["key"] == key for c in card["choices"]):
        raise domain.GameError("invalid_choice", "Choose one of the offered actions.", 422)
    game, route = room["game"], []
    kind = card["kind"]
    if key == "open":
        outcome = randbelow(4)
        if outcome < 2:
            p["gold"] += 4
            domain.award(p, 40)
            domain.journal(game, f"{p['name']} opens {card['title']}: 4 gold and 40 points!")
        elif outcome == 2:
            route = setback(room, p, "box")
        else:
            key = "trial"
    if key == "trial":
        challenge = domain.challenge(randbelow(100_000), clock)
        challenge.update(
            context=kind,
            sourceTitle=card["title"],
            rewardPoints=75 if kind == "dragon" else 50,
            rewardGold=4 if kind == "dragon" else 2,
            winMove=2 if kind == "dragon" else 0,
            failure=next(
                c["detail"].split("Fail: ")[-1]
                for c in card["choices"]
                if c["key"] in {"trial", "open"}
            )
            if kind in {"dragon", "hazard", "curse"}
            else "No penalty.",
        )
        if kind == "hazard":
            challenge = {
                **domain.challenge(4, clock),
                **{
                    k: v
                    for k, v in challenge.items()
                    if k
                    in {
                        "context",
                        "sourceTitle",
                        "rewardPoints",
                        "rewardGold",
                        "winMove",
                        "failure",
                    }
                },
            }
        game.update(phase="challenge", challenge=challenge, road=None)
        room["turnDeadline"] = clock + 30_000
        domain.journal(game, f"{p['name']} accepts the trial at {card['title']}.")
        return route
    if key == "pay":
        if p["gold"] < 3:
            raise domain.GameError("insufficient_gold", "The guardian asks for 3 gold.")
        p["gold"] -= 3
    elif key == "clue":
        if p["clues"] < 1:
            raise domain.GameError("insufficient_clues", "You need one clue for this route.")
        p["clues"] -= 1
    elif key == "retreat":
        route = domain.move(p, -1)
    elif key == "hex":
        p["clues"] += 1
        domain.award(p, 20)
        p["hex"] = 2
    elif key in {"dare", "alternative"}:
        domain.award(p, 25)
        p["gold"] += 1
    elif key == "ward":
        p["wards"] = min(2, p.get("wards", 0) + 1)
    elif key == "study":
        p["clues"] += 1
        domain.award(p, 20)
    elif key == "rest":
        p["gold"] += 2
        p["hex"] = 0
    domain.journal(
        game,
        f"{p['name']} — {card['title']}: {next(c['label'] for c in card['choices'] if c['key'] == key)}.",
    )
    domain.end_turn(room, clock)
    return route
