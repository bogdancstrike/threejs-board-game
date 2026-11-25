# Show the game version in the settings panel

## Goal

Players cannot tell which version of the game they are running. The settings
panel (opened from the in-game header's "Game settings" button and from the
title screen's Settings action) will show the application version read from
`package.json`, formatted as `Version X.Y.Z` (for example `Version 1.0.0`).

## Non-goals

- No version display anywhere else (title screen, header, help, footer of the page).
- No build metadata (commit hash, build date, changelog link) and no update check.
- No change to the `version` field in `package.json`, to save-game versions, or to
  the `version_mismatch` network protocol field.
- No new settings, toggles, or storage keys.
- No change to the layout or behaviour of any other settings section.
