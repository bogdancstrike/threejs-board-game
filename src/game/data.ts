import { skyOffset } from "./layers";
import { geography } from "./geography";
export type TileKind =
  | "path"
  | "mystery"
  | "treasure"
  | "fortune"
  | "portal"
  | "start"
  | "finish";
export const REGIONS = [
  {
    name: "Hearthwick Village",
    short: "The village",
    subtitle: "Every great tale begins with a small step.",
    color: "#b6c882",
  },
  {
    name: "Whispering Woods",
    short: "The woodland",
    subtitle: "Listen closely. The forest remembers.",
    color: "#7db39c",
  },
  {
    name: "The Arcane Highlands",
    short: "The highlands",
    subtitle: "Old magic waits beneath the stone.",
    color: "#b4a0d4",
  },
  {
    name: "Crownfall Castle",
    short: "The castle",
    subtitle: "One final climb. A thousand untold stories.",
    color: "#e6bc73",
  },
];
export const TILE_INFO: Record<
  TileKind,
  { label: string; icon: string; color: string; description: string }
> = {
  path: {
    label: "Quiet path",
    icon: "·",
    color: "#c4c5ac",
    description: "A moment to breathe. Your journey continues.",
  },
  mystery: {
    label: "Mystery",
    icon: "?",
    color: "#b4a0dc",
    description: "An unexpected encounter. Choose your own fate.",
  },
  treasure: {
    label: "Treasure",
    icon: "◇",
    color: "#edbf67",
    description: "A forgotten cache. Collect 3 gold.",
  },
  fortune: {
    label: "Fortune",
    icon: "✦",
    color: "#83cbb4",
    description: "A blessing of the wild. Gain 2 gold and a clue.",
  },
  portal: {
    label: "Portal",
    icon: "◎",
    color: "#82c9dd",
    description: "Ancient magic carries you 3 tiles forward.",
  },
  start: {
    label: "The beginning",
    icon: "⌂",
    color: "#c7d49a",
    description: "Welcome, wanderer. The island is waiting.",
  },
  finish: {
    label: "Crownfall Castle",
    icon: "♜",
    color: "#f2cb76",
    description: "The end of the path. The beginning of your legend.",
  },
};
export interface Character {
  id: string;
  name: string;
  title: string;
  age: number;
  color: string;
  hair: string;
  skin: string;
  role:
    | "mage"
    | "knight"
    | "rogue"
    | "priest"
    | "fox"
    | "assassin"
    | "valkyrie"
    | "frost"
    | "demon"
    | "paladin"
    | "swordsman"
    | "scholar";
  bio: string;
}
export const CHARACTERS: Character[] = [
  {
    id: "lyra",
    name: "Lyra",
    title: "The Violet Enchantress",
    age: 25,
    color: "#aa87d9",
    hair: "#382552",
    skin: "#e9bda5",
    role: "mage",
    bio: "A collector of forgotten spells, curious detours, and secrets best left whispered.",
  },
  {
    id: "seraphine",
    name: "Seraphine",
    title: "The Moonlight Knight",
    age: 27,
    color: "#a6c6e2",
    hair: "#e4e8ef",
    skin: "#edc6b4",
    role: "knight",
    bio: "Guided by moonlight and an unbreakable promise to protect the roads less traveled.",
  },
  {
    id: "rhea",
    name: "Rhea",
    title: "The Scarlet Rogue",
    age: 24,
    color: "#df816f",
    hair: "#a84b35",
    skin: "#ddb096",
    role: "rogue",
    bio: "Quick with a dagger, quicker with a smile. No locked chest has kept her waiting.",
  },
  {
    id: "elowen",
    name: "Elowen",
    title: "The Elven Priestess",
    age: 26,
    color: "#8fbe9b",
    hair: "#e5d9aa",
    skin: "#e8c7ad",
    role: "priest",
    bio: "The woodland speaks in a thousand voices. She is the one who listens.",
  },
  {
    id: "akari",
    name: "Akari",
    title: "The Kitsune Sorceress",
    age: 24,
    color: "#e99e7d",
    hair: "#292530",
    skin: "#ebc3ab",
    role: "fox",
    bio: "Follow her foxfire if you dare. Her tricks always lead somewhere interesting.",
  },
  {
    id: "nyx",
    name: "Nyx",
    title: "The Shadow Assassin",
    age: 28,
    color: "#9589b7",
    hair: "#242132",
    skin: "#cda58d",
    role: "assassin",
    bio: "An unseen guardian of ancient roads, with a past as quiet as her footsteps.",
  },
  {
    id: "aurelia",
    name: "Aurelia",
    title: "The Golden Valkyrie",
    age: 29,
    color: "#e3c173",
    hair: "#dbb66a",
    skin: "#ecc6ac",
    role: "valkyrie",
    bio: "Where hope is fading, a flash of gold announces that the fight is far from over.",
  },
  {
    id: "selene",
    name: "Selene",
    title: "The Frost Witch",
    age: 25,
    color: "#96cfdd",
    hair: "#c3e4ef",
    skin: "#e6c7bb",
    role: "frost",
    bio: "A calm heart, a winter spell, and an unexpected fondness for warm village tea.",
  },
  {
    id: "vesper",
    name: "Vesper",
    title: "The Crimson Demoness",
    age: 27,
    color: "#c46c87",
    hair: "#642b40",
    skin: "#d5a692",
    role: "demon",
    bio: "Behind the horns and crimson flames is a traveler determined to write her own fate.",
  },
  {
    id: "alaric",
    name: "Alaric",
    title: "The Royal Paladin",
    age: 29,
    color: "#81a8d3",
    hair: "#d8b56e",
    skin: "#dbb294",
    role: "paladin",
    bio: "A royal oath brought him to the island. An adventurous heart will take him further.",
  },
  {
    id: "kael",
    name: "Kael",
    title: "The Shadow Swordsman",
    age: 27,
    color: "#b197ca",
    hair: "#242433",
    skin: "#d6b49f",
    role: "swordsman",
    bio: "His blade has a name. His destination is a secret. His loyalty is beyond question.",
  },
  {
    id: "orion",
    name: "Orion",
    title: "The Arcane Scholar",
    age: 30,
    color: "#8badd8",
    hair: "#bdc8dc",
    skin: "#dfbda6",
    role: "scholar",
    bio: "He came to study the island’s mysteries. The island has other plans.",
  },
];
export function seededRandom(seed = 4759) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function groundHeight(z: number, map = "verdant") {
  const profile = geography(map);
  let height = 0.8;
  for (let i = 1; i < profile.floors; i++) {
    const edge = 11 - i * (25 / profile.floors),
      blend = Math.min(1.3, 4.8 / profile.floors),
      t = Math.max(0, Math.min(1, (edge + blend - z) / (blend * 2)));
    height += t * t * (3 - 2 * t) * profile.rise;
  }
  return height;
}

