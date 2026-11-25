import { getLanguage } from "./index";
import { contentRo } from "./content-ro";

// In-play game content (worlds, regions, tiles, encounters, road stops,
// characters, log lines). The English source text stays in the game data and
// is the lookup key, so rules and saved state never depend on the language.
// Romanian text is looked up at render time. Proper names of worlds and
// characters are not translated and stay exactly as written.
// Dictionary sections in content-ro.ts are grouped by screen/area.

/** Returns the Romanian text for English game content, or the source text. */
export function tc(source: string): string {
  if (getLanguage() !== "ro") return source;
  return contentRo[source] ?? source;
}
