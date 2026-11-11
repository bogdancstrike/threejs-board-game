"""Card mechanics: twenty ways to play a party card, chosen per game and per tile.

Every Adventure tile draws a mechanic from the room's private game plan. A
mechanic wraps one or more cards from the room deck and may need server
randomness (a spun bottle, a wheel, a coin, a bet). All random outcomes are
drawn here, on the server, and revealed to every player at once.
"""

from __future__ import annotations

import copy
import secrets

from . import cards

# id: (name, icon, short rules shown on the card)
MECHANICS = {
    "classic": ("Party card", "sparkles", "Do the card, play the board-game version, or pass."),
    "pick": ("Pick a card, any card", "layers", "Three cards lie face down. Choose one."),
    "risk": ("Risk or reveal", "scale", "Risk a dare or reveal a truth. Choose before you see it."),
    "bottle": ("Spin the bottle", "rotate-cw", "The bottle chooses who this card is about."),
    "heaven": ("Seven minutes", "door-open", "The bottle picks your partner for seven minutes."),
    "duel": (
        "Dare duel",
        "swords",
        "You and a random rival both do the card. The table crowns a winner.",
    ),
    "double": ("Double or nothing", "coins", "Double reward if you do it. Passing costs points."),
    "bet": (
        "The bet",
        "dice-5",
        "Call higher or lower on a hidden die. Lose and the card is yours.",
    ),
    "wheel": ("Wheel of misfortune", "ferris-wheel", "The wheel decides your fate."),
    "coin": ("Coin flip", "circle-dollar-sign", "Heads you do it. Tails you choose who does."),
    "hotseat": ("Hot seat", "flame", "After the card, everyone asks you one question."),
    "group": ("Everybody", "users", "The whole table plays this card, starting with you."),
    "chain": ("Chain reaction", "link", "Do the card, then pass it to someone who must do it too."),
    "mirror": ("Mirror, mirror", "copy", "A random player must copy everything you do."),
    "jackpot": ("Jackpot", "gem", "Triple reward on this card."),
    "rush": ("Beat the clock", "timer", "Thirty seconds. Go."),
    "nominate": ("Nominate", "hand", "Choose who has to do this card."),
    "secret": ("Secret card", "eye-off", "Act it out without reading it aloud. The table guesses."),
    "encore": ("Encore", "repeat", "Do the card, then roll again."),
    "steal": (
        "Pickpocket",
        "hand-coins",
        "Steal up to 2 gold from a random player, then do the card.",
    ),
}
WHEEL = [
    ("+40 points", "points+"),
    ("−20 points", "points-"),
    ("Forward 2 tiles", "forward"),
    ("Back 2 tiles", "back"),
    ("Everyone plays a card", "group"),
    ("Draw a card", "card"),
    ("Give a card away", "give"),
    ("Roll again", "encore"),
]
SEVEN_MINUTES = {
    "soft": "Seven minutes of stories: you and {target} leave the table and come back with a joint tale to perform.",
    "drinking": "Seven minutes as drinking buddies: you and {target} match every sip until seven minutes pass.",
    "teasing": "Seven minutes of sweet talk: you and {target} sit together holding hands and trade compliments.",
    "spicy": "Seven minutes in heaven: you and {target} spend seven minutes alone in another room.",
    "hot": "Seven minutes in heaven: you and {target} spend seven minutes alone in another room. No rules.",
}


def bounded(randbelow):
    """Clamp any injected random source to [0, n)."""
    return lambda n: randbelow(n) % n if n > 0 else 0


def choice(key, label, detail=""):
    return {"key": key, "label": label, "detail": detail}


def plan(randbelow=secrets.randbelow):
    randbelow = bounded(randbelow)
    """A fresh, private game plan: which mechanics and mini-games appear, and how often."""
    pool = [m for m in MECHANICS if m != "classic"]
    for i in range(len(pool) - 1, 0, -1):  # Fisher–Yates; terminates for any source
        j = randbelow(i + 1)
        pool[i], pool[j] = pool[j], pool[i]
    chosen = pool[: 10 + randbelow(len(pool) - 9)]  # 10..19 special mechanics
    weights = {m: 1 + randbelow(4) for m in chosen}
    weights["classic"] = 3 + randbelow(5)
    minigames = sorted({randbelow(10) for _ in range(4 + randbelow(7))})
    return {"mechanics": weights, "minigames": minigames}


def pick_mechanic(room, randbelow):
    randbelow = bounded(randbelow)
    weights = room.setdefault("_plan", plan(randbelow))["mechanics"]
    roll = randbelow(sum(weights.values()))
    for mechanic, weight in weights.items():
        roll -= weight
        if roll < 0:
            return mechanic
    return "classic"  # pragma: no cover - unreachable with positive weights