export interface Tile {
  id: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
  region: number;
  kind: TileKind;
}
const positions: { x: number; z: number }[] = [];
for (let row = 0; row < 7; row++) {
  const dir = row % 2 === 0 ? 1 : -1;
  for (let col = 0; col < 12; col++)
    positions.push({ x: dir * (-10.45 + col * 1.9), z: 10 - row * 3.5 });
  if (row < 6) positions.push({ x: dir * 11.25, z: 10 - row * 3.5 - 1.75 });
}
positions.push(
  { x: 9.2, z: -12.5 },
  { x: 7.5, z: -13.2 },
  { x: 5.6, z: -13.2 },
);
export const TILES: Tile[] = positions.map((p, id) => ({
  ...p,
  id,
  y: groundHeight(p.z) + 0.04,
  rotation: 0,
  region: Math.min(3, Math.floor(id / 24)),
  kind:
    id === 0
      ? "start"
      : id === 92
        ? "finish"
        : id % 17 === 0
          ? "portal"
          : id % 9 === 0
            ? "fortune"
            : id % 7 === 0
              ? "treasure"
              : id % 4 === 0
                ? "mystery"
                : "path",
}));
export interface Choice {
  label: string;
  detail: string;
  gold: number;
  clues: number;
  move: number;
}
export interface Mystery {
  title: string;
  text: string;
  icon: string;
  choices: Choice[];
}
export const MYSTERIES: Mystery[] = [
  {
    title: "The lantern keeper",
    icon: "flame",
    text: "An old keeper offers you a lantern. “It reveals what the moon cannot,” she says. A hidden path glimmers between the trees.",
    choices: [
      {
        label: "Take the hidden path",
        detail: "Move forward 2 tiles",
        gold: 0,
        clues: 0,
        move: 2,
      },
      {
        label: "Ask about the island",
        detail: "Discover 2 clues",
        gold: 0,
        clues: 2,
        move: 0,
      },
    ],
  },
  {
    title: "A riddle in the roots",
    icon: "sprout",
    text: "“I have cities but no houses, forests but no trees, and rivers but no water. What am I?” The ancient oak waits for your answer.",
    choices: [
      {
        label: "A map",
        detail: "Answer the riddle · gain 3 gold and a clue",
        gold: 3,
        clues: 1,
        move: 0,
      },
      {
        label: "A dream",
        detail: "The oak smiles · take a quiet step back",
        gold: 0,
        clues: 0,
        move: -1,
      },
    ],
  },
  {
    title: "The wandering merchant",
    icon: "gem",
    text: "A merchant’s cart shimmers with impossible things. Among them: a tiny compass that points to whatever your heart is looking for.",
    choices: [
      {
        label: "Trade for the compass",
        detail: "Spend 2 gold · move forward 3 tiles",
        gold: -2,
        clues: 0,
        move: 3,
      },
      {
        label: "Share stories instead",
        detail: "Discover a clue",
        gold: 0,
        clues: 1,
        move: 0,
      },
    ],
  },
  {
    title: "Whispers in the well",
    icon: "waves",
    text: "A voice rises from the stone well, repeating a name forgotten centuries ago. Something golden glints far below.",
    choices: [
      {
        label: "Investigate the voice",
        detail: "Discover 2 clues",
        gold: 0,
        clues: 2,
        move: 0,
      },
      {
        label: "Lower your lucky rope",
        detail: "Collect 4 gold · move back 1 tile",
        gold: 4,
        clues: 0,
        move: -1,
      },
    ],
  },
  {
    title: "The sleeping guardian",
    icon: "moon",
    text: "A great stone fox sleeps across the path. Beside it, a narrow ledge winds around a glowing pool. Its ears twitch as you approach.",
    choices: [
      {
        label: "Sing an old lullaby",
        detail: "The guardian dreams · move forward 2",
        gold: 0,
        clues: 1,
        move: 2,
      },
      {
        label: "Explore the glowing pool",
        detail: "Collect 3 gold",
        gold: 3,
        clues: 0,
        move: 0,
      },
    ],
  },
  {
    title: "A letter from tomorrow",
    icon: "scroll-text",
    text: "A paper bird lands in your palm. The handwriting looks strangely familiar. “When you find the arch, trust the light,” it reads.",
    choices: [
      {
        label: "Follow the paper bird",
        detail: "Move forward 3 tiles",
        gold: 0,
        clues: 0,
        move: 3,
      },
      {
        label: "Keep the letter safe",
        detail: "Discover 2 clues and 1 gold",
        gold: 1,
        clues: 2,
        move: 0,
      },
    ],
  },
];

const tileCache = new Map<string, Tile[]>();
export function getTiles(map = "verdant"): Tile[] {
  if (map === "verdant") return TILES;
  if (tileCache.has(map)) return tileCache.get(map)!;
  let seed = 0;
  for (const c of map) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const phase = (seed % 100) / 15,
    amplitude = 0.45 + (seed % 5) * 0.12;
  const tiles = TILES.map((t) => {
    const x = t.x * 0.96 + Math.sin(t.z * 0.25 + phase) * 0.32,
      z = t.z + Math.sin(t.x * 0.22 + phase) * amplitude;
    return {
      ...t,
      x,
      z,
      y: groundHeight(z, map) + 0.04 + skyOffset(map, t.id),
      rotation: Math.sin(t.id * 2.4 + phase) * 0.07,
    };
  });
  tileCache.set(map, tiles);
  return tiles;
}
