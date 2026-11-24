# Specification delta: English and Romanian localization

## Requirements

### Requirement: Supported languages and default language

The application MUST provide English (EN) and Romanian (RO) translations for player-visible interface and game text. English MUST be the default language for a player without a saved language choice. Proper names of worlds and characters MUST remain unchanged when the language changes.

#### Scenario: Default to English without a saved choice

- **GIVEN** the player has no saved language choice
- **WHEN** the application starts
- **THEN** player-visible interface and game text is displayed in English

### Requirement: Language selection and complete localization coverage

The application MUST provide a user-visible language selector in Settings with EN and RO choices. Selecting a language MUST update all player-visible text, including menus, settings, buttons, labels, prompts, dialogs, panels, status and system messages, and in-play descriptions and content such as worlds, regions, tiles, events, cards, choices, and adventures. Proper names of worlds and characters MUST remain unchanged. Switching languages MUST NOT alter the underlying game state or meaning of choices and rules.

#### Scenario: Select Romanian from English

- **GIVEN** the application is displayed in English
- **WHEN** the player selects RO in Settings
- **THEN** all player-visible interface and game text is displayed in Romanian
- **THEN** proper names of worlds and characters remain unchanged
- **THEN** the current game state and the meaning and available outcomes of choices remain unchanged

#### Scenario: Select English from Romanian

- **GIVEN** the application is displayed in Romanian
- **WHEN** the player selects EN in Settings
- **THEN** all player-visible interface and game text is displayed in English
- **THEN** proper names of worlds and characters remain unchanged

### Requirement: Remember the selected language

The application MUST remember the selected language for subsequent visits and use it on startup. A saved language choice MUST take precedence over the default English language.

#### Scenario: Restore selected language on a later visit

- **GIVEN** the player selected RO and the language choice was saved
- **WHEN** the player returns to or reloads the application
- **THEN** player-visible interface and game text is displayed in Romanian
- **THEN** the language selector indicates RO as selected
