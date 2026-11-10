export interface SkyExcursion {
  start: number;
  upEnd: number;
  downStart: number;
  end: number;
  height: number;
  name: string;
}
export const SKY_ROUTES: Record<string, SkyExcursion[]> = {
  skyharbor: [
    {
      start: 27,
      upEnd: 36,
      downStart: 53,
      end: 63,
      height: 8,
      name: "Cloudwake Skyway",
    },
  ],
  stormreach: [
    {
      start: 24,
      upEnd: 34,
      downStart: 55,
      end: 67,
      height: 10,
      name: "The Storm Ladder",
    },
  ],
  astral: [
    {
      start: 28,
      upEnd: 37,
      downStart: 54,
      end: 65,
      height: 7.5,
      name: "The Starbridge",
    },
  ],
  dream: [
    {
      start: 17,
      upEnd: 26,
      downStart: 37,
      end: 46,
      height: 7,
      name: "The Cloud Dream",
    },
    {
      start: 49,
      upEnd: 59,
      downStart: 69,
      end: 80,
      height: 12,
      name: "The Star Loft",
    },
  ],
  lunar: [
    {
      start: 18,
      upEnd: 27,
      downStart: 36,
      end: 45,
      height: 7,
      name: "The First Moon",
    },
    {
      start: 50,
      upEnd: 60,
      downStart: 71,
      end: 82,
      height: 11,
      name: "The Second Moon",
    },
  ],
  aurora: [
    {
      start: 29,
      upEnd: 39,
      downStart: 58,
      end: 70,
      height: 9,
      name: "The Aurora Walk",
    },
  ],
  crystal: [
    {
      start: 22,
      upEnd: 31,
      downStart: 48,
      end: 58,
      height: 6.5,
      name: "The Crystal Sky",
    },
  ],
  snowspire: [
    {
      start: 35,
      upEnd: 46,
      downStart: 63,
      end: 76,
      height: 10,
      name: "The Summit Skywalk",
    },
  ],
};
export function skyOffset(map: string, tile: number) {
  for (const layer of SKY_ROUTES[map] || []) {
    if (tile <= layer.start || tile >= layer.end) continue;
    if (tile < layer.upEnd)
      return (
        (layer.height * (tile - layer.start)) / (layer.upEnd - layer.start)
      );
    if (tile > layer.downStart)
      return (
        (layer.height * (layer.end - tile)) / (layer.end - layer.downStart)
      );
    return layer.height;
  }
  return 0;
}
export function layerName(map: string, tile: number) {
  for (const layer of SKY_ROUTES[map] || [])
    if (tile > layer.start && tile < layer.end)
      return `${layer.name}${tile < layer.upEnd ? " · ascending" : tile > layer.downStart ? " · descending" : ""}`;
  return "Ground realm";
}
