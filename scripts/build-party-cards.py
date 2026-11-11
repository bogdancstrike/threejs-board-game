"""Compile five editorial decks: 25 distinct activities × 10 meaningful themes each.

Each generated card is a complete prompt with a stable ID, category, solo version
and neutral alternative. This is deterministic content authoring, not runtime AI.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPICS = {
    "soft": ["an enchanted library", "a runaway dragon", "a floating market", "a lost crown", "a talking mushroom", "a clockwork village", "a moonlit picnic", "a forgotten lighthouse", "a sky pirate's treasure", "a garden that sings"],
    "drinking": ["new beginnings", "a spectacular failure", "an unlikely friendship", "a dream holiday", "a tiny victory", "a terrible pun", "a lucky escape", "an unexpected talent", "a long-awaited reunion", "a legendary adventure"],
    "teasing": ["your ideal first date", "a charming first impression", "a delightfully terrible pickup line", "a secret admirer", "a romantic comedy meet-cute", "an unexpected compliment", "a shared umbrella", "a playful rivalry", "a dance invitation", "a message that makes someone smile"],
    "spicy": ["an unforgettable goodnight", "a reunion after months apart", "a secret garden rendezvous", "a slow dance after midnight", "a daring love letter", "a moment at a masquerade", "a movie-worthy first kiss", "a candlelit confession", "a glamorous rooftop date", "a romantic rivalry"],
    "hot": ["a grand confession on a balcony", "a midnight masquerade", "a whirlwind holiday romance", "a magnetic dance-floor encounter", "a secret invitation", "a spectacular romantic entrance", "a reunion in the rain", "a candlelit rooftop celebration", "a mischievous love triangle in a comedy", "a legendary last dance"],
}
# Five activity families per level; five mechanics in each family.
ACTIVITIES = {
"soft": [
("draw","Blind illustrator","Draw {topic} with your eyes closed for twenty seconds. Open them and explain the funniest detail."),
("draw","One-line sketch","Draw {topic} without lifting your pen. Give the drawing a grand title."),
("draw","Tiny masterpiece","Sketch {topic} using only circles, triangles and squares. Let the party guess the subject."),
("draw","Map maker","Draw a tiny route through {topic}. Add one shortcut and one ridiculous obstacle."),
("draw","Doodle relay","Draw the first half of a scene about {topic}; invite a willing player to finish it, or finish it with your other hand."),
("talk","Two-minute tour","Give a thirty-second guided tour of {topic}, including its best attraction and worst souvenir."),
("talk","Would you rather","Invent two equally tempting choices about {topic}. Explain your choice and invite others to share theirs."),
("talk","Travel review","Give {topic} a five-star or one-star review. Support your rating with three imaginary details."),
("talk","Unexpected lesson","Tell a short fictional story about something you learned while visiting {topic}."),
("talk","Three questions","Ask three curious questions about {topic}. Answer one as if you were the local expert."),
("perform","Silent scene","Mime a visit to {topic} without speaking. Offer three clues if nobody guesses."),
("perform","News bulletin","Deliver a twenty-second breaking-news bulletin from {topic}. Include a harmless but surprising twist."),
("perform","Tiny commercial","Advertise {topic} using a slogan, a jingle and a grand closing pose. Seated gestures work too."),
("perform","Different voices","Say 'Welcome to {topic}' as a sleepy wizard, an excited guide and a very serious royal messenger."),
("perform","Sound designer","Make three sound effects for {topic}. Explain what each sound represents."),
("puzzle","Five-word legend","Describe {topic} in exactly five words. Then turn those words into a title."),
("puzzle","Alphabet trail","Name five things connected with {topic}, starting with five different letters."),
("puzzle","Memory backpack","Name five objects you would bring to {topic}. Wait ten seconds, then repeat them in reverse order."),
("puzzle","Forbidden word","Describe {topic} without using any word from its name. Invite the party to guess."),
("puzzle","Rhyme keeper","Create a four-line rhyme about {topic}. Silly rhymes and invented words count."),
("create","Hero's choice","Invent a hero, a problem and a peaceful solution for a story set in {topic}."),
("create","Strange invention","Design an imaginary gadget that would be useful in {topic}. Explain its one amusing flaw."),
("create","Group story","Start a story about {topic} with one sentence. Each willing player adds a sentence; in solo play, add three yourself."),
("create","Souvenir shop","Invent three souvenirs from {topic}, and choose the one you would actually keep."),
("create","Victory ritual","Invent a short celebration for finishing an adventure in {topic}. A hand gesture, phrase or drawing is enough."),
],
"drinking": [
("toast","Opening toast","Raise any beverage and make a one-sentence toast to {topic}. Clinking, an optional sip or simply raising an empty hand all count."),
("toast","Poetic toast","Write or say a two-line toast about {topic}. Finish with a cheerful 'cheers'; drinking is optional."),
("toast","Silent cheers","Act out a toast to {topic} without words. Invite the party to guess, then raise your glass or hand."),
("toast","Royal speech","As an imaginary monarch, declare a toast celebrating {topic}. Give everyone an extravagant honorary title."),
("toast","Toast remix","Give two very different toasts to {topic}: one elegant, one completely silly. Choose the party's favorite."),
("table","Never have I, fictional","Invent a harmless 'never have I ever' statement about {topic}. Players signal with a raised hand or glass; nobody owes a drink or a personal disclosure."),
("table","Most likely, kindly","Ask who would make the best storyteller about {topic}. Volunteers may nominate themselves and explain; offer a friendly cheers to all."),
("table","Category circle","Choose a category inspired by {topic}. Each willing player names one item; a repeat ends the round with a shared cheers, never a penalty drink."),
("table","Two truths or tales","Offer three short statements about {topic}; they may all be fictional. Let the party guess which one you invented first."),
("table","Word association","Start a five-word association chain with {topic}. End by naming an imaginary drink after the final word."),
("create","Signature mocktail","Invent an alcohol-free drink inspired by {topic}. Name three imaginary flavor notes and give it a memorable name."),
("create","Coaster artist","Draw a coaster design for {topic}. Show your design and explain the hidden joke."),
("create","Menu poet","Write a dramatic menu description for a drink celebrating {topic}. No mixing or drinking is required."),
("create","Bottle label","Design a fictional beverage label themed around {topic}. Include a slogan and an absurd tasting note."),
("create","Pop-up cafe","Imagine a cafe devoted to {topic}. Name its special drink, house rule and favorite song."),
("share","Bring your own cheers","Invite a willing player to share a toast to {topic}, each with their own beverage or empty hand. Take turns adding one line."),
("share","Kind refill","Offer someone water or another beverage they choose, without pressure. While they decide, share a light fictional anecdote about {topic}."),
("share","Cheers across the table","Choose a willing player and invent a shared celebration of {topic}. Raise your own glasses or hands from where you are."),
("share","Host for a moment","Introduce each willing player as a guest at a celebration of {topic}. Offer everyone a choice of an imaginary drink."),
("share","Compliment and cheers","Give a specific, kind compliment connected with {topic}, then invite a voluntary cheers. An empty glass is welcome."),
("perform","Bartender audition","Pretend to serve a completely imaginary drink called '{topic}'. Give a twenty-second theatrical presentation."),
("perform","Pub storyteller","Tell a short tall tale about {topic} as if it were the legend of a friendly village pub."),
("perform","Jingle at the table","Perform a ten-second advertisement for an imaginary drink inspired by {topic}. Include an over-the-top slogan."),
("perform","Mystery menu","Describe an imaginary beverage inspired by {topic} without naming its ingredients. Let others propose a name."),
("perform","The final cheers","Thank the party for an imaginary adventure involving {topic}. End with a toast, a wave or an optional sip of any beverage."),
],
"teasing": [
("flirt","Opening line","Invent a playful, non-explicit opening line about {topic}. Deliver it to the room or an imaginary character."),
("flirt","Compliment craftsman","Give a willing player a sincere compliment inspired by {topic}. Keep it about personality, style or a shared moment."),
("flirt","Charming invitation","Invite an imaginary admirer on a date using the theme of {topic}. Make the invitation easy to accept or decline."),
("flirt","Flirty translation","Express {topic} first like a formal diplomat, then like a charming romantic-comedy lead."),
("flirt","Emoji romance","Describe {topic} using five spoken emoji names. Ask the party to translate your message."),
("talk","Green flags","Name three qualities you would value in a scene involving {topic}. Explain which matters most to you."),
("talk","Fictional confession","Invent a mildly embarrassing romantic confession involving {topic}. Fiction is always welcome."),
("talk","Date designer","Plan a low-pressure, thoughtful date around {topic}. Include a comfortable way for either person to leave."),
("talk","Rom-com casting","Cast yourself as a character in a comedy about {topic}. Describe your character's lovable flaw."),
("talk","A small spark","Describe one thoughtful gesture that could make {topic} memorable. Real stories or invented examples both count."),
("gesture","Palm-to-palm greeting","If another player freely agrees, share a brief palm-to-palm greeting and invent a greeting for {topic}. Otherwise demonstrate it in the air."),
("gesture","Hand-heart message","Make a hand-heart gesture to accompany a sentence about {topic}. A willing partner may join their hand to yours."),
("gesture","Friendly handhold","Ask a willing partner whether they would like a brief handhold while you exchange a kind line about {topic}. Use a solo gesture instead if preferred."),
("gesture","Mirrored movement","Invite a willing partner to mirror three gentle seated gestures inspired by {topic}. No touch is needed."),
("gesture","Five-second glance","Invite a willing partner to share a five-second smile or look, then say a playful line about {topic}. Looking at an imaginary partner works too."),
("perform","Meet-cute audition","Act out a twenty-second romantic-comedy introduction about {topic}. Let the party suggest a funny setting."),
("perform","Love-song narrator","Speak an invented love-song chorus about {topic} as dramatic poetry. Singing is optional."),
("perform","Charming villain","Deliver a charming but harmless villain's invitation themed around {topic}. End by politely accepting a pretend 'no'."),
("perform","The wink alternative","Offer a wink, a bow or a theatrical smile while delivering a line about {topic}. Choose whichever feels comfortable."),
("perform","Secret admirer note","Compose a two-sentence note inspired by {topic}, then read it with exaggerated mystery."),
("duet","Compliment exchange","Invite a willing partner to exchange one kind compliment each, inspired by {topic}. In solo play, compliment an imagined hero."),
("duet","Shared pickup line","With a willing partner, take turns adding words to a silly pickup line about {topic}. Stop after twelve words."),
("duet","Yes, and romance","Start a fictional date story about {topic}. A willing partner adds one sentence beginning 'Yes, and'; or play both roles yourself."),
("duet","Two perspectives","Describe {topic} from two imaginary characters' viewpoints. Invite someone to voice the second character if they wish."),
("duet","Invitation rehearsal","Practice offering and gracefully accepting or declining an invitation themed around {topic}. Switch roles with a volunteer, or play both."),
],
"spicy": [
("confession","Bold but fictional","Deliver a confident romantic confession inspired by {topic}. It may be entirely fictional and must stay non-graphic."),
("confession","The unsent letter","Read a three-sentence love letter about {topic}. Include one honest feeling, one playful challenge and one kind invitation."),
("confession","Unexpected chemistry","Describe why two imaginary adults have chemistry in a story about {topic}. Focus on conversation, humor and attention."),
("confession","A little vulnerability","Share or invent a romantic hope connected with {topic}. Keep private details private and choose your own level of openness."),
("confession","The confident answer","Answer an imaginary admirer who proposes {topic}. Make your answer bold, warm and clear about what you would enjoy."),
("romance","Slow-dance invitation","Ask a willing adult partner whether they would enjoy a short, gentle dance inspired by {topic}. A seated hand dance or solo version counts equally."),
("romance","A hand-kiss scene","Offer a willing adult partner a theatrical kiss on their hand, only if they agree. Blowing a kiss into the air is an equal alternative. Add a line about {topic}."),
("romance","Close conversation","With a willing partner, choose a comfortable distance and exchange two romantic lines about {topic}. No touch or closeness is required."),
("romance","Shoulder-to-shoulder","If mutually welcome, sit shoulder-to-shoulder briefly while inventing a scene about {topic}. Otherwise act from your own seat."),
("romance","Gentle hand trace","Ask a willing partner whether a brief fingertip trace on their palm is welcome; otherwise trace your own palm. Invent a symbol connected with {topic}."),
("perform","Leading-role entrance","Make a confident entrance as the romantic lead in a story about {topic}. Clothes stay on; a seated pose is enough."),
("perform","Whispered theatre","Deliver a soft-spoken, non-explicit romantic line about {topic} to the room or an imaginary partner. No personal whispering is required."),
("perform","Dramatic almost-kiss","Act a fictional scene about {topic} that ends just before a kiss. Use an imaginary partner or a volunteer; there is no contact requirement."),
("perform","Three moods","Perform the same invitation to {topic} in three moods: shy, mischievous and confidently romantic."),
("perform","Love-song dedication","Invent a short romantic chorus dedicated to {topic}. Speak it, sing it or write it for the party to read."),
("imagine","The perfect atmosphere","Design the lighting, music and conversation for {topic}. Describe why the setting feels inviting rather than pressured."),
("imagine","Romantic director","Direct a thirty-second, non-graphic scene about {topic}. Describe camera angles, a meaningful look and the closing line."),
("imagine","A secret invitation","Write an intriguing invitation to {topic}. Include a clear choice to accept, decline or suggest something else."),
("imagine","The chemistry test","Invent three playful questions two fictional adult characters might ask during {topic}. Answer one in character."),
("imagine","A memorable gesture","Invent a bold but thoughtful romantic gesture for {topic}. Explain how you would check that it was welcome."),
("duet","Romantic improv","Invite a willing adult partner to improvise four lines about {topic}. Agree on the scene first, or play both roles yourself."),
("duet","Look and compliment","If welcome, share a ten-second look with a partner, then offer a specific compliment inspired by {topic}. A solo monologue counts too."),
("duet","Dance-floor dialogue","With a willing partner, exchange a playful invitation and response about {topic}. Add a gentle movement only if both want to."),
("duet","Two love letters","Write two contrasting one-line love letters about {topic}: one elegant and one mischievous. A volunteer may read the second."),
("duet","Romantic curtain call","Invent a romantic final line for {topic}. Offer a bow, hand-heart or mutually welcome brief handhold as your curtain call."),
],
"hot": [
("spotlight","Main-character moment","Deliver a thirty-second, boldly romantic monologue about {topic}. Include a confident entrance, a heartfelt confession and an inviting final line; keep it non-graphic."),
("spotlight","Masquerade challenge","Perform two contrasting adult characters meeting during {topic}. Make one playfully mysterious and the other confidently charming."),
("spotlight","The grand proposal","Pitch an extravagant fictional date built around {topic}. Win the room with three thoughtful details and one spectacular flourish."),
("spotlight","Romance battle","Create two competing romantic invitations to {topic}. Invite a willing player to perform one; the party celebrates both performances."),
("spotlight","One-take romance","Improvise a complete non-graphic romantic scene about {topic} in four sentences, each with a different emotional tone."),
("toast","Daring dedication","Dedicate a theatrical toast to {topic}. Add a bold compliment to a willing recipient or an imaginary adult character. Any beverage or an empty hand works."),
("toast","Romantic host","Host an imaginary celebration of {topic}. Introduce two fictional lovers, invent an alcohol-free signature drink, and offer a voluntary cheers."),
("toast","Toast and confession","Make a toast to {topic}, then share or invent one romantic confession. Nobody needs to drink or reveal personal information."),
("toast","Flirtatious menu","Invent a glamorous mocktail and a mischievous, non-explicit menu description inspired by {topic}. Present it with a dramatic flourish."),
("toast","Shared celebration","Invite a willing adult partner to trade two bold compliments and a toast inspired by {topic}. Use separate beverages, water or no drink at all."),
("touch","Choose your greeting","Offer a willing adult partner a choice of a handhold, a brief shoulder touch or a no-touch bow. Respect their choice, then improvise a romantic line about {topic}."),
("touch","Slow-dance scene","With a willing adult partner, agree on comfortable hand placement and share a short gentle dance inspired by {topic}. A solo or seated version is equally valid."),
("touch","Cheek-kiss invitation","Ask a willing adult partner whether a brief cheek kiss would be welcome. Accept any answer; a blown kiss is an equal alternative. Add a line inspired by {topic}."),
("touch","Palm-written promise","If mutually welcome, trace an imaginary symbol on a partner's palm; otherwise use your own. Explain its romantic meaning for {topic}."),
("touch","Comfortable closeness","Invite a willing adult partner to choose a comfortable distance, then exchange a bold compliment about {topic}. A brief handhold is optional and must be mutually agreed."),
("truth","Bold fictional truth","Describe the most dramatic romantic choice your fictional adult character would make during {topic}. Explain the feeling behind it without graphic details."),
("truth","Three invitations","Offer three increasingly theatrical, non-explicit invitations inspired by {topic}. Ask the room which is most charming; no one has to accept."),
("truth","The secret soundtrack","Choose three imaginary song titles that tell a romantic story about {topic}. Explain the mood of each chapter."),
("truth","Confident boundaries","In character, name something you would love and something you would decline during {topic}. Make the conversation warm, direct and playful."),
("truth","The romantic dare","Invent a bold, non-graphic romantic dare for yourself inspired by {topic}, state it aloud, then perform it or choose the neutral alternative."),
("duet","Two-person finale","Invite a willing adult partner to perform a scene about {topic}: one invitation, one reply, one compliment and a final pose. Agree on any contact first; solo narration works too."),
("duet","Chemistry in three acts","Act out the beginning, complication and joyful ending of {topic}. Use a volunteer or play both fictional adult roles yourself."),
("duet","Grand gesture relay","Invite willing players to add one thoughtful gesture to an imaginary romance about {topic}. Finish with a dramatic group bow; all contact is optional."),
("duet","Duet of compliments","Trade three increasingly theatrical compliments with a willing adult partner, using {topic} as inspiration. Keep them kind and non-explicit; imaginary partners are welcome."),
("duet","All-in curtain call","Combine a romantic line, a gentle dance gesture and a voluntary toast into a finale for {topic}. Add a mutually agreed handhold only if welcome; every part has a no-touch, no-drink version."),
],
}
DESCRIPTIONS = {
    "soft": "Creative board-game fun: drawing, stories, conversation and playful puzzles.",
    "drinking": "Toasts, table games and beverage dares. Water, mocktails and no-drink versions always count.",
    "teasing": "Playful flirting, compliments, light confessions and optional friendly touch.",
    "spicy": "Bolder adult romance, affectionate gestures and dramatic chemistry; non-graphic and optional.",
    "hot": "The boldest adult party mix: romantic performances, optional touch, confessions and celebratory toasts.",
}

def build():
    decks = {}
    for level, activities in ACTIVITIES.items():
        assert len(activities) == 25 and len(TOPICS[level]) == 10
        cards = []
        for activity_index, (category, title, template) in enumerate(activities):
            for topic_index, topic in enumerate(TOPICS[level]):
                index = activity_index * 10 + topic_index
                soft = ACTIVITIES["soft"][activity_index][2].format(topic=TOPICS["soft"][topic_index])
                prompt = template.format(topic=topic)
                cards.append({
                    "id": f"{level}-{index+1:03}", "level": level, "category": category,
                    "title": f"{title} · {topic}", "prompt": prompt,
                    "solo": prompt + " Solo: use imaginary adult characters where needed; narrating, writing or a no-touch demonstration counts.",
                    "alternative": soft, "seconds": 120, "points": 25, "gold": 1,
                })
        assert len({c["prompt"] for c in cards}) == 250
        decks[level] = cards
    data = {"version": 1, "levels": [{"id": k, "name": k.title(), "count": len(v), "description": DESCRIPTIONS[k], "adult": k != "soft"} for k,v in decks.items()], "decks": decks}
    target = ROOT / "backend/data/party-cards.json"
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    metadata = ROOT / "src/game/decks.ts"
    metadata.write_text("// Generated by scripts/build-party-cards.py; edit the source deck authoring file.\nexport const DIFFICULTIES = " + json.dumps(data["levels"], ensure_ascii=False, indent=2) + " as const;\nexport type Difficulty = typeof DIFFICULTIES[number]['id'];\n")
    print(f"Published {sum(map(len,decks.values()))} unique cards across {len(decks)} levels.")

if __name__ == "__main__":
    build()
