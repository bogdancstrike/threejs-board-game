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
"drinking": [
("toast","Opening toast","Raise your glass and make a one-sentence toast to {topic}. Everyone clinks and takes a sip."),
("toast","Poetic toast","Say a two-line toast about {topic}, finish with 'cheers' and take a sip."),
("toast","Silent cheers","Act out a toast to {topic} without words. When the party guesses it, everyone drinks."),
("toast","Royal speech","As a pompous monarch, declare a toast to {topic}. Give everyone an extravagant title, then drink."),
("toast","Toast remix","Give two toasts to {topic}: one elegant, one ridiculous. The party votes, and the losing toast's fans drink."),
("table","Never have I ever","Say a 'never have I ever' about {topic}. Everyone who has, drinks."),
("table","Most likely to","Ask who is most likely to end up in {topic}. On three, everyone points; the most-pointed player drinks."),
("table","Category circle","Pick a category inspired by {topic}. Go round naming items; the first to repeat or freeze drinks."),
("table","Two truths and a tale","Tell three short statements about {topic}, one invented. Everyone who guesses wrong drinks."),
("table","Word association","Start a word-association chain with {topic}. The player who hesitates drinks and names a cocktail after the last word."),
("create","Signature cocktail","Invent a drink inspired by {topic}. Name it, list three flavour notes and toast the first sip."),
("create","Coaster artist","Draw a coaster design for {topic}. If the party laughs, you choose who drinks."),
("create","Menu poet","Write a dramatic menu description for a drink called '{topic}'. Read it aloud, then sip."),
("create","Bottle label","Design a label for a drink themed around {topic}, with a slogan and an absurd tasting note."),
("create","Pop-up bar","Pitch a bar devoted to {topic}: its signature drink, house rule and theme song. Everyone drinks to the opening."),
("share","Drinking buddy","Pick a drinking buddy. Whenever one of you drinks before your next turn, so does the other. Toast to {topic} to seal it."),
("share","Refill round","Top up someone's glass and tell a quick story about {topic} while you pour."),
("share","Cheers across the table","Choose a player across the table. Clink glasses and invent a shared celebration of {topic}."),
("share","Host for a moment","Introduce each player as a guest at a party celebrating {topic}. Everyone raises a glass to the host."),
("share","Compliment and cheers","Give someone a specific compliment connected with {topic}. They drink, then return the favour."),
("perform","Bartender audition","Pretend to mix a drink called '{topic}'. Give a twenty-second theatrical presentation, then taste it."),
("perform","Pub storyteller","Tell a tall tale about {topic} as if it were the legend of the local pub. Best line earns a round of sips."),
("perform","Jingle at the table","Perform a ten-second advertisement for a drink inspired by {topic}. Over-the-top slogans only."),
("perform","Mystery menu","Describe a drink inspired by {topic} without naming its ingredients. The first correct guess picks who drinks."),
("perform","The final cheers","Thank the party for an adventure involving {topic}. Everyone finishes with a toast."),
],
"teasing": [
("flirt","Opening line","Invent a playful opening line about {topic} and deliver it to the player of your choice."),
("flirt","Compliment craftsman","Give someone a sincere compliment inspired by {topic}, about their style, laugh or personality."),
("flirt","Charming invitation","Invite someone on a date themed around {topic}. Make it impossible to say no."),
("flirt","Flirty translation","Express {topic} first like a formal diplomat, then like a charming romantic-comedy lead."),
("flirt","Emoji romance","Describe {topic} using five spoken emoji names. The party translates your message."),
("talk","Green flags","Name three qualities you would love in someone during {topic}. Say which matters most."),
("talk","Confession booth","Share a mildly embarrassing romantic moment involving {topic}, real or invented."),
("talk","Date designer","Plan a thoughtful date around {topic}, from the first minute to the goodnight."),
("talk","Rom-com casting","Cast yourself in a comedy about {topic}. Describe your character's lovable flaw."),
("talk","A small spark","Describe one gesture that would make {topic} unforgettable."),
("gesture","Palm-to-palm greeting","Share a palm-to-palm greeting with another player and invent a secret handshake for {topic}."),
("gesture","Hand-heart message","Make a hand heart with another player while saying a sweet line about {topic}."),
("gesture","Friendly handhold","Hold hands with the player on your right while you each say one kind line about {topic}."),
("gesture","Mirrored movement","Choose a partner to mirror three gestures inspired by {topic}. The first to break eye contact loses."),
("gesture","Five-second glance","Hold a five-second look with someone, then say a playful line about {topic}."),
("perform","Meet-cute audition","Act out a twenty-second romantic-comedy introduction about {topic}. The party picks the setting."),
("perform","Love-song narrator","Speak an invented love-song chorus about {topic} as dramatic poetry, or sing it."),
("perform","Charming villain","Deliver a charming villain's invitation themed around {topic}, ending with a dramatic bow."),
("perform","The wink","Deliver a line about {topic} to someone and finish with a wink."),
("perform","Secret admirer note","Compose a two-sentence note inspired by {topic} and read it with exaggerated mystery."),
("duet","Compliment exchange","Exchange compliments inspired by {topic} with another player until one of you blushes."),
("duet","Shared pickup line","With a partner, take turns adding words to a pickup line about {topic}. Stop at twelve words."),
("duet","Yes, and romance","Start a date story about {topic}. Your partner adds a sentence beginning 'Yes, and'. Go four rounds."),
("duet","Two perspectives","Describe {topic} from one character's view while your partner voices the other."),
("duet","Invitation rehearsal","Ask a partner out in a scene themed around {topic}. Then switch roles."),
],
"spicy": [
("confession","Bold confession","Deliver a confident romantic confession inspired by {topic} to the player of your choice."),
("confession","The unsent letter","Read a three-sentence love letter about {topic}: one honest feeling, one playful challenge, one invitation."),
("confession","Unexpected chemistry","Describe why two people would have instant chemistry during {topic}: the look, the banter, the moment."),
("confession","A little vulnerability","Share a romantic hope connected with {topic}."),
("confession","The confident answer","Someone proposes {topic} to you. Give a bold, warm answer about exactly what you would enjoy."),
("romance","Slow-dance invitation","Invite a partner to a short slow dance inspired by {topic}. Hum your own soundtrack."),
("romance","A hand-kiss scene","Kiss a partner's hand like a period-drama hero and add a line about {topic}."),
("romance","Close conversation","Sit close to a partner and exchange two romantic lines about {topic}."),
("romance","Shoulder-to-shoulder","Sit shoulder-to-shoulder with a partner while you invent a scene about {topic} together."),
("romance","Gentle hand trace","Trace a symbol on a partner's palm with your fingertip. Explain what it means for {topic}."),
("perform","Leading-role entrance","Make a confident entrance as the romantic lead in a story about {topic}."),
("perform","Whispered line","Whisper a romantic line about {topic} to the player on your left."),
("perform","Dramatic almost-kiss","Act a scene about {topic} with a partner that ends just before a kiss."),
("perform","Three moods","Perform the same invitation to {topic} three ways: shy, mischievous and boldly romantic."),
("perform","Love-song dedication","Invent a short romantic chorus about {topic} and dedicate it to someone at the table."),
("imagine","The perfect atmosphere","Design the lighting, music and conversation for {topic}. Make the room feel it."),
("imagine","Romantic director","Direct a thirty-second scene about {topic}: the camera angle, a meaningful look and the closing line."),
("imagine","A secret invitation","Write an intriguing invitation to {topic} and slide it to someone."),
("imagine","The chemistry test","Invent three playful questions two people might ask during {topic}. Ask one of them to a player."),
("imagine","A memorable gesture","Invent a bold romantic gesture for {topic} and describe the reaction you hope for."),
("duet","Romantic improv","Improvise four lines about {topic} with a partner, alternating line by line."),
("duet","Look and compliment","Share a ten-second look with a partner, then give a specific compliment inspired by {topic}."),
("duet","Dance-floor dialogue","Exchange an invitation and reply about {topic} with a partner while swaying together."),
("duet","Two love letters","Write two one-line love letters about {topic}, one elegant and one mischievous. A partner reads the second."),
("duet","Romantic curtain call","Invent a romantic final line for {topic}, then take a bow hand-in-hand with a partner."),
],
"hot": [
("spotlight","Main-character moment","Deliver a thirty-second, boldly romantic monologue about {topic}: a confident entrance, a heartfelt confession and an inviting final line."),
("spotlight","Masquerade challenge","Play two characters meeting during {topic}, one mysterious and one irresistibly charming."),
("spotlight","The grand proposal","Pitch an extravagant date built around {topic}. Win the room with three details and one spectacular flourish."),
("spotlight","Romance battle","Create two competing romantic invitations to {topic}. Another player performs one; the party crowns a winner."),
("spotlight","One-take romance","Improvise a romantic scene about {topic} in four sentences, each in a different emotional tone."),
("toast","Daring dedication","Dedicate a toast to {topic} with a bold compliment to someone at the table. You both drink."),
("toast","Romantic host","Host a celebration of {topic}: introduce two fictional lovers, invent their signature drink, and lead a toast."),
("toast","Toast and confession","Toast to {topic}, then make one romantic confession."),
("toast","Flirtatious menu","Invent a glamorous cocktail and a mischievous menu description inspired by {topic}. Serve it to someone with a flourish."),
("toast","Shared celebration","Trade two bold compliments with a partner inspired by {topic}, then link arms and drink."),
("touch","Choose your greeting","Offer a partner a handhold, a shoulder touch or a bow, then improvise a romantic line about {topic}."),
("touch","Slow-dance scene","Share a short slow dance with a partner inspired by {topic}."),
("touch","Cheek kiss","Give a partner a quick kiss on the cheek and a line inspired by {topic}."),
("touch","Palm-written promise","Trace a symbol on a partner's palm and explain its romantic meaning for {topic}."),
("touch","Comfortable closeness","Hold a partner's hand while you exchange bold compliments about {topic}."),
("truth","Bold truth","Describe the most dramatic romantic choice you would make during {topic}, and the feeling behind it."),
("truth","Three invitations","Offer three increasingly theatrical invitations inspired by {topic}. The room picks the most charming."),
("truth","The secret soundtrack","Name three songs that tell a romantic story about {topic}. Explain the mood of each chapter."),
("truth","Yes and no","Name one thing you would love and one you would skip during {topic}. Make it playful and direct."),
("truth","The romantic dare","Invent a bold romantic dare inspired by {topic}, announce it, and perform it."),
("duet","Two-person finale","Perform a scene about {topic} with a partner: one invitation, one reply, one compliment and a final pose."),
("duet","Chemistry in three acts","Act out the beginning, complication and joyful ending of {topic} with a partner."),
("duet","Grand gesture relay","Each player adds one grand gesture to a romance about {topic}. Finish with a group bow."),
("duet","Duet of compliments","Trade three increasingly theatrical compliments with a partner, using {topic} as inspiration."),
("duet","All-in curtain call","Combine a romantic line, a dance move and a toast into a finale for {topic}, hand-in-hand with a partner."),
],
}
DESCRIPTIONS = {
    "soft": "Creative board-game fun: drawing, stories, conversation and playful puzzles.",
    "drinking": "Toasts, table games, drinking buddies and bar-room performances.",
    "teasing": "Playful flirting, compliments, light confessions and friendly touch.",
    "spicy": "Bolder adult romance, affectionate gestures and dramatic chemistry.",
    "hot": "The boldest adult party mix: romantic performances, touch, confessions and celebratory toasts.",
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
                prompt = template.format(topic=topic)
                cards.append({
                    "id": f"{level}-{index+1:03}", "level": level, "category": category,
                    "title": f"{title} · {topic}", "prompt": prompt,
                    "solo": prompt + " Playing solo? Take every role yourself.",
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
