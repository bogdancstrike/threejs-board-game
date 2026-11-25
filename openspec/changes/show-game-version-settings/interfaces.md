# Affected interfaces

- Screen: Settings panel (`configPage()` in `src/ui/config-page.ts`), opened via `showSettings()` in `src/main.ts` from the in-game header and the title screen.
- Source of data: `package.json` `version` field (read-only).
- Tests: a new unit test under `tests/` (vitest).
- No routes, CLI commands, or schemas change.
