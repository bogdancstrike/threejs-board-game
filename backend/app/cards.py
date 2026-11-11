"""Versioned party decks. The private draw pile is persisted with the room."""

import copy
import json
import secrets
from pathlib import Path

CATALOGUE = json.loads((Path(__file__).parents[1] / "data" / "party-cards.json").read_text())
LEVELS = {level["id"]: level for level in CATALOGUE["levels"]}
DECKS = CATALOGUE["decks"]


def draw(room, randbelow=secrets.randbelow):
    level = room.get("difficulty", "soft")
    pile = room.get("_partyDeck")
    if not pile or pile["level"] != level or not pile["remaining"]:
        pile = {"level": level, "remaining": list(range(len(DECKS[level])))}
        room["_partyDeck"] = pile
    index = pile["remaining"].pop(randbelow(len(pile["remaining"])))
    return copy.deepcopy(DECKS[level][index])


def begin(room, p, clock, stop=None, randbelow=secrets.randbelow):
    """Party cards use the existing turn-owned road encounter lifecycle."""
    card = draw(room, randbelow)
    prompt = card["solo"] if len(room["game"]["players"]) == 1 else card["prompt"]
    room["game"].update(
        phase="road",
        road={
            "tile": p["position"],
            "kind": "dare",
            "icon": "sparkles",
            "title": card["title"],
            "description": prompt,
            "dare": None,
            "partyCard": card,
            "sourceTitle": stop["title"] if stop else "A card on the path",
            "choices": [
                {
                    "key": "dare",
                    "label": "Completed the card",
                    "detail": "+25 points and +1 gold. Self-reported; only willing participants.",
                },
                {
                    "key": "alternative",
                    "label": "Completed the neutral alternative",
                    "detail": "+25 points and +1 gold. The same reward, with a creative board-game task.",
                },
                {
                    "key": "leave",
                    "label": "Pass this card",
                    "detail": "No penalty, no explanation needed.",
                },
            ],
            "deadline": clock + card["seconds"] * 1000,
        },
    )
    room["turnDeadline"] = clock + card["seconds"] * 1000
    return True
