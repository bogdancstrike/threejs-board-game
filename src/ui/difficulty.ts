import { DIFFICULTIES, type Difficulty } from "../game/decks";
export function difficultySettings(
  selected: Difficulty = "soft",
  lobby = false,
  disabled = false,
) {
  return `<section class="difficulty-settings"><label class="settings-label">Card difficulty<select id="${lobby ? "lobby" : "room"}-difficulty" ${disabled ? "disabled" : ""}>${DIFFICULTIES.map((level) => `<option value="${level.id}" ${level.id === selected ? "selected" : ""}>${level.name} · ${level.count} cards</option>`).join("")}</select></label><div class="difficulty-description" id="difficulty-description"></div><p class="modal-note">Every card can be passed. Neutral alternatives earn the same reward. Drinking works with any beverage; touching requires everyone involved to agree. Adult party decks are for adults.</p></section>`;
}
export function describeDifficulty(value: string) {
  const level = DIFFICULTIES.find((d) => d.id === value) || DIFFICULTIES[0];
  const target = document.getElementById("difficulty-description");
  if (target) {
    target.dataset.level = level.id;
    target.innerHTML = `<strong>${level.name}<span>${level.count} cards${level.adult ? " · Adults" : ""}</span></strong><p>${level.description}</p>`;
  }
}
