import { MAPS } from "../game/maps";
import { MAP_SHAPES } from "../world/shapes";
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
    title: "Your next chapter",
    detail: "A new adventure is waiting.",
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
    this.root.setAttribute("aria-label", "Wilder main menu");
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
    this.root.innerHTML = `<div class="title-vignette"></div><div class="title-topline"><span>AN ADVENTURE IN ${MAPS.length} WORLDS</span><button data-menu-action="settings" class="title-icon" aria-label="Main menu settings">${i("settings-2")}</button></div><div class="title-content"><img class="title-emblem" src="/brand/wilder-mark.svg" alt="Wilder compass emblem"/><p class="title-eyebrow">A LITTLE COURAGE. A LITTLE MAGIC.</p><h1>Wilder<span>A PATH OF MYSTERIES</span></h1><p class="title-intro">Every path holds a story.<br>Yours begins here.</p><nav class="title-actions" aria-label="Start playing"><button class="title-new" data-menu-action="new"><span>${i("compass")}New game</span>${i("arrow-up-right")}</button><button class="title-continue" data-menu-action="continue" ${journey.available ? "" : "disabled"}>${i("footprints")}<span>Continue journey<small id="menu-continue-detail"></small></span>${i("chevron-right")}</button><div class="title-secondary"><button data-menu-action="settings">${i("settings-2")}Settings</button><button data-menu-action="help">${i("book-open")}How to play</button></div>${journey.online ? "" : `<button class="title-classic" data-menu-action="classic">Explore offline Classic ${i("chevron-right")}</button>`}</nav><p class="title-mode-note">SOLO · SAME-DEVICE PARTY · ONLINE MULTIPLAYER</p></div><div class="title-world"><div class="title-world-heading"><span>WHERE WILL YOU WANDER?</span><div><button data-menu-action="previous" aria-label="Previous featured world">${i("chevron-left")}</button><button data-menu-action="next" aria-label="Next featured world">${i("chevron-right")}</button></div></div><button class="title-world-card" data-menu-action="world"><img id="menu-world-image" alt=""/><span><small id="menu-world-shape"></small><strong id="menu-world-name"></strong><em>Explore this world ${i("arrow-up-right")}</em></span></button></div><footer class="title-footer"><span>12 ADVENTURERS <b>✧</b> 93 STEPS <b>✧</b> COUNTLESS STORIES</span><span id="menu-save-note"></span></footer>`;
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
        : "Begin a new story to create a save";
    const button = this.root.querySelector<HTMLButtonElement>(
      '[data-menu-action="continue"]',
    );
    if (button) button.disabled = !journey.available;
    const save = this.root.querySelector("#menu-save-note");
    if (save)
      save.textContent = journey.online
        ? "Your room stays live while you visit the menu."
        : "Your journey is saved automatically.";
  }
  private renderWorld() {
    const map = MAPS[this.selected],
      shape = MAP_SHAPES[map.id];
    const image =
      this.root.querySelector<HTMLImageElement>("#menu-world-image")!;
    image.src = `/previews/${map.id}.webp`;
    image.alt = `Preview of ${map.name}`;
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
