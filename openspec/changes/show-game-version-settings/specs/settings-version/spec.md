# settings-version

## ADDED Requirements

### Requirement: Settings panel shows the game version
The settings panel SHALL display the `version` field of `package.json` as the
text `Version <version>`, once, after the existing settings sections.

**Interfaces affected:** settings screen (`configPage` in `src/ui/config-page.ts`,
opened by `showSettings` in `src/main.ts`). No routes, CLI commands or schemas change.

#### Scenario: Version line shows the package version
- **GIVEN** `package.json` declares version `0.4.2`
- **WHEN** the player opens the settings panel
- **THEN** the panel contains the text `Version 0.4.2`
- **AND** the text appears after the last settings section (Accessibility)

#### Scenario: Version text is produced by a unit test
- **GIVEN** the unit test suite under `tests/`
- **WHEN** the version text is generated for the settings panel
- **THEN** the output equals `Version <package.json version>`
- **AND** the test passes with `npm test`

#### Scenario: Other settings are unchanged
- **GIVEN** the settings panel is open with any stored preferences
- **WHEN** the version line is present
- **THEN** every existing section, control and preference behaves as before
- **AND** no preference value is written or altered by showing the version
