// Romanian text for in-play game content, keyed by the English source string.
// Sections are grouped by screen/area. Proper names of worlds and characters
// are intentionally absent: they are shown unchanged in every language.
import type { Messages } from "./types";

export const contentRo: Messages = {
  // ---- Adventurer titles and bios (character card, gallery, settings) ----
  "A collector of forgotten spells, curious detours, and secrets best left whispered.":
    "Un colecționar de vrăji uitate, ocolișuri curioase și secrete care ar trebui șoptite doar.",
  "Guided by moonlight and an unbreakable promise to protect the roads less traveled.":
    "Călăuzită de lumina lunii și de o promisiune de nezdruncinat de a apăra drumurile rar străbătute.",
  "Quick with a dagger, quicker with a smile. No locked chest has kept her waiting.":
    "Iute cu pumnalul, și mai iute cu zâmbetul. Niciun cufăr încuiat nu a stat-o să aștepte.",
  "The woodland speaks in a thousand voices. She is the one who listens.":
    "Pădurea vorbește cu o mie de voci. Ea este cea care ascultă.",
  "Sneakers laced, map forgotten, she follows music from one festival square to the next.":
    "Cu bocancii legați și harta uitată, urmează muzica din piață în piață, de la un festival la altul.",
  "An unseen guardian of ancient roads, with a past as quiet as her footsteps.":
    "Un paznic nevăzut al drumurilor străvechi, cu un trecut la fel de tăcut ca pașii ei.",
  "She left a frozen throne to see whether the warmer world was worth ruling. So far, it is.":
    "A lăsat un tron înghețat ca să vadă dacă lumea mai caldă merită condusă. Până acum, merită.",
  "A calm heart, a winter spell, and an unexpected fondness for warm village tea.":
    "O inimă calmă, o vrajă de iarnă și o slăbiciune neașteptată pentru ceaiul cald de sat.",
  "Behind the horns and crimson flames is a traveler determined to write her own fate.":
    "Dincolo de coarne și de flăcările stacojii se află o călătoare hotărâtă să-și scrie propriul destin.",
  "A royal oath brought him to the island. An adventurous heart will take him further.":
    "Un jurământ regal l-a adus pe insulă. O inimă aventuroasă îl va duce și mai departe.",
  "Every map in her satchel ends where another begins. She has never once turned back.":
    "Fiecare hartă din traista ei se termină acolo unde începe alta. Nu a dat niciodată înapoi.",
  "Light on her feet and quick to laugh, she knows every shortcut through the tall grass.":
    "Ușoară în pași și gata să râdă, cunoaște fiecare scurtătură prin iarba înaltă.",
  "The Violet Enchantress": "Vrăjitoarea violetă",
  "The Moonlight Knight": "Cavalerul luminii lunii",
  "The Scarlet Rogue": "Hoața stacojie",
  "The Elven Priestess": "Preoteasa elfă",
  "The Festival Wanderer": "Călătoarea festivalurilor",
  "The Shadow Assassin": "Asasina umbrei",
  "The Winter Queen": "Regina iernii",
  "The Frost Witch": "Vrăjitoarea gerului",
  "The Crimson Demoness": "Demonița stacojie",
  "The Royal Paladin": "Paladinul regal",
  "The Wandering Voyager": "Exploratoarea rătăcitoare",
  "The Meadow Ranger": "Ranger-ul pajiștilor",

  // ---- Tile labels and descriptions (board tooltip, tile info) ----
  "Quiet path": "Drum liniștit",
  "A moment to breathe. Your journey continues.":
    "Un moment de respiro. Călătoria continuă.",
  Mystery: "Mister",
  "An unexpected encounter. Choose your own fate.":
    "O întâlnire neașteptată. Alege-ți singur soarta.",
  Treasure: "Comoară",
  "A forgotten cache. Collect 3 gold.":
    "O ascunzătoare uitată. Strânge 3 monede de aur.",
  Fortune: "Noroc",
  "A blessing of the wild. Gain 2 gold and a clue.":
    "O binecuvântare a sălbăticiei. Câștigi 2 monede de aur și un indiciu.",
  Portal: "Portal",
  "Ancient magic carries you 3 tiles forward.":
    "Magia veche te poartă cu 3 pătrățele înainte.",
  "The beginning": "Începutul",
  "Welcome, wanderer. The island is waiting.":
    "Bine ai venit, rătăcitorule. Insula te așteaptă.",
  "The end of the path. The beginning of your legend.":
    "Capătul drumului. Începutul legendei tale.",

  // ---- Board regions and chapter subtitles (region names are proper names: kept) ----
  "The village": "Satul",
  "Every great tale begins with a small step.":
    "Orice poveste mare începe cu un pas mic.",
  "The woodland": "Pădurea",
  "Listen closely. The forest remembers.":
    "Ascultă cu atenție. Pădurea își amintește.",
  "The highlands": "Înălțimile",
  "Old magic waits beneath the stone.": "Magia veche așteaptă sub piatră.",
  "The castle": "Castelul",
  "One final climb. A thousand untold stories.":
    "Un ultim urcuș. O mie de povești nespuse.",
  // ---- Mystery encounters: titles, text and choices (encounter modal) ----
  "The lantern keeper": "Păzitorul lanternei",
  "An old keeper offers you a lantern. “It reveals what the moon cannot,” she says. A hidden path glimmers between the trees.":
    "Un bătrân păzitor îți oferă o lanternă. „Arată ceea ce nu poate arăta luna”, spune ea. Printre copaci strălucește o cărare ascunsă.",
  "Take the hidden path": "Urmează cărarea ascunsă",
  "Move forward 2 tiles": "Înaintezi 2 pătrățele",
  "Ask about the island": "Întreabă despre insulă",
  "Discover 2 clues": "Descoperi 2 indicii",
  "A riddle in the roots": "O ghicitoare în rădăcini",
  "“I have cities but no houses, forests but no trees, and rivers but no water. What am I?” The ancient oak waits for your answer.":
    "„Am orașe, dar nu case, păduri, dar nu copaci, și râuri, dar nu apă. Ce sunt?” Stejarul bătrân așteaptă răspunsul tău.",
  "A map": "O hartă",
  "Answer the riddle · gain 3 gold and a clue":
    "Răspunzi la ghicitoare · câștigi 3 monede de aur și un indiciu",
  "A dream": "Un vis",
  "The oak smiles · take a quiet step back":
    "Stejarul zâmbește · faci un pas liniștit înapoi",
  "The wandering merchant": "Negustorul rătăcitor",
  "A merchant’s cart shimmers with impossible things. Among them: a tiny compass that points to whatever your heart is looking for.":
    "Un car de negustor strălucește cu lucruri imposibile. Printre ele: o busolă mică, ce arată spre orice caută inima ta.",
  "Trade for the compass": "Schimbă pe busolă",
  "Spend 2 gold · move forward 3 tiles":
    "Cheltuiești 2 monede de aur · înaintezi 3 pătrățele",
  "Share stories instead": "Împărtășești povești în schimb",
  "Discover a clue": "Descoperi un indiciu",
  "Whispers in the well": "Șoapte în fântână",
  "A voice rises from the stone well, repeating a name forgotten centuries ago. Something golden glints far below.":
    "O voce se ridică din fântâna de piatră, rostind un nume uitat de acum secole. Ceva auriu strălucește departe, în adânc.",
  "Investigate the voice": "Cercetezi vocea",
  "Lower your lucky rope": "Coborâi funia norocoasă",
  "Collect 4 gold · move back 1 tile":
    "Strângi 4 monede de aur · dai înapoi 1 pătrățel",
  "The sleeping guardian": "Paznicul adormit",
  "A great stone fox sleeps across the path. Beside it, a narrow ledge winds around a glowing pool. Its ears twitch as you approach.":
    "O vulpe uriașă de piatră doarme în mijlocul cărării. Alături, o streașină îngustă ocolește un bazin strălucitor. Urechile îi tresar când te apropii.",
  "Sing an old lullaby": "Cânți un cântec de leagăn vechi",
  "The guardian dreams · move forward 2": "Paznicul visează · înaintezi 2",
  "Explore the glowing pool": "Explorezi bazinul strălucitor",
  "A letter from tomorrow": "O scrisoare de mâine",
  "A paper bird lands in your palm. The handwriting looks strangely familiar. “When you find the arch, trust the light,” it reads.":
    "O pasăre de hârtie se așază în palma ta. Scrisul pare ciudat de cunoscut. „Când găsești arcul, încrede-te în lumină”, scrie.",
  "Follow the paper bird": "Urmezi pasărea de hârtie",
  "Move forward 3 tiles": "Înaintezi 3 pătrățele",
  "Keep the letter safe": "Păstrezi scrisoarea în siguranță",
  "Discover 2 clues and 1 gold": "Descoperi 2 indicii și 1 monedă de aur",
  // ---- Road encounter stops (tile tooltip and party cards) ----
  "The whispering mystery box": "Cutia misterioasă șoptitoare",
  "Open a sealed box: treasure, a trick, or a mini-game. You may leave it sealed.":
    "Deschide o cutie sigilată: o comoară, o șmecherie sau un mini-joc. Poți să o lași sigilată.",
  "The crumbling crossing": "Trecerea care se prăbușește",
  "Time your crossing, spend a clue, or take a safe one-tile detour.":
    "Alege momentul trecerii, cheltuiește un indiciu sau ocolește sigur, cu un pătrățel.",
  "The travelling arcade": "Arcada călătoare",
  "A road spirit opens one of ten mini-games. Win points and gold.":
    "Un spirit al drumului deschide unul dintre cele zece mini-jocuri. Câștigi puncte și monede de aur.",
  "The bard’s dare": "Provocarea bardului",
  "Try a playful storytelling dare, take a rune challenge instead, or pass.":
    "Acceptă o provocare jucăușă de povestire, alege o încercare cu rune sau treci mai departe.",
  "The dragon’s guarded hoard": "Comoara păzită de dragon",
  "A dragon guards this tile. Face its trial, pay a toll, or retreat one tile.":
    "Un dragon păzește acest pătrățel. Înfruntă-i proba, plătește taxa sau retrage-te cu un pătrățel.",
  "The warding shrine": "Altarul protector",
  "Gain a ward that absorbs the next danger, or discover a clue.":
    "Câștigi o protecție care absoarbe următorul pericol sau descoperi un indiciu.",
  "The moonlit lockbox": "Cutia luminată de lună",
  "A second sealed box hums beside the path. Its contents change every opening.":
    "O a doua cutie sigilată vibrează lângă cărare. Conținutul ei se schimbă de fiecare dată când o deschizi.",
  "The stormglass ravine": "Râpa de sticlă a furtunii",
  "Keep your balance, use a clue, or choose a safe detour.":
    "Păstrează-ți echilibrul, folosește un indiciu sau alege un ocol sigur.",
  "The runekeeper’s games": "Jocurile păzitorului de rune",
  "Test your memory, timing, reasoning, or route finding.":
    "Pune-ți la încercare memoria, reflexele, logica sau simțul drumului.",
  "The mischievous hex": "Blestemul năzdrăvan",
  "Break the hex in a trial or accept a slower next roll in exchange for a clue.":
    "Rupe blestemul printr-o probă sau acceptă o aruncare mai lentă la următoarea mutare, în schimbul unui indiciu.",
  "The skywarden’s challenge": "Provocarea paznicului cerului",
  "A winged guardian watches this passage. Win its trial for a shortcut.":
    "Un paznic înaripat veghează această trecere. Câștigă proba lui pentru o scurtătură.",
  "The lantern dare": "Provocarea lanternei",
  "Invent a tiny legend for your hero, choose a puzzle, or simply pass.":
    "Inventează o mică legendă pentru eroul tău, alege un puzzle sau treci pur și simplu mai departe.",
  "The wayfarer’s camp": "Tabăra călătorilor",
  "Rest by the fire. Recover gold or remove a lingering hex.":
    "Odihnește-te lângă foc. Recuperezi monede de aur sau înlături un blestem persistent.",
  "The final puzzle pavilion": "Pavilionul puzzle-ului final",
  "One last invitation to earn points before the destination.":
    "O ultimă invitație de a câștiga puncte înainte de destinație.",
  "The starfall coffer": "Lada căderii stelelor",
  "The last mystery box: golden luck, a mimic’s trick, or a skill trial.":
    "Ultima cutie misterioasă: noroc aurit, o șmecherie a unui mimic sau o probă de îndemânare.",
  "The elder at the gate": "Bătrânul de la poartă",
  "The elder guards the approach to the finish. A brave trial can carry you onward.":
    "Bătrânul păzește apropierea de final. O probă curajoasă te poate duce mai departe.",
  "The last falling stones": "Ultimele pietre care cad",
  "Watch your footing. A failed crossing sends you back, but a ward protects you.":
    "Ai grijă unde calci. O trecere ratată te trimite înapoi, dar o protecție te apără.",
  // ---- World and region descriptions (world gallery, preview, tooltips) ----
  "Where the wild remembers": "Unde sălbăticia își amintește",
  "Lantern-lit villages, whispering woods, and a forgotten castle above the clouds.":
    "Sate luminate de lanterne, păduri care șoptesc și un castel uitat deasupra norilor.",
  "Brave the parapet. Earn your wings.":
    "Înfruntă parapetul. Câștigă-ți aripile.",
  "A Fourth Wing inspired dragon-rider academy. Cross storm-swept parapets, face the gauntlet, and bond with your dragon.":
    "O academie a călăreților de dragoni, inspirată de Fourth Wing. Traversează parapeturi bătute de furtună, înfruntă gantlet-ul și leagă-te de dragonul tău.",
  "The crossing": "Trecerea",
  "The parapet is slick with rain. Far below, clouds swirl between the mountain spires. A bronze dragon circles the academy.":
    "Parapetul e alunecos de ploaie. Departe, în jos, norii se rotesc printre crestele munților. Un dragon de bronz plutește în cerc deasupra academiei.",
  "Trust your balance": "Ai încredere în echilibrul tău",
  "Take a chance · move forward 2 tiles": "Riscă · înaintezi 2 pătrățele",
  "Read the wind": "Citești vântul",
  "Explore carefully · gain 3 gold and a clue":
    "Explorezi cu grijă · câștigi 3 monede de aur și un indiciu",
  "The choosing": "Alegerea",
  "An immense shadow falls across the clearing. A dragon watches you with molten-gold eyes. This bond must be earned.":
    "O umbră uriașă cade peste luminiș. Un dragon te privește cu ochi de aur topit. Această legătură trebuie câștigată.",
  "Stand your ground": "Rămâi pe poziție",
  "Offer your trust": "Oferă-ți încrederea",
  "A signet awakens": "Un sigiliu se trezește",
  "Lightning dances across your fingertips. Your dragon’s voice echoes in your mind: “Power follows courage.”":
    "Fulgere dansează pe vârful degetelor tale. Vocea dragonului tău răsună în minte: „Puterea urmează curajul.”",
  "Channel the storm": "Canalizează furtuna",
  "Study your signet": "Studiază-ți sigiliul",
  "A secret beneath the snow": "Un secret sub zăpadă",
  "Silver pines, frozen rivers, luminous ice spires, and the palace of the long winter.":
    "Pini argintii, râuri înghețate, turle de gheață strălucitoare și palatul iernii lungi.",
  "The ice remembers": "Gheața își amintește",
  "Beneath the frozen lake, an ancient city glows. A melody rises through the ice.":
    "Sub lacul înghețat strălucește un oraș străvechi. O melodie se ridică prin gheață.",
  "Follow the melody": "Urmează melodia",
  "Study the ancient lights": "Studiezi luminile străvechi",
  "The white fox": "Vulpea albă",
  "A silver fox leaves no tracks in the snow. It turns, waiting for you to follow.":
    "O vulpe argintie nu lasă urme în zăpadă. Se întoarce și te așteaptă să o urmezi.",
  "Follow its footsteps": "Urmează-i urmele",
  "Offer a little kindness": "Oferă puțină bunătate",
  "Every grain holds a story": "Fiecare bob de nisip ține o poveste",
  "Golden dunes, turquoise oases, weathered ruins, and a sun temple lost to time.":
    "Dune aurii, oaze turcoaz, ruine erodate și un templu al soarelui pierdut în timp.",
  "The sand oracle": "Oracolul nisipului",
  "A face takes shape in the shifting dunes. “What you seek is already walking toward you.”":
    "Un chip prinde contur în dunele mișcătoare. „Ceea ce cauți merge deja spre tine.”",
  "Ask about your future": "Întreabă despre viitorul tău",
  "Search the buried ruins": "Cauți în ruinele îngropate",
  "An impossible oasis": "O oază imposibilă",
  "Palm trees shimmer on the horizon. The water reflects a sky full of unfamiliar stars.":
    "Palmieri strălucesc la orizont. Apa oglindește un cer plin de stele necunoscute.",
  "Drink from the spring": "Bei din izvor",
  "Read the constellations": "Citești constelațiile",
  "Follow the falling petals": "Urmează petalele care cad",
  "Blossom groves, vermilion gates, jade terraces, and a moonlit mountain sanctuary.":
    "Livezi înflorite, porți stacojii, terase de jad și un sanctuar de munte luminat de lună.",
  "The paper crane": "Cocorul de hârtie",
  "A paper crane unfolds itself on your shoulder. Inside is a poem written by the moon.":
    "Un cocor de hârtie se desfășoară pe umărul tău. Înăuntru este o poezie scrisă de lună.",
  "Follow the crane": "Urmează cocorul",
  "Finish the poem": "Termină poezia",
  "Tea with a spirit": "Ceai cu un spirit",
  "Under a thousand falling petals, a fox spirit pours a second cup of tea.":
    "Sub o mie de petale care cad, un spirit-vulpe toarnă a doua ceașcă de ceai.",
  "Accept the invitation": "Acceptă invitația",
  "Ask the spirit’s name": "Întreabă numele spiritului",
  "A journey forged in fire": "O călătorie făurită în foc",
  "Obsidian cliffs, rivers of molten gold, ember trees, and a fortress above the caldera.":
    "Stânci de obsidian, râuri de aur topit, copaci de jar și o cetate deasupra calderei.",
  "The ember smith": "Fierarul de jar",
  "A hammer rings out over the lava. “Every blade has a story,” the smith says. “What is yours?”":
    "Un ciocan răsună peste lavă. „Fiecare lamă are o poveste”, spune fierarul. „Care este a ta?”",
  "Help at the forge": "Ajutor la fierărie",
  "Trade a story": "Schimbă o poveste",
  "Heart of the mountain": "Inima muntelui",
  "A crystal beats like a heart within the obsidian. Warmth flows through the stone.":
    "Un cristal bate ca o inimă în obsidian. Căldura curge prin piatră.",
  "Touch the crystal": "Atinge cristalul",
  "Listen to the mountain": "Ascultă muntele",
  "Beyond the last horizon": "Dincolo de ultimul orizont",
  "Coral shores, palm groves, turquoise cascades, and a lighthouse at the edge of the sky.":
    "Țărmuri de corali, zăvoaie de palmieri, cascade turcoaz și un far la marginea cerului.",
  "A message in glass": "Un mesaj în sticlă",
  "The tide delivers a bottle from a ship that disappeared a hundred years ago. The ink is still wet.":
    "Valul aduce o sticlă de pe o corabie care a dispărut acum o sută de ani. Cerneala este încă proaspătă.",
  "Find the missing ship": "Găsește corabia dispărută",
  "Decode the message": "Descifrează mesajul",
  "The pearl keeper": "Păzitorul perlelor",
  "A tiny crab presents you with a pearl. The entire ocean seems to glow inside it.":
    "Un crab mic îți oferă o perlă. Întregul ocean pare să strălucească în ea.",
  "Follow the crab": "Urmează crabul",
  "Examine the pearl": "Examinează perla",
  "A world beneath the world": "O lume sub lume",
  "Giant luminous mushrooms, spore-lit pools, hidden grottoes, and an ancient fungal citadel.":
    "Ciuperci luminoase uriașe, bazinuri luminate de spori, grote ascunse și o cetate fungică străveche.",
  "The mushroom choir": "Corul ciupercilor",
  "A circle of luminous mushrooms hums a chord you recognize from a dream. A tiny door opens in the largest stem.":
    "Un cerc de ciuperci luminoase murmură un acord pe care îl recunoști dintr-un vis. O mică ușă se deschide în cea mai mare tulpină.",
  "Step inside": "Intră înăuntru",
  "Join the song": "Alătură-te cântecului",
  "A thousand tiny stars": "O mie de stelute",
  "A cloud of spores forms a map in the darkness. There is a glowing mark where you stand.":
    "Un nor de spori formează o hartă în întuneric. Există un semn strălucitor acolo unde stai.",
  "Follow the spore map": "Urmează harta sporilor",
  "Collect a glowing sample": "Strânge o probă strălucitoare",
  "Walk between the stars": "Mergi printre stele",
  "Violet stardust, orbiting crystals, celestial ruins, and an observatory above the night.":
    "Praf de stele violet, cristale orbitale, ruine cerești și un observator deasupra nopții.",
  "The wandering star": "Steaua rătăcitoare",
  "A tiny star has fallen into your pocket. It is homesick, and it knows a shortcut through the night.":
    "O stea mică a căzut în buzunarul tău. Îi este dor de casă și cunoaște o scurtătură prin noapte.",
  "Help it return home": "Ajut-o să se întoarcă acasă",
  "Ask about the cosmos": "Întreabă despre cosmos",
  "Tomorrow’s constellation": "Constelația de mâine",
  "Through a cracked telescope, the stars spell out your name. One begins to move.":
    "Printr-un telescop crăpat, stelele îți scriu numele. Una începe să se miște.",
  "Follow the moving star": "Urmează steaua care se mișcă",
  "Chart the constellation": "Trasează constelația",
  "An adventure out of time": "O aventură scoasă din timp",
  "Copper forests, turquoise canals, turning gears, and the great clock at the end of time.":
    "Păduri de aramă, canale turcoaz, roți dințate care se învârt și marele ceas de la capătul timpului.",
  "The clockmaker’s apprentice": "Ucenicul ceasornicarului",
  "A brass bird winds itself up and offers a key. Somewhere, a clock begins ticking backward.":
    "O pasăre de alamă se înfășoară și îți oferă o cheie. Undeva, un ceas începe să bată invers.",
  "Turn the key": "Întoarce cheia",
  "Find the clockmaker": "Găsește ceasornicarul",
  "A minute to spare": "Un minut în plus",
  "The world stands perfectly still. A little automaton offers you a minute it has been saving for years.":
    "Lumea stă perfect nemișcată. Un mic automat îți oferă un minut pe care l-a economisit ani de zile.",
  "Borrow a minute": "Împrumută un minut",
  "Repair the automaton": "Repară automatul",
  "Climb where the thunder sleeps": "Urcă acolo unde doarme tunetul",
  "Nine storm-lashed floors rise along a forked lightning ridge. Reach the storm beacon through rain, dark pines and sky bridges.":
    "Nouă etaje bătute de furtună se ridică de-a lungul unei creste de fulger. Ajunge la farul furtunii prin ploaie, pini întunecați și punți de nori.",
  "The thunder bell": "Clopotul tunetului",
  "A bell rings without a rope. Each note splits the storm and reveals one more step toward the summit.":
    "Un clopot sună fără funie. Fiecare notă despică furtuna și descoperă încă un pas spre vârf.",
  "Ring the bell again": "Sună clopotul din nou",
  "Press onward · move 2 tiles and discover a clue":
    "Înaintezi 2 pătrățele și descoperi un indiciu",
  "Listen between the thunder": "Ascultă printre tunete",
  "Explore the secret · gain 3 gold and a clue":
    "Explorezi secretul · câștigi 3 monede de aur și un indiciu",
  "A message from Stormreach Beacon": "Un mesaj de la Farul Furtunii",
  "A sealed note bears the mark of Stormreach Beacon. “The old way through The Lightning Stair still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Farului Furtunii. „Vechea cale prin Scara Fulgerului își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Follow the glowing seal": "Urmează sigiliul strălucitor",
  "Study the forgotten route": "Studiază drumul uitat",
  "Every falling leaf is a promise":
    "Fiecare frunză care cade este o promisiune",
  "A maple-leaf island of copper trees, golden fields, harvest lanterns and a monumental tree at the end of the trail.":
    "O insulă de frunze de arțar, cu copaci de aramă, câmpuri aurii, lanterne de recoltă și un copac monumental la capătul potecii.",
  "The last apple": "Ultimul măr",
  "The orchard keeper offers you the final golden apple of the season. Inside its skin, an autumn sky is moving.":
    "Păzitorul livezii îți oferă ultimul măr auriu al sezonului. Sub coaja lui se mișcă un cer de toamnă.",
  "Plant its shining seeds": "Plantează sămânțele strălucitoare",
  "Share the harvest": "Împarte recolta",
  "A message from The Evergold Tree": "Un mesaj de la Copacul Evergold",
  "A sealed note bears the mark of The Evergold Tree. “The old way through Harvest Heights still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Copacului Evergold. „Vechea cale prin Înălțimile Recoltei își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Find the stillness at the center": "Găsește liniștea din centru",
  "An eight-petal lotus kingdom with jade terraces, emerald waterways, blossom pavilions and a dragon shrine.":
    "Un regat de lotus cu opt petale, cu terase de jad, ape smarald, pavilioane de flori și un altar al dragonului.",
  "The silent dragon": "Dragonul tăcut",
  "A jade dragon statue opens one eye. “What grows stronger when it is shared?” it asks, as the lotus flowers turn toward you.":
    "O statuie de jad a unui dragon își deschide un ochi. „Ce crește mai puternic atunci când este împărtășit?” întreabă ea, în timp ce florile de lotus se întorc spre tine.",
  "Offer the dragon your hope": "Oferă dragonului speranța ta",
  "Share an old story": "Împărtășește o poveste veche",
  "A message from The Jade Dragon Shrine":
    "Un mesaj de la Altarul Dragonului de Jad",
  "A sealed note bears the mark of The Jade Dragon Shrine. “The old way through Eight-Petal Stair still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Altarului Dragonului de Jad. „Vechea cale prin Scara cu Opt Petale își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Some stories refuse to rest": "Unele povești nu vor să se odihnească",
  "A great stone cross floats above silver fog. Grave gardens, silent crypts and pale flames lead to the cathedral of names.":
    "O mare cruce de piatră plutește deasupra ceții argintii. Grădini de morminte, criptele tăcute și flăcări palide duc spre catedrala numelor.",
  "A name in the marble": "Un nume în marmură",
  "A forgotten name appears on a blank stone. Your lantern burns silver, and a grateful voice whispers a passage through the crypt.":
    "Un nume uitat apare pe o piatră goală. Lanterna ta arde argintiu, iar o voce recunoscătoare șoptește o cale prin cripta.",
  "Follow the silver flame": "Urmează flacăra argintie",
  "Remember the name": "Amintește-ți numele",
  "A message from Cathedral of Remembrance":
    "Un mesaj de la Catedrala Amintirii",
  "A sealed note bears the mark of Cathedral of Remembrance. “The old way through Namesake Steps still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Catedralei Amintirii. „Vechea cale prin Treptele Numelui își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "The sky is only the beginning": "Cerul este doar începutul",
  "Two broad cloud banks shelter a floating port. Brass towers and airships climb six airy floors toward the harbor master’s beacon.":
    "Doi munți de nori adăpostesc un port plutitor. Turnuri de alamă și aeronave urcă șase etaje aerisite spre farul căpitanului portului.",
  "The runaway airship": "Aeronava fugară",
  "A tiny airship has slipped its moorings. Its captain waves a handkerchief and promises you a view beyond the clouds.":
    "O mică aeronavă și-a rupt amarele. Căpitanul ei flutură o batistă și îți promite o priveliște dincolo de nori.",
  "Catch the dangling ladder": "Prinde scara care atârnă",
  "Repair the mooring line": "Repară cablul de ancorare",
  "A message from The Harbor Beacon": "Un mesaj de la Farul Porturilor",
  "A sealed note bears the mark of The Harbor Beacon. “The old way through The Aerial Lanes still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Farului Porturilor. „Vechea cale prin Culoarele Aeriene își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Follow the tide inward": "Urmează valul spre interior",
  "A curling coral island with sheltered coves, warm peach stone, turquoise pools and a luminous reef sanctuary.":
    "O insulă de corali răsucită, cu golfuri adăpostite, piatră caldă piersică, bazine turcoaz și un sanctuar recifal luminos.",
  "The coral gardener": "Grădinarul de corali",
  "A coral gardener is planting stars beneath the water. One rises to the surface and asks for directions home.":
    "Un grădinar de corali plantează stele sub apă. Una urcă la suprafață și îți cere indicații spre casă.",
  "Carry the little star": "Du steluța mică",
  "Help tend the reef": "Ajută la îngrijirea recifului",
  "A message from Sanctuary of the Reef": "Un mesaj de la Sanctuarul Recifului",
  "A sealed note bears the mark of Sanctuary of the Reef. “The old way through Spiralwater Steps still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Sanctuarului Recifului. „Vechea cale prin Treptele Spirală a Apei își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "A kingdom built one golden cell at a time":
    "Un regat construit celulă cu celulă, de aur",
  "Connected hexagonal honeycombs form a golden desert. Amber hives, glassy streams and a sunlit apiary crown the board.":
    "Faguri hexagonali conectați formează un deșert auriu. Stupi de chihlimbar, pâraie sticloase și un stup luminat de soare încoronează tabla.",
  "The amber messenger": "Mesagerul de chihlimbar",
  "A mechanical bee lands on your sleeve. Its honeycomb message contains a map drawn in liquid sunlight.":
    "O albină mecanică ți se așază pe mânecă. Mesajul ei din fagure conține o hartă desenată cu lumină lichidă de soare.",
  "Follow the messenger": "Urmează mesagerul",
  "Decode the honeycomb": "Descifrează fagurele",
  "A message from The Sun Queen’s Apiary":
    "Un mesaj de la Stupul Reginei Soarelui",
  "A sealed note bears the mark of The Sun Queen’s Apiary. “The old way through Honeyglass Rise still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Stupului Reginei Soarelui. „Vechea cale prin Înălțimea Mierii își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Let the mountain shape your legend": "Lasă muntele să-ți modeleze legenda",
  "Eight high basalt floors form an enormous anvil. Molten channels, ember gardens and a colossal forge glow against the night.":
    "Opt etaje înalte de bazalt formează o nicovală uriașă. Canale de metal topit, grădini de jar și o forjă colosală strălucesc în noapte.",
  "The unfinished blade": "Lama nefinisată",
  "The forge master holds a blade that reflects every choice you have made. “It still needs a name,” she says.":
    "Maestra fierar ține o lamă care reflectă fiecare alegere pe care ai făcut-o. „Încă are nevoie de un nume”, spune ea.",
  "Strike the final spark": "Aprinde ultima scânteie",
  "Give the blade a name": "Dă lamei un nume",
  "A message from The Worldforge": "Un mesaj de la Făurăria Lumii",
  "A sealed note bears the mark of The Worldforge. “The old way through Molten Hammer Pass still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Făuriei Lumii. „Vechea cale prin Pasul Ciocanului Topit își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Every color remembers the light": "Fiecare culoare își amintește lumina",
  "A six-point crystalline star with six rising terraces, white pines, spectral streams and an enormous living prism.":
    "O stea cristalină cu șase vârfuri, șase terase care se ridică, pini albi, pâraie spectrale și o prismă vie uriașă.",
  "The missing color": "Culoarea dispărută",
  "A prism has lost one of its colors. A tiny violet light hides inside your shadow, waiting to be invited out.":
    "O prismă și-a pierdut una dintre culori. O mică lumină violetă se ascunde în umbra ta și așteaptă să fie invitată afară.",
  "Release the violet light": "Eliberează lumina violetă",
  "Study the prism’s memory": "Studiază amintirea prismei",
  "A message from The Living Prism": "Un mesaj de la Prisma Vie",
  "A sealed note bears the mark of The Living Prism. “The old way through Spectrum Heights still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Prismei Vii. „Vechea cale prin Înălțimea Spectrului își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "The oldest paths are still alive": "Cele mai vechi cărări sunt încă vii",
  "A winding serpent-shaped jungle rises through seven floors of vine-covered ruins and emerald water toward an overgrown sun altar.":
    "O junglă sinuoasă, în forma unui șarpe, urcă prin șapte etaje de ruine acoperite de liane și apă smarald, spre un altar al soarelui acoperit de vegetație.",
  "The vine bridge": "Puntea de liane",
  "A bridge of living vines uncoils across the ravine. The jungle asks for a song it has never heard before.":
    "O punte de liane vii se desfășoară peste râpă. Junglă cere un cântec pe care nu l-a auzit niciodată.",
  "Sing your own melody": "Cântă propria ta melodie",
  "Listen to the jungle’s song": "Ascultă cântecul junglei",
  "A message from The Overgrown Sun Altar":
    "Un mesaj de la Altarul Soarelui Acoperit",
  "A sealed note bears the mark of The Overgrown Sun Altar. “The old way through Serpentback Steps still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Altarului Soarelui Acoperit. „Vechea cale prin Treptele Șarpelui își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Courage is a kind of kindness": "Curajul este un fel de bunătate",
  "A heart-shaped garden island with rose groves, soft pink pools, flowering terraces and a fountain of wishes.":
    "O insulă-grădină în formă de inimă, cu livezi de trandafiri, bazine roz moi, terase înflorite și o fântână a dorințelor.",
  "A wish in the fountain": "O dorință în fântână",
  "A paper rose floats upstream. Its petals carry a wish someone was too afraid to speak aloud.":
    "Un trandafir de hârtie plutește în amonte. Petalele lui poartă o dorință pe care cineva s-a temut să o spună cu voce tare.",
  "Carry the wish onward": "Du dorința mai departe",
  "Plant the paper rose": "Plantează trandafirul de hârtie",
  "A message from The Heartwell Fountain": "Un mesaj de la Fântâna Inimii",
  "A sealed note bears the mark of The Heartwell Fountain. “The old way through Wishwater Terrace still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Fântânii Inimii. „Vechea cale prin Terasa Dorințelor își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Two moons. One forgotten promise.": "Două luni. O promisiune uitată.",
  "Interlocking lunar crescents frame violet causeways and twin moon stones suspended over five silver floors.":
    "Semilune lunare împletite încadrează căi violete și două pietre ale lunii suspendate peste cinci etaje argintii.",
  "The second shadow": "A doua umbră",
  "Under the twin moons, your shadow divides in two. One points toward the castle. The other holds out a silver key.":
    "Sub cele două luni, umbra ta se împarte în două. Una arată spre castel. Cealaltă îți întinde o cheie argintie.",
  "Take the silver key": "Ia cheia argintie",
  "Follow the patient shadow": "Urmează umbra răbdătoare",
  "A message from The Twin Moon Stones":
    "Un mesaj de la Pietrele celor Două Luni",
  "A sealed note bears the mark of The Twin Moon Stones. “The old way through Silver Promise Steps still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Pietrelor celor Două Luni. „Vechea cale prin Treptele Promisiunii Argintii își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Borrow a moment from forever": "Împrumută un moment din eternitate",
  "A tall hourglass island holds eight clockwork floors, sand-fall canals, bronze gardens and a monumental turning hourglass.":
    "O insulă înaltă, în formă de clepsidră, are opt etaje mecanice, canale cu nisip care curge, grădini de alamă și o clepsidră monumentală care se întoarce.",
  "The borrowed minute": "Minutul împrumutat",
  "A clockwork fox offers you a minute from a day that never happened. It ticks softly in a small brass box.":
    "Un automat în formă de vulpe îți oferă un minut dintr-o zi care nu a existat niciodată. Ticăie încet într-o cutiuță mică de alamă.",
  "Borrow the missing minute": "Împrumută minutul lipsă",
  "Repair the brass box": "Repară cutia de alamă",
  "A message from The Hourglass of Ages": "Un mesaj de la Clepsidra Veacurilor",
  "A sealed note bears the mark of The Hourglass of Ages. “The old way through Pendulum Rise still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Clepsidrei Veacurilor. „Vechea cale prin Coborârea Pendulului își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Sail on the wings of the tide": "Navighează pe aripile mareei",
  "A wide manta-shaped lagoon with low pearl terraces, opal streams, coral gardens and a great glowing shell.":
    "O lagună largă, în formă de rază, cu terase joase de perle, pâraie de opal, grădini de corali și o scoică mare strălucitoare.",
  "The shell’s song": "Cântecul scoicii",
  "An enormous shell hums the lullaby of the deep ocean. A little pearl rolls toward you like a curious eye.":
    "O scoică uriașă murmură cântecul de leagăn al oceanului adânc. O mică perlă se rostogolește spre tine ca un ochi curios.",
  "Answer the ocean’s song": "Răspunde cântecului oceanului",
  "Polish the wandering pearl": "Lustruiește perla rătăcitoare",
  "A message from The Great Opal Shell": "Un mesaj de la Scoica Mare de Opal",
  "A sealed note bears the mark of The Great Opal Shell. “The old way through Pearlwater Steps still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Scoicii Mari de Opal. „Vechea cale prin Treptele Perlei Apei își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Find the heart inside the machine": "Găsește inima din interiorul mașinii",
  "Eight radial spokes form an ancient wheel. Six green-copper levels lead through moving gears and canals to the dormant world engine.":
    "Opt spițe radiale formează o roată străveche. Șase niveluri de cupru verde duc, prin roți dințate și canale, spre motorul lumii adormit.",
  "The sleeping engine": "Motorul adormit",
  "A thousand gears stand still. A single seedling is growing through the engine’s heart, and its leaves turn like little wheels.":
    "O mie de roți stau nemișcate. Un singur puiet crește prin inima motorului, iar frunzele lui se întorc ca niște roți mici.",
  "Wind the sleeping engine": "Pornește motorul adormit",
  "Water the copper seedling": "Udă puiețul de cupru",
  "A message from The Verdigris Heart": "Un mesaj de la Inima Verdigrisului",
  "A sealed note bears the mark of The Verdigris Heart. “The old way through Turbine Heights still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Inimii Verdigrisului. „Vechea cale prin Înălțimile Turbinei își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "The summit is a promise you keep":
    "Vârful este o promisiune pe care o respecți",
  "A triangular mountain island climbs nine dramatic floors. Glacier pines, blue ice and narrow terraces lead to the highest beacon.":
    "O insulă-munte triunghiulară urcă nouă etaje dramatice. Pini de ghețar, gheață albastră și terase înguste duc spre cel mai înalt far.",
  "The climber’s lantern": "Lanterna alpinistului",
  "A lantern hangs from a rope above the clouds. The climber who left it is still searching for the first sunrise.":
    "O lanternă atârnă de o funie deasupra norilor. Alpinistul care a lăsat-o caută încă primul răsărit.",
  "Carry the lantern higher": "Ridic-o lanterna mai sus",
  "Read the climber’s journal": "Citește jurnalul alpinistului",
  "A message from The Summit Beacon": "Un mesaj de la Farul Vârfului",
  "A sealed note bears the mark of The Summit Beacon. “The old way through The Ninefold Stair still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Farului Vârfului. „Vechea cale prin Scara Nouă își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "What the sea keeps, the tide reveals": "Ce păstrează marea, valul dezvăluie",
  "A broken atoll surrounds a quiet lagoon. Three low floors hold submerged arches, coral ruins and a palace remembered by the tide.":
    "Un atol rupt înconjoară o lagună liniștită. Trei etaje joase țin arcade scufundate, ruine de corali și un palat amintit de val.",
  "The city under glass": "Orașul sub sticlă",
  "At low tide, a street of blue glass rises from the lagoon. Every door opens onto a different memory of the sea.":
    "Când scade marea, o stradă de sticlă albastră se ridică din lagună. Fiecare ușă se deschide spre altă amintire a mării.",
  "Enter the blue street": "Intră pe strada albastră",
  "Map the returning city": "Desenează harta orașului care revine",
  "A message from The Palace Below": "Un mesaj de la Palatul de Dedesubt",
  "A sealed note bears the mark of The Palace Below. “The old way through Lagoon Steps still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Palatului de Dedesubt. „Vechea cale prin Treptele Lagunei își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Turn a corner. Change the dream.": "Fă un colț. Schimbă visul.",
  "A cutout labyrinth floats in violet mist. Seven surreal floors hold giant mushrooms, drifting lights and an open book that writes itself.":
    "Un labirint decupat plutește într-o ceață violetă. Șapte etaje suprarealiste țin ciuperci uriașe, lumini care plutesc și o carte deschisă care se scrie singură.",
  "The unwritten page": "Pagina nescrisă",
  "An enormous book opens to a page bearing your name. The next sentence waits patiently for you to choose its first word.":
    "O carte uriașă se deschide la o pagină cu numele tău. Următoarea propoziție așteaptă răbdătoare să alegi primul ei cuvânt.",
  "Write a brave beginning": "Scrie un început curajos",
  "Read the margin notes": "Citește notițele de pe margine",
  "A message from The Book of Elsewhere": "Un mesaj de la Cartea de Altundeva",
  "A sealed note bears the mark of The Book of Elsewhere. “The old way through Seven Dream Steps still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Cărții de Altundeva. „Vechea cale prin Treptele Viselor își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "A thousand lights. A thousand stories.":
    "O mie de lumini. O mie de povești.",
  "Four lantern-shaped pavilions surround a midnight market. Five warm terraces hold blossom trees, floating lights and the wishkeeper’s shrine.":
    "Patru pavilioane în formă de lanternă înconjoară o piață de noapte. Cinci terase calde țin copaci înfloriți, lumini plutitoare și altarul păzitorului dorințelor.",
  "The lantern seller": "Vânzătorul de lanterne",
  "A lantern seller offers you a light that glows with the memory of your happiest day. “Carry it where it is needed.”":
    "Un vânzător de lanterne îți oferă o lumină care strălucește cu amintirea celei mai fericite zile a ta. „Du-o unde este nevoie de ea.”",
  "Share the lantern’s warmth": "Împarte căldura lanternei",
  "Tell the seller your story": "Spune-i vânzătorului povestea ta",
  "A message from The Thousand-Light Shrine":
    "Un mesaj de la Altarul celor O Mie de Lumini",
  "A sealed note bears the mark of The Thousand-Light Shrine. “The old way through Wishkeeper Rise still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Altarului celor O Mie de Lumini. „Vechea cale prin Urcușul Păzitorului Dorințelor își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Walk where the northern lights fall": "Mergi unde cad luminile nordului",
  "A long waving ribbon of ice climbs eight floors beneath luminous curtains. Frost gardens and colored snow lead to the northern-light sanctuary.":
    "O fâșie lungă de gheață ondulată urcă opt etaje sub perdele luminoase. Grădini de promoroacă și zăpadă colorată duc spre sanctuarul luminii nordului.",
  "The fallen northern light": "Lumina nordului căzută",
  "A ribbon of aurora has tangled in a pine tree. It sings in colors, and the forest is waiting for you to set it free.":
    "O fâșie de aurora s-a încurcat într-un pin. Cântă în culori, iar pădurea te așteaptă să o eliberezi.",
  "Untangle the northern light": "Desfă lumina nordului",
  "Learn its colored song": "Învață cântecul ei colorat",
  "A message from Sanctuary of the Aurora": "Un mesaj de la Sanctuarul Aurorei",
  "A sealed note bears the mark of Sanctuary of the Aurora. “The old way through Eight-Color Stair still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Sanctuarului Aurorei. „Vechea cale prin Scara celor Opt Culori își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Every crack hides a doorway": "Fiecare crăpătură ascunde o ușă",
  "Four drifting shards of ancient ice lock together across six floors. Cross frozen crevasses and blue caves to the glowing heart of the glacier.":
    "Patru fragmente de gheață veche, la deriva, se îmbină pe șase etaje. Treci peste crevase înghețate și peșteri albastre spre inima strălucitoare a ghețarului.",
  "The singing crevasse": "Crevasa care cântă",
  "Wind hums through a deep crack in the ice. Far below, something blue answers in perfect harmony.":
    "Vântul bâzâie printr-o fisură adâncă din gheață. Departe, în jos, ceva albastru răspunde în armonie perfectă.",
  "Climb down toward the song": "Coboară spre cântec",
  "Chart the crevasse from above": "Trasează crevasa de sus",
  "A message from The Glacier Heart": "Un mesaj de la Inima Ghețarului",
  "A sealed note bears the mark of The Glacier Heart. “The old way through Shardlight Hollow still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Inimii Ghețarului. „Vechea cale prin Adăpostul Schijelor de Lumină își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "The echoes remember your name": "Ecourile îți amintesc numele",
  "Twin red mesas face each other across a winding river canyon. Rope bridges, cliff dwellings and a great stone arch frame the path west.":
    "Două mese roșii se privesc peste un canion îngust, străbătut de un râu. Poduri de frânghie, locuințe în stâncă și un mare arc de piatră încadrează drumul spre vest.",
  "The echo that answers back": "Ecoul care răspunde",
  "You call into the canyon. The echo replies with words you never said, and points toward a hidden ledge.":
    "Strigi în canion. Ecoul îți răspunde cu cuvinte pe care nu le-ai rostit și arată spre o streașină ascunsă.",
  "Follow the echo’s directions": "Urmează indicațiile ecoului",
  "Search the ledge for its source": "Caută sursa pe streașină",
  "A message from The Sunset Arch": "Un mesaj de la Arcul Apusului",
  "A sealed note bears the mark of The Sunset Arch. “The old way through Echo Mesa still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Arcului Apusului. „Vechea cale prin Mesa Ecoului își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Follow the lights, not the fog": "Urmează luminile, nu ceața",
  "A scattered marsh of lily-pad isles glows with lantern fungi. Boardwalks wind past sleeping frogs and a sunken shrine to the Lantern Throne.":
    "O mlaștină risipită, cu insule-nufăr, strălucește de ciuperci-lanternă. Podine de lemn trec pe lângă broaște adormite și un altar scufundat al Tronului Lanternei.",
  "The will-o’-wisp’s bargain": "Târgul fluturelui-fantomă",
  "A tiny light bobs in front of you. It offers to guide you through the fog in exchange for a song.":
    "O lumină mică se leagănă în fața ta. Îți oferă să te ghideze prin ceață în schimbul unui cântec.",
  "Sing and follow the wisp": "Cântă și urmează fluturele",
  "Find the path without it": "Găsește drumul fără el",
  "A message from Lantern Throne": "Un mesaj de la Tronul Lanternei",
  "A sealed note bears the mark of Lantern Throne. “The old way through The Sunken Shrine still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Tronului Lanternei. „Vechea cale prin Altarul Scufundat își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Where fallen stars are reborn": "Unde stelele căzute renasc",
  "A ringed atoll of meteor stone circles a glowing crater. Orbiting steps carry you over the forge to the crown where new stars are hammered.":
    "Un atol inelar de piatră de meteorit înconjoară un crater strălucitor. Trepte orbitale te poartă peste făurărie, spre coroana unde se bat stele noi.",
  "A cooling star": "O stea care se răcește",
  "A small star lies hissing in the dust, still warm. The smiths of the ring would pay well for it — or teach you how to shape it.":
    "O stea mică zace sfârâind în praf, încă fierbinte. Făurarii inelului ar plăti bine pentru ea, sau te-ar învăța cum să o modelezi.",
  "Carry it to the forge": "Du-o la făurărie",
  "Learn the starsmith’s craft": "Învață meșteșugul făuritorilor de stele",
  "A message from Starforge Crown": "Un mesaj de la Coroana Stelară",
  "A sealed note bears the mark of Starforge Crown. “The old way through The Anvil of Stars still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Coroanei Stelare. „Vechea cale prin Nicovala Stelelor își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "The tide always brings something back": "Valul aduce mereu ceva înapoi",
  "A long crescent of white sand and saltglass pools curls around a bright lagoon. Pier markets and coral stairs lead to a lighthouse of green glass.":
    "O lungă semilună de nisip alb și bazine de sticlă sărată se înfășoară în jurul unei lagune strălucitoare. Piețe de chei și trepte de corali duc spre un far din sticlă verde.",
  "The message in a bottle": "Mesajul dintr-o sticlă",
  "A green bottle rolls to your feet. The note inside is addressed to you, written in your own handwriting.":
    "O sticlă verde se rostogolește la picioarele tale. Biletul din ea e adresat ție, scris cu propria ta mână.",
  "Follow the note’s map": "Urmează harta din bilet",
  "Write a reply and send it back": "Scrie un răspuns și trimite-l înapoi",
  "A message from Saltglass Lighthouse":
    "Un mesaj de la Farul de Sticlă Sărată",
  "A sealed note bears the mark of Saltglass Lighthouse. “The old way through The Coral Stair still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Farului de Sticlă Sărată. „Vechea cale prin Scara de Corali își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Strike while the iron is bright": "Lovește cât fierul e încă fierbinte",
  "A hammer-and-anvil island of soot-dark terraces climbs eight floors around rivers of molten copper to the Great Crucible.":
    "O insulă în formă de nicovală și ciocan, cu terase înnegrite de funingine, urcă opt etaje în jurul râurilor de cupru topit, spre Marele Creuzet.",
  "On a cooling anvil lies a half-forged blade. A note reads: “Finish what I could not.”":
    "Pe o nicovală care se răcește zace o lamă pe jumătate făurită. Un bilet spune: „Termină ce nu am putut eu.”",
  "Take up the hammer": "Ridică ciocanul",
  "Study the smith’s notes": "Studiază notițele fierarului",
  "A message from The Great Crucible": "Un mesaj de la Marele Creuzet",
  "A sealed note bears the mark of The Great Crucible. “The old way through Gearsmith Terrace still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Marelui Creuzet. „Vechea cale prin Terasa Fierarului își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  "Walk from cloud to cloud": "Mergi de la nor la nor",
  "An archipelago of drifting clouds tied together by floating rope bridges. Some clouds share a level, others rise high above or sink below — hop between them to reach the Sky Throne.":
    "Un arhipelag de nori la deriva, legați prin punți de frânghie plutitoare. Unii nori sunt la același nivel, alții se înalță sau coboară. Sari între ei ca să ajungi la Tronul Cerului.",
  "A cloud that will not hold still": "Un nor care nu vrea să stea pe loc",
  "The next cloud drifts away each time you reach for it. A tiny weather sprite giggles from a rope bridge above.":
    "Următorul nor se îndepărtează de fiecare dată când încerci să-l atingi. Un mic spiriduș al vremii chicotește de pe o punte de frânghie de deasupra.",
  "Jump before it drifts": "Sari înainte să plece",
  "Bargain with the weather sprite": "Negociază cu spiriduşul vremii",
  "A message from The Sky Throne": "Un mesaj de la Tronul Cerului",
  "A sealed note bears the mark of The Sky Throne. “The old way through Nimbus Heights still remembers those who travel with courage.” The seal begins to glow.":
    "Un bilet sigilat poartă semnul Tronului Cerului. „Vechea cale prin Înălțimea Norilor își amintește încă de cei care călătoresc cu curaj.” Sigiliul începe să strălucească.",
  // ---- World shape and size labels (world gallery) ----
  "Wildwood island": "Insula Pădurii Sălbatice",
  Standard: "Standard",
  "Dragonwing crags": "Stâncile Aripii de Dragon",
  Large: "Mare",
  "Hexagonal ice floe": "Placă de gheață hexagonală",
  "Diamond of the dunes": "Romb al dunelor",
  Expansive: "Vast",
  "Five-petal blossom": "Floare cu cinci petale",
  "Volcanic caldera": "Caldeira vulcanică",
  "Floating archipelago": "Arhipelag plutitor",
  Fragmented: "Fragmentat",
  "Three-lobed hollow": "Depresiune cu trei lobi",
  "Celestial crescent": "Semilună cerească",
  "Clockwork cog": "Roată a mecanismului de ceas",
  "Forked lightning ridge": "Creasta fulgerului bifurcat",
  Towering: "Înalt",
  "Falling maple leaf": "Frunză de arțar căzută",
  "Eight-petal lotus": "Lotus cu opt petale",
  Wide: "Larg",
  "Ancient stone cross": "Cruce de piatră veche",
  "Twin cloud banks": "Două maluri de nori",
  "Coral spiral": "Spirală de corali",
  "Golden honeycomb": "Fagure auriu",
  "The mountain anvil": "Nicovala muntelui",
  "Six-point crystal star": "Stea de cristal cu șase vârfuri",
  "Serpent’s spine": "Șira spinării șarpelui",
  Long: "Lung",
  "Heart of the garden": "Inima grădinii",
  "Twin lunar crescents": "Semilune lunare gemene",
  "Sands of the hourglass": "Nisipurile clepsidrei",
  "Manta-ray lagoon": "Lagună în formă de rază manta",
  "Eight-spoke wheel": "Roată cu opt spițe",
  "Triangular mountain": "Munte triunghiular",
  "Broken atoll": "Atol rupt",
  Lowland: "Șes",
  "Dreamer’s labyrinth": "Labirintul visătorului",
  "Four-lantern pavilion": "Pavilion cu patru lanterne",
  "Aurora ribbon": "Panglica aurorei",
  "Shattered glacier shards": "Cioburi de ghețar sfărâmat",
  "Twin mesa canyon": "Canion cu mese gemene",
  "Lily-pad marsh": "Mlaștină cu nuferi",
  "Ringed atoll": "Atol inelar",
  "Seahorse crescent": "Semilună de căluț de mare",
  "Hammer-and-anvil forge": "Forjă cu ciocan și nicovală",
  "Cloud archipelago": "Arhipelag de nori",
  "Sky-high": "Foarte înalt",
  // ---- Difficulty descriptions (Settings and lobby) ----
  "Creative board-game fun: drawing, stories, conversation and playful puzzles.":
    "Distracție creativă pentru jocul de societate: desen, povești, conversație și puzzle-uri jucăușe.",
  "Drinking dares, drinking buddies, table rules and challenges built to make everyone laugh.":
    "Provocări de băut, prieteni de pahar, reguli de masă și provocări făcute să-i facă pe toți să râdă.",
  "Flirt with each other: pickup lines, compliments, hand-holding, cheek kisses and fake dates.":
    "Flirtați între voi: replici de agățat, complimente, ținut de mână, pupici pe obraz și întâlniri false.",
  "Kisses, lap seats, close dances, seductive whispers and juicy truths.":
    "Sărutări, locuri pe genunchi, dansuri strânse, șoapte seducătoare și adevăruri savuroase.",
  "The boldest deck: make-outs, strip dares, body shots, lap dances and steamy truths.":
    "Cel mai îndrăzneț pachet: sărutări lungi, provocări cu dezbrăcatul, sărutări pe corp, dansuri pe genunchi și adevăruri fierbinți.",
  // ---- Settings labels and options (move speed, auras) ----
  "Relaxed · savour each step": "Relaxat · savurează fiecare pas",
  Normal: "Normal",
  "Brisk · quicker turns": "Alert · întoarceri mai rapide",
  "Swift · minimal animation": "Rapid · animație minimă",
  Gold: "Auriu",
  Sage: "Salvie",
  Ice: "Gheață",
  Rose: "Trandafiriu",
  Sunlit: "Însorit",
  Sapphire: "Safir",
  Orchid: "Orhidee",
  // ---- Graphics labels (Settings, lighting and quality) ----
  "Cinematic twilight": "Crepuscul cinematic",
  "Clear daylight": "Lumină de zi limpede",
  "Misty dawn": "Zori cețoși",
  "Golden sunset": "Apus auriu",
  "Gathering storm": "Furtună care se adună",
  "Moonlit night": "Noapte luminată de lună",
  "Aurora night": "Noapte cu aurora",
  "Living day & night cycle": "Ciclu zi și noapte viu",
  "Low · fastest": "Scăzută · cea mai rapidă",
  "Medium · balanced": "Medie · echilibrată",
  "High · sharp": "Ridicată · clară",
  "Ultra · cinematic": "Ultra · cinematică",
  "Collect 3 gold": "Strânge 3 monede de aur",
};