def others(room, p):
    return [v for v in room["game"]["players"] if v["id"] != p["id"]]


def random_other(room, p, randbelow):
    randbelow = bounded(randbelow)
    pool = others(room, p)
    return pool[randbelow(len(pool))]["name"] if pool else "the player on your left"


def personalise(card, target):
    """Point a card at a named player instead of its generic target phrase."""
    card = copy.deepcopy(card)
    phrase = card.get("target")
    if phrase:
        for text in (phrase[0].upper() + phrase[1:], phrase):
            card["prompt"] = card["prompt"].replace(text, target)
        card["solo"] = card["prompt"]
    return card


def draw_kind(room, randbelow, reveal):
    randbelow = bounded(randbelow)
    """Draw until a card of the requested kind appears (bounded)."""
    card = cards.draw(room, randbelow)
    for _ in range(40):
        if bool(card.get("reveal")) == reveal:
            break
        card = cards.draw(room, randbelow)
    return card


def card_choices(card, multiplier=1, pass_cost=0):
    points, gold = card["points"] * multiplier, card["gold"] * multiplier
    return [
        choice("dare", "Done it", f"+{points} points · +{gold} gold"),
        choice(
            "alternative",
            "Did the board-game version",
            f"+{card['points']} points · +{card['gold']} gold",
        ),
        choice("leave", "Pass", f"−{pass_cost} points" if pass_cost else "No reward"),
    ]


def reveal_card(room, road, card):
    solo = len(room["game"]["players"]) == 1
    road.update(
        stage="card",
        partyCard=card,
        title=card["title"],
        description=card["solo"] if solo else card["prompt"],
    )
    if road["mechanic"]["id"] == "duel" and road.get("rival"):
        road["choices"] = [
            choice("duel-win", "I won the duel", "+50 points · +2 gold"),
            choice("duel-lose", f"{road['rival']} won", f"{road['rival']} gets +50 points"),
            choice("leave", "Call it off", "No reward"),
        ]
    else:
        road["choices"] = card_choices(card, road["multiplier"], road["passCost"])


def begin(room, p, clock, stop=None, randbelow=secrets.randbelow, mechanic=None):
    """Start a party-card encounter for player ``p`` on their current tile."""
    randbelow = bounded(randbelow)
    mechanic = mechanic or pick_mechanic(room, randbelow)
    name, icon, rules = MECHANICS[mechanic]
    level = room.get("difficulty", "soft")
    seconds = 120
    road = {
        "tile": p["position"],
        "kind": "dare",
        "icon": icon,
        "dare": None,
        "mechanic": {"id": mechanic, "name": name, "icon": icon, "rules": rules},
        "sourceTitle": stop["title"] if stop else "A card on the path",
        "stage": "card",
        "banner": "",
        "multiplier": 1,
        "passCost": 0,
        "encore": False,
    }
    if mechanic == "wheel":
        return spin_wheel(room, p, clock, road, randbelow)
    card = None
    if mechanic == "pick":
        road["_hand"] = [cards.draw(room, randbelow) for _ in range(3)]
        road.update(stage="choose", title=name, description=rules)
        road["choices"] = [choice(f"pick{i}", f"Card {i + 1}") for i in range(3)]
    elif mechanic == "risk":
        road["_hand"] = [draw_kind(room, randbelow, False), draw_kind(room, randbelow, True)]
        road.update(stage="choose", title=name, description=rules)
        road["choices"] = [
            choice("risk", "Risk", "A dare from the deck"),
            choice("reveal", "Reveal", "A truth from the deck"),
        ]
    elif mechanic == "bet":
        road["_hand"] = [cards.draw(room, randbelow)]
        road.update(stage="choose", title=name, description=rules)
        road["banner"] = "A hidden die waits. Higher (4–6) or lower (1–3)?"
        road["choices"] = [
            choice("higher", "Higher", "4, 5 or 6"),
            choice("lower", "Lower", "1, 2 or 3"),
        ]
    else:
        card = cards.draw(room, randbelow)
        target = random_other(room, p, randbelow)
        if mechanic == "bottle":
            card = personalise(card, target)
            road["banner"] = f"The bottle spins… and points at {target}."
        elif mechanic == "heaven":
            text = SEVEN_MINUTES[level].format(target=target)
            card = {**card, "prompt": text, "solo": text, "title": "Seven minutes"}
            road["banner"] = f"The bottle chose {target}."
            seconds = 7 * 60
        elif mechanic == "duel":
            road["rival"] = target
            road["banner"] = (
                f"Your rival: {target}. You both do this card; the table picks the winner."
            )
        elif mechanic == "double":
            road["multiplier"], road["passCost"] = 2, 20
            road["banner"] = "Double or nothing: do it for double, or pass and lose 20 points."
        elif mechanic == "jackpot":
            road["multiplier"] = 3
            road["banner"] = "Jackpot! This card pays triple."
        elif mechanic == "coin":
            heads = randbelow(2) == 0
            road["banner"] = (
                "Heads — it’s yours." if heads else "Tails — choose who does it. You both score."
            )
        elif mechanic == "mirror":
            road["banner"] = f"{target} must mirror everything you do."
        elif mechanic == "chain":
            road["banner"] = "When you finish, pick the next player to do it too."
        elif mechanic == "group":
            road["banner"] = "Everybody plays this one, starting with you."
        elif mechanic == "hotseat":
            road["banner"] = "Hot seat: after the card, everyone asks you one question."
        elif mechanic == "rush":
            seconds = 30
            road["banner"] = "You have thirty seconds."
        elif mechanic == "nominate":
            road["banner"] = "You choose who does this card."
        elif mechanic == "secret":
            road["banner"] = "Read it silently. Act it out. The table guesses what it said."
        elif mechanic == "encore":
            road["encore"] = True
            road["banner"] = "Finish it and you roll again."
        elif mechanic == "steal":
            victims = [v for v in others(room, p) if v["gold"] > 0]
            if victims:
                victim = victims[randbelow(len(victims))]
                taken = min(2, victim["gold"])
                victim["gold"] -= taken
                p["gold"] += taken
                road["banner"] = f"You pickpocket {taken} gold from {victim['name']}."
            else:
                road["banner"] = "Empty pockets everywhere. Nothing to steal."
    if card:
        reveal_card(room, road, card)
    road["deadline"] = clock + seconds * 1000
    room["game"].update(phase="road", road=road)
    room["turnDeadline"] = road["deadline"]
    return True


