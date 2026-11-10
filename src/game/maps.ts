import { EXTRA_MAPS } from "./extra-maps";
import type { Mystery } from "./data";
export interface MapTheme {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  terrain: string[];
  rock: string;
  water: string;
  sky: string;
  roof: string;
  foliage: string;
  accent: string;
  theme:
    | "forest"
    | "dragon"
    | "ice"
    | "desert"
    | "sakura"
    | "volcano"
    | "ocean"
    | "mushroom"
    | "astral"
    | "clockwork";
  regions: string[];
  encounters: Mystery[];
}
const encounter = (
  title: string,
  text: string,
  a: string,
  b: string,
): Mystery => ({
  title,
  text,
  icon: "sparkles",
  choices: [
    {
      label: a,
      detail: "Take a chance · move forward 2 tiles",
      gold: 0,
      clues: 1,
      move: 2,
    },
    {
      label: b,
      detail: "Explore carefully · gain 3 gold and a clue",
      gold: 3,
      clues: 1,
      move: 0,
    },
  ],
});
export const MAPS: MapTheme[] = [
  {
    id: "verdant",
    name: "The Verdant Crown",
    tagline: "Where the wild remembers",
    description:
      "Lantern-lit villages, whispering woods, and a forgotten castle above the clouds.",
    icon: "trees",
    terrain: ["#698566", "#578269", "#6c8d79", "#899878"],
    rock: "#526067",
    water: "#5bb7bc",
    sky: "#192d37",
    roof: "#b96e50",
    foliage: "#386f59",
    accent: "#b7c78f",
    theme: "forest",
    regions: [
      "Hearthwick Village",
      "Whispering Woods",
      "Arcane Highlands",
      "Crownfall Castle",
    ],
    encounters: [],
  },
  {
    id: "dragonkind",
    name: "Dragonkind",
    tagline: "Brave the parapet. Earn your wings.",
    description:
      "A Fourth Wing inspired dragon-rider academy. Cross storm-swept parapets, face the gauntlet, and bond with your dragon.",
    icon: "flame",
    terrain: ["#666c61", "#5c6762", "#77757a", "#8d8782"],
    rock: "#41454f",
    water: "#7e9dad",
    sky: "#1b2335",
    roof: "#763e48",
    foliage: "#3d5351",
    accent: "#dcac76",
    theme: "dragon",
    regions: [
      "Rider’s Vale",
      "The Parapet",
      "The Gauntlet",
      "Dragonspire Academy",
    ],
    encounters: [
      encounter(
        "The crossing",
        "The parapet is slick with rain. Far below, clouds swirl between the mountain spires. A bronze dragon circles the academy.",
        "Trust your balance",
        "Read the wind",
      ),
      encounter(
        "The choosing",
        "An immense shadow falls across the clearing. A dragon watches you with molten-gold eyes. This bond must be earned.",
        "Stand your ground",
        "Offer your trust",
      ),
      encounter(
        "A signet awakens",
        "Lightning dances across your fingertips. Your dragon’s voice echoes in your mind: “Power follows courage.”",
        "Channel the storm",
        "Study your signet",
      ),
    ],
  },
  {
    id: "frost",
    name: "The Frostbound Passage",
    tagline: "A secret beneath the snow",
    description:
      "Silver pines, frozen rivers, luminous ice spires, and the palace of the long winter.",
    icon: "snowflake",
    terrain: ["#b8cfca", "#9ebbbf", "#b6cad4", "#ccd7d8"],
    rock: "#748998",
    water: "#8ad6e0",
    sky: "#263b50",
    roof: "#56889a",
    foliage: "#739f9b",
    accent: "#a9dce4",
    theme: "ice",
    regions: [
      "Snowbell Hamlet",
      "Silverpine Forest",
      "The Frozen Reach",
      "Winterglass Palace",
    ],
    encounters: [
      encounter(
        "The ice remembers",
        "Beneath the frozen lake, an ancient city glows. A melody rises through the ice.",
        "Follow the melody",
        "Study the ancient lights",
      ),
      encounter(
        "The white fox",
        "A silver fox leaves no tracks in the snow. It turns, waiting for you to follow.",
        "Follow its footsteps",
        "Offer a little kindness",
      ),
    ],
  },
  {
    id: "desert",
    name: "Sands of the Oracle",
    tagline: "Every grain holds a story",
    description:
      "Golden dunes, turquoise oases, weathered ruins, and a sun temple lost to time.",
    icon: "sun",
    terrain: ["#c9ac78", "#bfa070", "#ceb988", "#dbc79b"],
    rock: "#9c795b",
    water: "#59b8aa",
    sky: "#3d3540",
    roof: "#9c6848",
    foliage: "#789578",
    accent: "#e1ba6b",
    theme: "desert",
    regions: [
      "Saffron Bazaar",
      "The Amber Dunes",
      "Oracle’s Oasis",
      "Temple of the Sun",
    ],
    encounters: [
      encounter(
        "The sand oracle",
        "A face takes shape in the shifting dunes. “What you seek is already walking toward you.”",
        "Ask about your future",
        "Search the buried ruins",
      ),
      encounter(
        "An impossible oasis",
        "Palm trees shimmer on the horizon. The water reflects a sky full of unfamiliar stars.",
        "Drink from the spring",
        "Read the constellations",
      ),
    ],
  },
  {
    id: "sakura",
    name: "Moonblossom Reach",
    tagline: "Follow the falling petals",
    description:
      "Blossom groves, vermilion gates, jade terraces, and a moonlit mountain sanctuary.",
    icon: "flower-2",
    terrain: ["#82967a", "#718e7e", "#8aa291", "#a0ac92"],
    rock: "#686d76",
    water: "#86c6c6",
    sky: "#322c43",
    roof: "#af5a62",
    foliage: "#dba5b9",
    accent: "#e4b4c5",
    theme: "sakura",
    regions: [
      "Petalbridge Village",
      "The Blushing Grove",
      "Jade Terraces",
      "Sanctuary of the Moon",
    ],
    encounters: [
      encounter(
        "The paper crane",
        "A paper crane unfolds itself on your shoulder. Inside is a poem written by the moon.",
        "Follow the crane",
        "Finish the poem",
      ),
      encounter(
        "Tea with a spirit",
        "Under a thousand falling petals, a fox spirit pours a second cup of tea.",
        "Accept the invitation",
        "Ask the spirit’s name",
      ),
    ],
  },
  {
    id: "ember",
    name: "Emberfall Caldera",
    tagline: "A journey forged in fire",
    description:
      "Obsidian cliffs, rivers of molten gold, ember trees, and a fortress above the caldera.",
    icon: "mountain",
    terrain: ["#635852", "#605451", "#74605b", "#86706a"],
    rock: "#37333c",
    water: "#f28b46",
    sky: "#301f2b",
    roof: "#985746",
    foliage: "#a95e44",
    accent: "#edac6f",
    theme: "volcano",
    regions: [
      "Ashen Outpost",
      "Cinderwood",
      "The Molten Steps",
      "Emberfall Keep",
    ],
    encounters: [
      encounter(
        "The ember smith",
        "A hammer rings out over the lava. “Every blade has a story,” the smith says. “What is yours?”",
        "Help at the forge",
        "Trade a story",
      ),
      encounter(
        "Heart of the mountain",
        "A crystal beats like a heart within the obsidian. Warmth flows through the stone.",
        "Touch the crystal",
        "Listen to the mountain",
      ),
    ],
  },
  {
    id: "tide",
    name: "The Tideglass Isles",
    tagline: "Beyond the last horizon",
    description:
      "Coral shores, palm groves, turquoise cascades, and a lighthouse at the edge of the sky.",
    icon: "waves",
    terrain: ["#a6b18b", "#7eaa94", "#91b7a7", "#b4c7ad"],
    rock: "#658b91",
    water: "#58c4cc",
    sky: "#153a49",
    roof: "#508d9c",
    foliage: "#549e85",
    accent: "#8bd7d5",
    theme: "ocean",
    regions: [
      "Coralhaven Port",
      "The Palmway",
      "Pearlwater Cliffs",
      "The Last Lighthouse",
    ],
    encounters: [
      encounter(
        "A message in glass",
        "The tide delivers a bottle from a ship that disappeared a hundred years ago. The ink is still wet.",
        "Find the missing ship",
        "Decode the message",
      ),
      encounter(
        "The pearl keeper",
        "A tiny crab presents you with a pearl. The entire ocean seems to glow inside it.",
        "Follow the crab",
        "Examine the pearl",
      ),
    ],
  },
  {
    id: "mycelium",
    name: "The Mycelium Hollow",
    tagline: "A world beneath the world",
    description:
      "Giant luminous mushrooms, spore-lit pools, hidden grottoes, and an ancient fungal citadel.",
    icon: "sprout",
    terrain: ["#686781", "#625e7c", "#79708c", "#8d819c"],
    rock: "#49445d",
    water: "#8eace0",
    sky: "#251d39",
    roof: "#a276b1",
    foliage: "#b28acb",
    accent: "#c3a1dc",
    theme: "mushroom",
    regions: [
      "Sporelight Village",
      "The Violet Canopy",
      "Luminescent Grotto",
      "The Mycelial Throne",
    ],
    encounters: [
      encounter(
        "The mushroom choir",
        "A circle of luminous mushrooms hums a chord you recognize from a dream. A tiny door opens in the largest stem.",
        "Step inside",
        "Join the song",
      ),
      encounter(
        "A thousand tiny stars",
        "A cloud of spores forms a map in the darkness. There is a glowing mark where you stand.",
        "Follow the spore map",
        "Collect a glowing sample",
      ),
    ],
  },
  {
    id: "astral",
    name: "The Astral Observatory",
    tagline: "Walk between the stars",
    description:
      "Violet stardust, orbiting crystals, celestial ruins, and an observatory above the night.",
    icon: "orbit",
    terrain: ["#69677f", "#625d79", "#7c7493", "#8f87a5"],
    rock: "#45425e",
    water: "#a09ddd",
    sky: "#161d35",
    roof: "#786594",
    foliage: "#8882b9",
    accent: "#c7b6ee",
    theme: "astral",
    regions: [
      "Starfall Landing",
      "Nebula Gardens",
      "The Lunar Stair",
      "Observatory of Ages",
    ],
    encounters: [
      encounter(
        "The wandering star",
        "A tiny star has fallen into your pocket. It is homesick, and it knows a shortcut through the night.",
        "Help it return home",
        "Ask about the cosmos",
      ),
      encounter(
        "Tomorrow’s constellation",
        "Through a cracked telescope, the stars spell out your name. One begins to move.",
        "Follow the moving star",
        "Chart the constellation",
      ),
    ],
  },
  {
    id: "clockwork",
    name: "The Clockwork Citadel",
    tagline: "An adventure out of time",
    description:
      "Copper forests, turquoise canals, turning gears, and the great clock at the end of time.",
    icon: "settings-2",
    terrain: ["#8b8b73", "#788a7e", "#959681", "#aaa18a"],
    rock: "#676564",
    water: "#74bcb0",
    sky: "#233338",
    roof: "#b8845a",
    foliage: "#ad9264",
    accent: "#d3b681",
    theme: "clockwork",
    regions: [
      "Tinkerton",
      "The Copper Gardens",
      "Pendulum Heights",
      "The Clockwork Citadel",
    ],
    encounters: [
      encounter(
        "The clockmaker’s apprentice",
        "A brass bird winds itself up and offers a key. Somewhere, a clock begins ticking backward.",
        "Turn the key",
        "Find the clockmaker",
      ),
      encounter(
        "A minute to spare",
        "The world stands perfectly still. A little automaton offers you a minute it has been saving for years.",
        "Borrow a minute",
        "Repair the automaton",
      ),
    ],
  },
];
MAPS.push(...EXTRA_MAPS);
export function getMap(id: string) {
  return MAPS.find((m) => m.id === id) || MAPS[0];
}
