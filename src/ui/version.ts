import packageJson from "../../package.json";

/** The game version from the root package.json. */
export const GAME_VERSION: string = packageJson.version;

/** Text shown in the settings panel, e.g. "Version 1.0.0". */
export function versionLabel(version: string): string {
  return `Version ${version}`;
}
