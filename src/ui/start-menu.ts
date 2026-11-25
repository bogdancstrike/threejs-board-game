import { MAPS } from "../game/maps";
import { MAP_SHAPES } from "../world/shapes";
import { t } from "../i18n";
export interface MenuJourney {
  available: boolean;
  title: string;
  detail: string;
  online: boolean;
}
interface MenuActions {
  newGame: (map: string) => void;
  continue: () => void;
  classic: () => void;
  settings: () => void;
  help: () => void;
  world: (map: string) => void;
  toggle: (open: boolean) => void;
  /** The carousel world changed: show it behind the menu. */
  preview: (map: string) => void;
  icon: (name: string) => string;
  refreshIcons: () => void;
}
/** The title screen owns presentation; saved games remain in their existing stores. */
export class StartMenu {
  private root: HTMLElement;
  private selected = 0;
  private journey: MenuJourney = {
    available: false,
    title: t("menu.newJourneyDefault"),
    detail: t("menu.newJourneyDetail"),
    online: false,
  };
  constructor(
    parent: HTMLElement,
    private actions: MenuActions,
  ) {
    this.root = document.createElement("section");
    this.root.id = "start-menu";
    this.root.className = "start-menu";
    this.root.hidden = true;
    this.root.setAttribute("aria-label", t("menu.mainAria"));
    parent.append(this.root);
    this.root.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-menu-action]",
      );
      if (!button || button.disabled) return;
      const action = button.dataset.menuAction;
      if (action === "new") this.actions.newGame(MAPS[this.selected].id);
      else if (action === "continue") this.actions.continue();
      else if (action === "classic") this.actions.classic();
      else if (action === "settings") this.actions.settings();
      else if (action === "help") this.actions.help();
      else if (action === "world") this.actions.world(MAPS[this.selected].id);
      else if (action === "previous" || action === "next") {
        this.selected =
          (this.selected + (action === "next" ? 1 : MAPS.length - 1)) %
          MAPS.length;
        this.renderWorld();
        this.actions.preview(MAPS[this.selected].id);
      }
    });
  }
  get isOpen() {
    return !this.root.hidden;
  }
  show(journey: MenuJourney, map: string) {
    this.journey = journey;
    // Start on the world already behind the menu; browsing swaps the island.
    this.selected = Math.max(
      0,
      MAPS.findIndex((m) => m.id === map),
    );
    this.root.hidden = false;
    document.body.classList.add("on-title-screen");
    const i = this.actions.icon;
    this.root.innerHTML = `<div class="title-vignette"></div><div class="title-topline"><span>${t("menu.worldsCount", { count: MAPS.length })}</span><button data-menu-action="settings" class="title-icon" aria-label="${t("menu.settingsAria")}">${i("settings-2")}</button></div><div class="title-content"><img class="title-emblem" src="/brand/wilder-mark.svg" alt="${t("menu.emblemAlt")}"/><p class="title-eyebrow">${t("menu.eyebrow")}</p><h1>Wilder<span>${t("topbar.brandCaption")}</span></h1><p class="title-intro">${t("menu.intro")}<br>${t("menu.introLine2")}</p><nav class="title-actions" aria-label="${t("menu.startAria")}"><button class="title-new" data-menu-action="new"><span>${i("compass")}${t("menu.newGame")}</span>${i("arrow-up-right")}</button><button class="title-continue" data-menu-action="continue" ${journey.available ? "" : "disabled"}>${i("footprints")}<span>${t("menu.continue")}<small id="menu-continue-detail"></small></span>${i("chevron-right")}</button><div class="title-secondary"><button data-menu-action="settings">${i("settings-2")}${t("menu.settings")}</button><button data-menu-action="help">${i("book-open")}${t("menu.howToPlay")}</button></div>${journey.online ? "" : `<button class="title-classic" data-menu-action="classic">${t("menu.classic")} ${i("chevron-right")}</button>`}</nav><p class="title-mode-note">${t("menu.modeNote")}</p></div><div class="title-world"><div class="title-world-heading"><span>${t("menu.worldHeading").toUpperCase()}</span><div><button data-menu-action="previous" aria-label="${t("menu.previousWorld")}">${i("chevron-left")}</button><button data-menu-action="next" aria-label="${t("menu.nextWorld")}">${i("chevron-right")}</button></div></div><button class="title-world-card" data-menu-action="world"><img id="menu-world-image" alt=""/><span><small id="menu-world-shape"></small><strong id="menu-world-name"></strong><em>${t("menu.exploreWorld")} ${i("arrow-up-right")}</em></span></button></div><footer class="title-footer"><span>${t("menu.footer")}</span><span id="menu-save-note"></span></footer>`;
    this.updateJourney(journey);
    this.renderWorld();
    this.actions.toggle(true);
  }
  updateJourney(journey: MenuJourney) {
    this.journey = journey;
    if (!this.isOpen) return;
    const detail = this.root.querySelector("#menu-continue-detail");
    if (detail)
      detail.textContent = journey.available
        ? journey.title + " · " + journey.detail
        : t("menu.continueEmpty");
    const button = this.root.querySelector<HTMLButtonElement>(
      '[data-menu-action="continue"]',
    );
    if (button) button.disabled = !journey.available;
    const save = this.root.querySelector("#menu-save-note");
    if (save)
      save.textContent = journey.online
        ? t("menu.roomLive")
        : t("menu.savedAuto");
  }
  private renderWorld() {
    const map = MAPS[this.selected],
      shape = MAP_SHAPES[map.id];
    const image =
      this.root.querySelector<HTMLImageElement>("#menu-world-image")!;
    image.src = `/previews/${map.id}.webp`;
    image.alt = t("menu.worldPreviewAlt", { name: map.name });
    this.root.querySelector("#menu-world-name")!.textContent = map.name;
    this.root.querySelector("#menu-world-shape")!.textContent =
      `${String(this.selected + 1).padStart(2, "0")} / ${MAPS.length} · ${shape.name} · ${shape.floors} floors`;
    this.actions.refreshIcons();
  }
  hide() {
    this.root.hidden = true;
    document.body.classList.remove("on-title-screen");
    this.actions.toggle(false);
  }
}
