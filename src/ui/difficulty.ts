import { DIFFICULTIES, type Difficulty } from "../game/decks";
import { t } from "../i18n";
export function difficultySettings(
  selected: Difficulty = "soft",
  lobby = false,
  disabled = false,
) {
  return `<section class="difficulty-settings"><label class="settings-label">${t("difficulty.label")}<select id="${lobby ? "lobby" : "room"}-difficulty" ${disabled ? "disabled" : ""}>${DIFFICULTIES.map((level) => `<option value="${level.id}" ${level.id === selected ? "selected" : ""}>${t(`difficulty.${level.id}`)} · ${t("difficulty.cards", { count: level.count })}</option>`).join("")}</select></label><div class="difficulty-description" id="difficulty-description"></div><p class="modal-note">${t("difficulty.note")}</p></section>`;
}
export function describeDifficulty(value: string) {
  const level = DIFFICULTIES.find((d) => d.id === value) || DIFFICULTIES[0];
  const target = document.getElementById("difficulty-description");
  if (target) {
    target.dataset.level = level.id;
    target.innerHTML = `<strong>${t(`difficulty.${level.id}`)}<span>${t("difficulty.cards", { count: level.count })}${level.adult ? ` · ${t("difficulty.adults")}` : ""}</span></strong><p>${level.description}</p>`;
  }
}
