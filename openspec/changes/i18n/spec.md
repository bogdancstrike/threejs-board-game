# Specification delta: English and Romanian localization

## Requirements

This delta is pending a scope decision on whether “all UI texts” includes authored game content. The accepted requirement is captured below without assuming that boundary.

### Requirement: Romanian locale selection

The application MUST support EN and RO locales and provide a user-visible way for a user running in English to select Romanian.

#### Scenario: Select Romanian from English

- **GIVEN** the application is displayed in English
- **WHEN** the user selects RO
- **THEN** all UI texts in scope for the agreed localization boundary are displayed in Romanian

### Requirement: English locale availability

The application MUST continue to support English as a selectable locale.

#### Scenario: Select English

- **GIVEN** the application is displayed in Romanian
- **WHEN** the user selects EN
- **THEN** all UI texts in scope for the agreed localization boundary are displayed in English

## Open scope decision

Does “all UI texts” mean interface/control text only, or all player-visible text including authored game content such as world and character names/descriptions, tiles, events, cards, and adventures? Finalization of the translation coverage requirements depends on the accountable person's answer.
