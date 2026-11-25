# settings-version delta

## ADDED Requirements

### Requirement: The settings panel shows the game version
The settings panel SHALL display the application version taken from the `version`
field of `package.json`, as the text `Version <version>`. The text SHALL be shown
once, in a footer area at the end of the settings panel, and SHALL NOT be
editable or interactive.

#### Scenario: Version shown in the settings panel
- **GIVEN** `package.json` has `"version": "1.0.0"`
- **WHEN** the player opens the game settings panel from the in-game header
- **THEN** the panel contains the text `Version 1.0.0`
- **AND** the text is visible without scrolling past the last settings section

#### Scenario: Version shown from the title screen
- **GIVEN** the player is on the title screen
- **WHEN** the player opens Settings from the title screen
- **THEN** the settings panel contains the text `Version 1.0.0`

#### Scenario: Version text is produced by a unit-testable function
- **GIVEN** a package version string of `"0.4.2"`
- **WHEN** the version label is built for display
- **THEN** the result is exactly `Version 0.4.2`

#### Scenario: Other settings are unchanged
- **GIVEN** the player has changed one or more settings
- **WHEN** the player opens the settings panel and sees the version text
- **THEN** all existing settings controls keep their current values, labels and sections
- **AND** no settings are saved or reset as a result of showing the version
