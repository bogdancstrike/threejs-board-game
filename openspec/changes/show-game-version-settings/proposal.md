# Show the game version in the settings panel

## Goal
Players cannot see which version of the game they are running. Show the
version from `package.json` (the `version` field) in the settings panel so it
can be read and reported.

Example text: `Version 0.4.2`. The value shown is whatever `package.json`
currently declares (today `1.0.0`); the example number is not a requirement.

## Non-goals
- No change to the version number itself, release tooling, or build scripts.
- No version display on the title screen, HUD, or help pages.
- No "update available" check, changelog link, or build hash/commit id.
- No change to any other settings section, preference, or stored data.
- No new dependency; the version is read from `package.json` at build time.

## Assumptions
- "Settings panel" means the configuration page opened by `showSettings()`
  (`src/main.ts`), rendered by `configPage()` in `src/ui/config-page.ts`.
- The line is placed once, as a small footer note at the end of the settings
  body, below the existing sections, and is not a navigable section (it is not
  added to `CONFIG_SECTIONS`).
