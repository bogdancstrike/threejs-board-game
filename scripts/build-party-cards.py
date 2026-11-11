"""Compile five editorial decks: 25 distinct activities × 12 meaningful themes each.

Each generated card is a complete prompt with a stable ID, category, solo version
and neutral alternative. This is deterministic content authoring, not runtime AI.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPICS = {
    "soft": ["an enchanted library", "a runaway dragon", "a floating market", "a lost crown", "a talking mushroom", "a clockwork village", "a moonlit picnic", "a forgotten lighthouse", "a sky pirate's treasure", "a garden that sings", "a haunted bakery", "an underwater circus"],
    "drinking": ["new beginnings", "a spectacular failure", "an unlikely friendship", "a dream holiday", "a tiny victory", "a terrible pun", "a lucky escape", "an unexpected talent", "a long-awaited reunion", "a legendary adventure", "the worst haircut ever", "a midnight snack"],
    "teasing": ["your ideal first date", "a charming first impression", "a delightfully terrible pickup line", "a secret admirer", "a romantic comedy meet-cute", "an unexpected compliment", "a shared umbrella", "a playful rivalry", "a dance invitation", "a message that makes someone smile", "a picnic for two", "a stolen glance across the room"],
    "spicy": ["an unforgettable goodnight", "a reunion after months apart", "a secret garden rendezvous", "a slow dance after midnight", "a daring love letter", "a moment at a masquerade", "a movie-worthy first kiss", "a candlelit confession", "a glamorous rooftop date", "a romantic rivalry", "a weekend escape by the sea", "a dance in the kitchen"],
    "hot": ["a grand confession on a balcony", "a midnight masquerade", "a whirlwind holiday romance", "a magnetic dance-floor encounter", "a secret invitation", "a spectacular romantic entrance", "a reunion in the rain", "a candlelit rooftop celebration", "a mischievous love triangle in a comedy", "a legendary last dance", "a starlit hot-tub conversation", "a red-carpet premiere date"],
}
# Five activity families per level; five mechanics in each family.
ACTIVITIES = {
"soft": [
("draw","Blind illustrator","Draw {topic} with your eyes closed for twenty seconds. Open them and explain the funniest detail."),
("draw","One-line sketch","Draw {topic} without lifting your pen. Give the drawing a grand title."),
("draw","Tiny masterpiece","Sketch {topic} using only circles, triangles and squares. The party guesses the subject."),
("draw","Map maker","Draw a tiny route through {topic}. Add one shortcut and one ridiculous obstacle."),
("draw","Doodle relay","Draw the first half of a scene about {topic}. The player on your left finishes it."),
("talk","Two-minute tour","Give a thirty-second guided tour of {topic}, including its best attraction and worst souvenir."),
("talk","Would you rather","Invent two equally tempting choices about {topic}. Pick one, then everyone else picks theirs."),
("talk","Travel review","Give {topic} a five-star or one-star review. Back up your rating with three invented details."),
("talk","Unexpected lesson","Tell a short story about something you learned while visiting {topic}."),
("talk","Three questions","Ask three curious questions about {topic}. Answer one as if you were the local expert."),
("perform","Silent scene","Mime a visit to {topic} without speaking. Give three clues if nobody guesses."),
("perform","News bulletin","Deliver a twenty-second breaking-news bulletin from {topic}, with a surprising twist."),
("perform","Tiny commercial","Advertise {topic} with a slogan, a jingle and a grand closing pose."),
("perform","Different voices","Say 'Welcome to {topic}' as a sleepy wizard, an excited guide and a very serious royal messenger."),
("perform","Sound designer","Make three sound effects for {topic}. Explain what each one represents."),
("puzzle","Five-word legend","Describe {topic} in exactly five words. Then turn those words into a title."),
("puzzle","Alphabet trail","Name five things connected with {topic}, each starting with a different letter."),
("puzzle","Memory backpack","Name five objects you would bring to {topic}. Wait ten seconds, then repeat them in reverse order."),
("puzzle","Forbidden word","Describe {topic} without using any word from its name. The party guesses."),
("puzzle","Rhyme keeper","Create a four-line rhyme about {topic}. Invented words count."),
("create","Hero's choice","Invent a hero, a problem and a clever solution for a story set in {topic}."),
("create","Strange invention","Design a gadget that would be useful in {topic}. Explain its one amusing flaw."),
("create","Group story","Start a story about {topic} with one sentence. Each player adds a sentence until it comes back to you."),
("create","Souvenir shop","Invent three souvenirs from {topic} and choose the one you would actually keep."),
("create","Victory ritual","Invent a short celebration for finishing an adventure in {topic}. Teach it to the table."),
],
}
TARGETS = {
    "drinking": ["the player on your left", "the player on your right", "the player across from you", "the loudest player", "a player chosen by the group", "the last person who laughed", "the player with the fullest glass", "the player who arrived last", "the best-dressed player", "the player you know least", "the youngest player", "someone of your choice"],
    "teasing": ["the player on your left", "the player on your right", "the player across from you", "the player you find cutest", "a player chosen by the group", "the last person who laughed", "the player with the best smile", "the player you know least", "the best-dressed player", "the player who last flirted with you", "the most single player at the table", "someone of your choice"],
    "spicy": ["the player on your left", "the player on your right", "the player across from you", "the player you find most attractive", "a player chosen by the group", "the last person who laughed", "the player with the best lips", "the player you would most like to kiss", "the best-dressed player", "the player the group ships you with", "the player who blushed last", "someone of your choice"],
    "hot": ["the player on your left", "the player on your right", "the player across from you", "the hottest player at the table", "a player chosen by the group", "the player you would most like to kiss", "the player the group ships you with", "the player who last made you blush", "the player wearing the most clothes", "the boldest player tonight", "the player you have had your eye on", "someone of your choice"],
}
ADULT = {
"drinking": [
("buddy","Drinking buddy","{Topic} is your drinking buddy until your next card. Every time one of you drinks, the other drinks too."),
("buddy","Arm in arm","Link arms with {topic} and drink together like newlyweds. Hold the pose until someone takes a photo."),
("buddy","Sip race","Race {topic}: two sips each, as fast as you can. The loser tells their most embarrassing drinking story."),
("buddy","Bartender's choice","Mix a drink for {topic} from whatever is on the table. They sip and rate it out of ten; under five, you finish it."),
("buddy","Best-man speech","Give a thirty-second best-man speech about {topic}. Everyone drinks at the end; anyone who laughs during it drinks twice."),
("rule","Rule maker","Invent a table rule (left hand only, no first names, no swearing). {Topic} is the referee: anyone caught breaking it drinks until your next card."),
("rule","Thumb masters","You and {topic} are Thumb Masters until your next card. When either of you puts a thumb on the table, the last player to copy drinks."),
("rule","Question masters","You and {topic} are Question Masters until your next card. Anyone who answers a question from either of you drinks."),
("rule","Accent round","Everyone speaks in an accent chosen by {topic} until your next turn. Slip out of it and drink."),
("rule","No yes, no no","Until your next card, 'yes' and 'no' are banned. {Topic} keeps score; offenders drink."),
("game","Waterfall","Start a waterfall: everyone drinks, and nobody stops until the player before them stops. {Topic} decides when you may stop."),
("game","Never have I ever","Say three 'never have I ever' statements aimed at {topic}. Everyone who has done it drinks each time."),
("game","Most likely to","Ask a 'who is most likely to' question. On three, everyone points. The most-pointed player drinks twice, and {topic} drinks once for luck."),
("game","Medusa","Everyone looks down. On three, look up straight at someone; locked eyes drink. {Topic} must keep their eyes on you."),
("game","Categories","{Topic} picks a category. Go round the table naming answers; the first to hesitate or repeat takes three sips."),
("laugh","Straight face","Tell your worst joke to {topic} while staring into their eyes. If they laugh, they drink. If they don't, you drink twice."),
("laugh","Impression","Do your best impression of {topic} ordering a drink. If the table guesses who it is, they drink; if not, you do."),
("laugh","Victory dance","Do a fifteen-second victory dance in front of {topic}. They rate it out of ten; under seven, you drink."),
("laugh","Worst pickup line","Use the worst drinking-themed pickup line you know on {topic}. If they groan, everyone drinks."),
("laugh","Slow-motion shot","Take a sip in slow motion while {topic} narrates it like a nature documentary."),
("dare","Phone roulette","Let {topic} read out the last message you sent, or take three sips."),
("dare","Hands-free sip","Take a sip without using your hands while {topic} holds the glass for you."),
("dare","Sip or spill","{Topic} asks you anything. Answer honestly or take three sips."),
("dare","Rhyming toast","Toast {topic} in four rhyming lines. Every failed rhyme costs you a sip."),
("dare","Secret or shot","You and {topic} each reveal a secret, or you both take a shot."),
],
"teasing": [
("flirt","Cheesy pickup line","Deliver your cheesiest pickup line to {topic}. They must answer with one of their own."),
("flirt","Smoulder","Give {topic} your most smouldering look for ten seconds. Whoever breaks first owes the other a compliment."),
("flirt","Wink","Wink at {topic} and say 'I see you.' They must wink back or blush trying."),
("flirt","Compliment attack","Give {topic} three compliments in a row: their looks, their laugh, their vibe."),
("flirt","Whisper","Whisper something flirty to {topic}. They tell the table how it made them feel, but not what you said."),
("touch","Hold hands","Hold hands with {topic} until your next card."),
("touch","Shoulder massage","Give {topic} a thirty-second shoulder massage."),
("touch","Hand kiss","Kiss the hand of {topic} like a royal admirer."),
("touch","Cheek kiss","Give {topic} a quick kiss on the cheek."),
("touch","Lean on me","Rest your head on the shoulder of {topic} until the next player rolls."),
("date","Ask them out","Ask {topic} out on a date with a full plan. They accept or reject it, with a reason."),
("date","Dating profile","Write a three-line dating profile for {topic} and read it out like a movie trailer."),
("date","Show me your move","Show {topic} your best flirting move. They rate it out of ten, then show you theirs."),
("date","Serenade","Sing one line of a love song straight to {topic}."),
("date","Pet name","Give {topic} a flirty nickname. Everyone must use it for the rest of the game."),
("truth","Your type","Tell {topic} which of their features is exactly your type."),
("truth","First impression","Tell {topic} the honest first thing you noticed about them."),
("truth","Cutest moment","Tell {topic} the cutest thing they have done tonight."),
("truth","Who would you date","Say who at the table you would date — then explain to {topic} why it is, or isn't, them."),
("truth","Hot seat","{Topic} asks you two flirty questions. Answer both."),
("play","Feed me","Feed {topic} a snack, romantic-dinner style."),
("play","Slow dance","Slow dance with {topic} for twenty seconds while the table hums."),
("play","Matchmaker","Pick a partner for {topic}. The pair sits together and holds hands until your next card."),
("play","Silent flirt","Flirt with {topic} for twenty seconds using only body language. The table scores your performance."),
("play","Couple selfie","Take a couple selfie with {topic} in your most romantic pose."),
],
"spicy": [
("kiss","Neck kiss","Give {topic} a slow kiss on the neck."),
("kiss","Their choice","{Topic} chooses where you kiss them: hand, cheek, neck or shoulder."),
("kiss","Spin the bottle","Spin a bottle and kiss whoever it points to on the cheek. If it lands on {topic}, make it the lips."),
("kiss","Who kissed me","Close your eyes. {Topic} or another player kisses your cheek. Guess who; guess wrong and they kiss you again."),
("kiss","Quick peck","Give {topic} a quick kiss on the lips."),
("close","Lap seat","Sit on the lap of {topic} until your next card."),
("close","Back massage","Give {topic} a one-minute back massage."),
("close","Big spoon","Cuddle {topic} as the big spoon for one full round."),
("close","Close dance","Dance pressed close to {topic} for one chorus of a song."),
("close","Ice trail","Trace an ice cube slowly along the arm of {topic}, from wrist to shoulder."),
("tease","Seductive whisper","Whisper the most seductive sentence you can think of into the ear of {topic}."),
("tease","Lip pass","Pass a playing card or napkin to {topic} using only your lips. Drop it and try again."),
("tease","Irresistible","Look at {topic}, bite your lip, and tell them one thing you find irresistible about them."),
("tease","Lose an item","Remove one item of clothing or accessory chosen by {topic}."),
("tease","Clothes swap","Swap one item of clothing with {topic} for the rest of the game."),
("truth","Best kiss","Tell {topic} about the best kiss of your life, in detail."),
("truth","Kissable ranking","Rank the three most kissable people here. {Topic} gets to argue their position."),
("truth","Turn-on","Tell {topic} your biggest turn-on while looking them in the eye."),
("truth","Perfect night","Describe to {topic} how a perfect night with them would end."),
("truth","Spicy never","Say a spicy 'never have I ever'. If {topic} has done it, they tell the story."),
("perform","Catwalk","Do your sexiest catwalk to {topic} and finish with a pose on their lap."),
("perform","Moan-off","Have a dramatic moan-off with {topic}. The table picks the winner."),
("perform","Bedroom voice","Read the last text on your phone to {topic} in your most seductive voice."),
("perform","No hands, no words","Seduce {topic} for thirty seconds without words or touch. They decide if it worked."),
("perform","Seven seconds","Face {topic}, noses almost touching, for seven seconds. The first to laugh takes a dare of the other's choice."),
],
"hot": [
("kiss","Make-out","Kiss {topic} for ten seconds."),
("kiss","Kiss trail","Kiss {topic} three times: hand, neck, then lips, slower each time."),
("kiss","Spin and kiss","Spin a bottle and kiss whoever it lands on. If it lands on you, kiss {topic}."),
("kiss","Earlobe","Gently nibble the earlobe of {topic}."),
("kiss","Blindfold kiss","Close your eyes and let {topic} kiss you anywhere above the shoulders. Guess where for a bonus."),
("strip","Strip one","Take off one item of clothing. {Topic} chooses which."),
("strip","Teeth only","Remove a sock or accessory from {topic} using only your teeth."),
("strip","Strip tease","Do a twenty-second strip tease for {topic}, ending one item lighter."),
("strip","Your pick","{Topic} takes off one item of clothing, and you choose which."),
("strip","Top swap","Swap tops with {topic}, right here."),
("body","Body shot","Take a body shot from {topic}: salt on their neck, the shot, lime from their lips."),
("body","Lap dance","Give {topic} a thirty-second lap dance."),
("body","Sweet tooth","Put whipped cream or chocolate on the finger or neck of {topic} and lick it off."),
("body","Ice and kiss","Run an ice cube along the neck of {topic}, then kiss the cold spot."),
("body","Lipstick heart","Draw a lipstick heart somewhere on {topic}. They choose where."),
("heat","Two minutes","Spend two minutes alone with {topic} in another room. What happens there stays there."),
("heat","Grind","Dance with {topic} as close as possible for a full chorus."),
("heat","Face to face","Sit facing {topic} on their lap and tell them what you like about them."),
("heat","Their massage","Give {topic} a massage. They choose where."),
("heat","Against the wall","Pin the hands of {topic} gently to the wall for five seconds and whisper something in their ear."),
("truth","Wildest place","Tell {topic} the wildest place you have ever kissed someone."),
("truth","Secret or kiss","Tell {topic} a secret nobody at this table knows, or kiss them instead."),
("truth","A night alone","Whisper to {topic} exactly what you would do with them on a night alone."),
("truth","Rate the kiss","Kiss {topic}, then you both rate the kiss out of ten, out loud."),
("truth","Kiss, strip or shot","{Topic} chooses: you kiss them, you take off one item, or you take a shot."),
],
}
ACTIVITIES.update(ADULT)
TOPICS.update(TARGETS)
DESCRIPTIONS = {
    "soft": "Creative board-game fun: drawing, stories, conversation and playful puzzles.",
    "drinking": "Drinking dares, drinking buddies, table rules and challenges built to make everyone laugh.",
    "teasing": "Flirt with each other: pickup lines, compliments, hand-holding, cheek kisses and fake dates.",
    "spicy": "Kisses, lap seats, close dances, seductive whispers and juicy truths.",
    "hot": "The boldest deck: make-outs, strip dares, body shots, lap dances and steamy truths.",
}

def build():
    decks = {}
    for level, activities in ACTIVITIES.items():
        assert len(activities) == 25 and len(TOPICS[level]) == 12
        cards = []
        for activity_index, (category, title, template) in enumerate(activities):
            for topic_index, topic in enumerate(TOPICS[level]):
                index = activity_index * 12 + topic_index
                soft = ACTIVITIES["soft"][activity_index][2].format(topic=TOPICS["soft"][topic_index])
                prompt = template.format(topic=topic, Topic=topic[0].upper() + topic[1:])
                cards.append({
                    "id": f"{level}-{index+1:03}", "level": level, "category": category,
                    "title": f"{title} · {topic}" if level == "soft" else title, "prompt": prompt,
                    "solo": prompt if level == "soft" else prompt + " Playing solo? Act it out with an imaginary partner.",
                    "alternative": soft, "seconds": 120, "points": 25, "gold": 1,
                })
        assert len({c["prompt"] for c in cards}) == 300
        decks[level] = cards
    data = {"version": 1, "levels": [{"id": k, "name": k.title(), "count": len(v), "description": DESCRIPTIONS[k], "adult": k != "soft"} for k,v in decks.items()], "decks": decks}
    target = ROOT / "backend/data/party-cards.json"
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    metadata = ROOT / "src/game/decks.ts"
    metadata.write_text("// Generated by scripts/build-party-cards.py; edit the source deck authoring file.\nexport const DIFFICULTIES = " + json.dumps(data["levels"], ensure_ascii=False, indent=2) + " as const;\nexport type Difficulty = typeof DIFFICULTIES[number]['id'];\n")
    print(f"Published {sum(map(len,decks.values()))} unique cards across {len(decks)} levels.")

if __name__ == "__main__":
    build()
