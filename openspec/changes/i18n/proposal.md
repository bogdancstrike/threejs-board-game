# Proposal: English and Romanian localization

## Goal

Add support for English (EN) and Romanian (RO) in Wilder, including a user-visible way to select Romanian from English and render the application in the selected language. The accepted work item requires Romanian UI text after selecting RO.

## Non-goals

- Adding languages other than EN and RO.
- Translating server/API payloads or changing game rules and persisted game data.
- Deciding whether authored game content (world, character, card, and adventure names/descriptions) is included in “all UI texts”; this scope requires the accountable person's answer before the localization requirements can be finalized.

## Decision required

The repository currently presents English text across the main menu, game board, settings, dialogs, online panels, and authored game content. The work item does not clarify whether “all UI texts” includes the authored content surfaced in those screens. The spec delta intentionally does not assert either interpretation until this is answered.
