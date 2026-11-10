/** Shared road encounter catalogue, exported unchanged to the Python rules engine. */
export type RoadKind =
  | "dragon"
  | "box"
  | "minigame"
  | "dare"
  | "hazard"
  | "shrine"
  | "camp"
  | "curse";
export interface RoadStop {
  tile: number;
  kind: RoadKind;
  title: string;
  icon: string;
  description: string;
}
export const ROAD_STOPS: RoadStop[] = [
  {
    tile: 6,
    kind: "box",
    title: "The whispering mystery box",
    icon: "package-open",
    description:
      "Open a sealed box: treasure, a trick, or a mini-game. You may leave it sealed.",
  },
  {
    tile: 11,
    kind: "hazard",
    title: "The crumbling crossing",
    icon: "triangle-alert",
    description:
      "Time your crossing, spend a clue, or take a safe one-tile detour.",
  },
  {
    tile: 16,
    kind: "minigame",
    title: "The travelling arcade",
    icon: "puzzle",
    description:
      "A road spirit opens one of ten mini-games. Win points and gold.",
  },
  {
    tile: 23,
    kind: "dare",
    title: "The bard’s dare",
    icon: "drama",
    description:
      "Try a playful storytelling dare, take a rune challenge instead, or pass.",
  },
  {
    tile: 29,
    kind: "dragon",
    title: "The dragon’s guarded hoard",
    icon: "flame",
    description:
      "A dragon guards this tile. Face its trial, pay a toll, or retreat one tile.",
  },
  {
    tile: 33,
    kind: "shrine",
    title: "The warding shrine",
    icon: "shield-check",
    description:
      "Gain a ward that absorbs the next danger, or discover a clue.",
  },
  {
    tile: 38,
    kind: "box",
    title: "The moonlit lockbox",
    icon: "package-open",
    description:
      "A second sealed box hums beside the path. Its contents change every opening.",
  },
  {
    tile: 43,
    kind: "hazard",
    title: "The stormglass ravine",
    icon: "zap",
    description: "Keep your balance, use a clue, or choose a safe detour.",
  },
  {
    tile: 48,
    kind: "minigame",
    title: "The runekeeper’s games",
    icon: "puzzle",
    description: "Test your memory, timing, reasoning, or route finding.",
  },
  {
    tile: 53,
    kind: "curse",
    title: "The mischievous hex",
    icon: "sparkles",
    description:
      "Break the hex in a trial or accept a slower next roll in exchange for a clue.",
  },
  {
    tile: 59,
    kind: "dragon",
    title: "The skywarden’s challenge",
    icon: "flame",
    description:
      "A winged guardian watches this passage. Win its trial for a shortcut.",
  },
  {
    tile: 64,
    kind: "dare",
    title: "The lantern dare",
    icon: "drama",
    description:
      "Invent a tiny legend for your hero, choose a puzzle, or simply pass.",
  },
  {
    tile: 69,
    kind: "camp",
    title: "The wayfarer’s camp",
    icon: "tent",
    description: "Rest by the fire. Recover gold or remove a lingering hex.",
  },
  {
    tile: 74,
    kind: "minigame",
    title: "The final puzzle pavilion",
    icon: "puzzle",
    description: "One last invitation to earn points before the destination.",
  },
  {
    tile: 79,
    kind: "box",
    title: "The starfall coffer",
    icon: "package-open",
    description:
      "The last mystery box: golden luck, a mimic’s trick, or a skill trial.",
  },
  {
    tile: 85,
    kind: "dragon",
    title: "The elder at the gate",
    icon: "flame",
    description:
      "The elder guards the approach to the finish. A brave trial can carry you onward.",
  },
  {
    tile: 89,
    kind: "hazard",
    title: "The last falling stones",
    icon: "triangle-alert",
    description:
      "Watch your footing. A failed crossing sends you back, but a ward protects you.",
  },
];
export function roadStop(tile: number) {
  return ROAD_STOPS.find((stop) => stop.tile === tile);
}