def spin_wheel(room, p, clock, road, randbelow):
    from . import domain

    randbelow = bounded(randbelow)

    index = randbelow(len(WHEEL))
    label, effect = WHEEL[index]
    road["wheel"] = {"segments": [s[0] for s in WHEEL], "result": index}
    road["banner"] = f"The wheel lands on: {label}"
    if effect == "points+":
        domain.award(p, 40)
    elif effect == "points-":
        domain.award(p, -20)
    elif effect == "forward":
        road["route"] = domain.move(p, 2)
    elif effect == "back":
        road["route"] = domain.move(p, -2)
    domain.journal(room["game"], f"{p['name']} spun the wheel of misfortune: {label}.")
    if effect in {"card", "group", "give", "encore"}:
        road["banner"] += {
            "group": " — the whole table plays this card.",
            "give": " — choose who must do this card.",
            "encore": " — do the card, then roll again.",
            "card": ".",
        }[effect]
        road["encore"] = effect == "encore"
        reveal_card(room, road, cards.draw(room, randbelow))
    else:
        road.update(
            stage="result",
            title=label,
            description=road["banner"] + ".",
            choices=[choice("leave", "Continue", "")],
        )
    road["deadline"] = clock + 120_000
    room["game"].update(phase="road", road=road)
    room["turnDeadline"] = road["deadline"]
    return True


def advance(room, p, key, randbelow):
    """Handle a mid-encounter decision. Returns True when the encounter continues."""
    from . import domain

    randbelow = bounded(randbelow)

    road = room["game"]["road"]
    if road.get("stage") != "choose":
        return False
    if key.startswith("pick"):
        index = int(key[4:])
        road["banner"] = f"You picked card {index + 1}."
        reveal_card(room, road, road.pop("_hand")[index])
        return True
    if key in {"risk", "reveal"}:
        hand = road.pop("_hand")
        road["banner"] = "You chose to risk it." if key == "risk" else "You chose to reveal."
        reveal_card(room, road, hand[0] if key == "risk" else hand[1])
        return True
    if key in {"higher", "lower"}:
        die = randbelow(6) + 1
        won = (die >= 4) == (key == "higher")
        road["banner"] = (
            f"The die shows {die}. You win the bet: choose who does this card. You both score."
            if won
            else f"The die shows {die}. You lose the bet: the card is yours."
        )
        domain.journal(room["game"], f"{p['name']} bet {key} and the die showed {die}.")
        reveal_card(room, road, road.pop("_hand")[0])
        return True
    return False


def resolve_duel(room, p, key):
    from . import domain

    road = room["game"]["road"]
    rival_name = road.get("rival")
    if key == "duel-win":
        domain.award(p, 50)
        p["gold"] += 2
        domain.journal(room["game"], f"{p['name']} won the dare duel against {rival_name}.")
    else:
        rival = next((v for v in room["game"]["players"] if v["name"] == rival_name), None)
        if rival:
            domain.award(rival, 50)
        domain.journal(room["game"], f"{rival_name} won the dare duel against {p['name']}.")
