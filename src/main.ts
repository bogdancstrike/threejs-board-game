import { configPage, formatSetting } from "./ui/config-page";
import {
  readGraphics,
  saveGraphics,
  GRAPHICS_DEFAULTS,
  type GraphicsOptions,
  type LightingStyle,
} from "./world/graphics";
import {
  readPreferences,
  savePreferences,
  readProfile,
  saveProfile,
  PREFERENCE_DEFAULTS,
  MOVE_SPEEDS,
  type Preferences,
  type Profile,
} from "./settings/preferences";
import "./style.css";
import { StartMenu, type MenuJourney } from "./ui/start-menu";
import { RealtimeClient, type RoomUpdate } from "./network/client";
import { ChallengePanel } from "./network/challenge-panel";
import { RoomPanels } from "./network/panels";
import { GameAudio, type SoundEffect } from "./audio/audio";
import {
  createIcons,
  Compass,
  Map as MapIcon,
  Dices,
  Gem,
  Sparkles,
  Flag,
  Trees,
  Flame,
  Snowflake,
  Sun,
  Flower2,
  Mountain,
  Waves,
  Sprout,
  Orbit,
  Settings2,
  Volume2,
  VolumeX,
  CircleHelp,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  Plus,
  Minus,
  Scan,
  Crosshair,
  BookOpen,
  ArrowUpRight,
  Check,
  Users,
  Crown,
  MoveUpRight,
  Footprints,
  Moon,
  WandSparkles,
  Eye,
  ChevronDown,
  ScrollText,
  Wind,
  Shield,
  Swords,
  Feather,
  Circle,
  CheckCheck,
  UserRound,
  Monitor,
  Palette,
  Move3d,
  Accessibility,
  Gauge,
  Shuffle,
  SlidersHorizontal,
  Play,
  Filter,
  Star,
  Hand,
  Music,
  Lightbulb,
  Heart,
  PartyPopper,
} from "lucide";
import { roadStop } from "./game/road";
import { CHARACTERS, getTiles, TILE_INFO } from "./game/data";
import { SKY_ROUTES, layerName } from "./game/layers";
import { MAP_SHAPES } from "./world/shapes";
import { MAPS, getMap } from "./game/maps";
import {
  playerScore,
  newGame,
  roll,
  choose,
  currentMystery,
  saveGame,
  parseSave,
  type GameState,
} from "./game/engine";
import { GameScene, CharacterPreview, type Quality } from "./world/scene";
import { MODEL_PATHS } from "./world/assets";
import type { Action } from "./world/animation";
const icons = {
  Compass,
  Map: MapIcon,
  Dices,
  Gem,
  Sparkles,
  Flag,
  Trees,
  Flame,
  Snowflake,
  Sun,
  Flower2,
  Mountain,
  Waves,
  Sprout,
  Orbit,
  Settings2,
  Volume2,
  VolumeX,
  CircleHelp,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  Plus,
  Minus,
  Scan,
  Crosshair,
  BookOpen,
  ArrowUpRight,
  Check,
  Users,
  Crown,
  MoveUpRight,
  Footprints,
  Moon,
  WandSparkles,
  Eye,
  ChevronDown,
  ScrollText,
  Wind,
  Shield,
  Swords,
  Feather,
  Circle,
  CheckCheck,
  UserRound,
  Monitor,
  Palette,
  Move3d,
  Accessibility,
  Gauge,
  Shuffle,
  SlidersHorizontal,
  Play,
  Filter,
  Star,
  Hand,
  Music,
  Lightbulb,
  Heart,
  PartyPopper,
};
const icon = (name: string, cls = "") =>
  `<i data-lucide="${name}" class="${cls}"></i>`;
const refreshIcons = () =>
  createIcons({ icons, attrs: { "stroke-width": 1.6 } });
const app = document.querySelector<HTMLDivElement>("#app")!;
let state: GameState;
let hasLocalJourney = false;
let titleMenu: StartMenu | null = null;
let restorePromise: Promise<void> = Promise.resolve();
let launchFromMenu = false,
  previousMenuRoom = "";
try {
  const saved = parseSave(localStorage.getItem("wilder-expedition-v1"));
  hasLocalJourney = Boolean(saved);
  state = saved || newGame();
} catch {
  state = newGame();
}
let theme = getMap(state.map),
  busy = false,
  muted = true,
  runMovement = false,
  preview: CharacterPreview | null = null,
  selected = 0,
  previewTint: string | undefined;
let scene: GameScene;
let mapPreview: GameScene | null = null;
let modalType = "";
let prefs: Preferences = readPreferences();
let profile: Profile = readProfile();
let graphicsQuality: Quality = prefs.quality;
runMovement = prefs.run;
function saveDisplayPreferences() {
  prefs.quality = graphicsQuality;
  prefs.run = runMovement;
  savePreferences(prefs);
}
/** Apply camera, pacing and interface preferences to the board and document. */
function applyPreferences() {
  document.documentElement.style.setProperty(
    "--ui-scale",
    String(prefs.uiScale),
  );
  document.body.classList.toggle("reduce-motion", prefs.reduceMotion);
  document.body.classList.toggle("hide-legend", !prefs.legend);
  if (scene) configureBoard(scene);
}
function configureBoard(target: GameScene) {
  target.configureCamera(prefs);
  target.stepDuration = { ...MOVE_SPEEDS[prefs.moveSpeed] };
  target.onFps = (fps, ratio) => {
    const meter = document.getElementById("fps-meter");
    if (!meter) return;
    meter.hidden = !target.graphics.showFps;
    meter.textContent = `${fps} FPS · ${ratio.toFixed(2)}×`;
    meter.dataset.slow = String(fps < 40);
  };
  const meter = document.getElementById("fps-meter");
  if (meter) meter.hidden = !target.graphics.showFps;
}
function boardScene(world = theme) {
  const created = new GameScene($("viewport"), world, graphicsQuality);
  configureBoard(created);
  return created;
}
const gameAudio = new GameAudio(theme);
muted = !gameAudio.preferences.enabled;
const safe = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
app.innerHTML = `
<header class="topbar"><a class="brand" href="#" aria-label="Wilder main menu"><span class="brand-mark"><img src="/brand/wilder-mark.svg" alt=""/></span><span>Wilder<span class="brand-caption">A PATH OF MYSTERIES</span></span></a><div class="header-center"><span class="tiny-star">✧</span> A little courage. A little magic. <span class="tiny-star">✧</span></div><nav><button class="nav-link exit-game-button" data-action="exit-game" aria-label="Exit game to main menu">${icon("chevron-left")}<span>Exit game</span></button><button class="icon-button" data-action="main-menu" aria-label="Open main menu">${icon("compass")}</button><button class="nav-link online-nav" data-action="rooms">${icon("users")}<span id="room-nav-label">Play · Solo & party</span></button><button class="nav-link" data-action="journey" aria-label="Toggle journey details">${icon("book-open")}<span>Journey</span></button><button class="nav-link" data-action="characters" aria-label="Choose character">${icon("users")}<span>Adventurer</span></button><button class="nav-link" data-action="maps">${icon("map")}<span>Worlds</span><span class="count-badge">${MAPS.length}</span></button><button class="nav-link" data-action="help">${icon("circle-help")}<span>How to play</span></button><span class="nav-divider"></span><button class="icon-button sound-button" data-action="sound" aria-label="Enable sound">${icon("volume-x")}</button><button class="icon-button" data-action="settings" aria-label="Game settings">${icon("settings-2")}</button></nav></header>
<main class="game-shell"><aside class="sidebar"><div class="expedition-intro"><div class="eyebrow">AN ADVENTURE AWAITS</div><h1 id="map-title"></h1><p class="intro-copy">Follow the path.<br>Find your own story.</p><button class="map-link" data-action="maps">${icon("map")}<span>Explore another world</span>${icon("arrow-up-right")}</button></div>
<div class="sidebar-rule"></div><div class="section-label">YOUR ADVENTURER<button data-action="characters">Change ${icon("chevron-right")}</button></div><button class="hero-card" data-action="characters"><div id="hero-avatar" class="hero-avatar">${icon("wand-sparkles")}</div><div><strong id="hero-name"></strong><span id="hero-class"></span></div><span class="hero-online"></span></button>
<div class="journey"><div class="section-label"><span>THE JOURNEY</span><span class="tile-counter"><b id="tile-current">01</b> / 93</span></div><div class="progress-track"><div id="progress-fill"></div></div><div id="region-list" class="region-list"></div></div>
<div class="inventory"><div>${icon("gem")}<strong id="gold">0</strong><span>Gold found</span></div><div>${icon("sparkles")}<strong id="clues">0</strong><span>Clues collected</span></div><div>${icon("crown")}<strong id="points">0</strong><span>Points</span></div></div>
<div class="journal-section"><div class="section-label">TRAVELER’S JOURNAL<button data-action="journal">View all ${icon("arrow-up-right")}</button></div><div id="journal"></div></div><div class="sidebar-footer"><span class="save-dot"></span> Your journey is saved automatically</div></aside>
<section class="world-area" aria-label="Game board"><div class="sky-stars"></div><div class="world-grain"></div><div id="viewport"></div><div id="party-panel" class="party-overlay" hidden></div><div class="world-heading"><span class="eyebrow" id="chapter">CHAPTER I</span><h2 id="region-name">Hearthwick Village</h2><p id="region-subtitle">Every great tale begins with a small step.</p></div><div class="world-meta"><span class="live-dot"></span><span id="player-count">SOLO EXPEDITION</span><span class="meta-divider"></span><span id="turn-label">TURN 01</span></div><div class="world-label castle-label" id="destination-label">${icon("flag")}<span>CROWNFALL CASTLE</span></div><div id="tile-tooltip" class="tile-tooltip" hidden></div><div class="compass-rose"><span>N</span><div>✧</div></div><div class="camera-controls"><button data-action="focus" aria-label="Focus active character" title="Focus character (F)">${icon("crosshair")}</button><span></span><button data-action="zoom-in" aria-label="Zoom in">${icon("plus")}</button><button data-action="zoom-out" aria-label="Zoom out">${icon("minus")}</button><span></span><button data-action="reset-camera" aria-label="Reset camera" title="Reset camera (R)">${icon("scan")}</button></div><div class="camera-hint">${icon("orbit")} Drag to explore <span>·</span> Scroll to zoom</div>
<div class="turn-panel"><div class="turn-icon">${icon("sparkles")}</div><div class="turn-copy"><span class="eyebrow" id="turn-eyebrow">YOUR STORY STARTS HERE</span><h3 id="turn-title">The first step is yours.</h3><p id="turn-description">Roll the dice. See where the path takes you.</p></div><div class="dice-separator"></div><div id="dice" class="dice-face" aria-label="Dice"><span class="dice-pip"></span></div><button id="roll-button" class="primary-button" data-action="roll">${icon("dices")}<span>Roll the dice</span><kbd>SPACE</kbd></button></div>
<div id="fps-meter" class="fps-meter" hidden></div><div class="board-legend"><span><i style="--dot:#b4a0dc"></i>Mystery</span><span><i style="--dot:#edbf67"></i>Treasure</span><span><i style="--dot:#83cbb4"></i>Fortune</span><span><i style="--dot:#82c9dd"></i>Portal</span></div><div class="scene-loading" id="scene-loading"><span class="loading-orbit"></span>Unfolding your world…</div></section></main>
<dialog id="modal" class="modal"><div id="modal-content"></div></dialog><div id="toast" class="toast" role="status"></div>`;
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const dialog = $<HTMLDialogElement>("modal");
let toastTimer: ReturnType<typeof setTimeout>;
let roomQueue = Promise.resolve(),
  visualRoomId = "",
  shownNetworkEncounter = "",
  visualRoomPhase = "";
let challengePanel: ChallengePanel | null = null;
let hotseatSelection = -1;
const realtime = new RealtimeClient(
  (message) => {
    roomQueue = roomQueue
      .then(() => receiveRoom(message))
      .catch((error) => {
        busy = false;
        toast(
          error instanceof Error ? error.message : "Could not update the room.",
        );
        update();
      });
  },
  () => {
    if (scene) {
      update();
      if (modalType === "lobby") roomPanels.lobby();
    }
  },
  (message) => toast(message),
);
function ownPlayerIndex() {
  if (realtime.room?.hotseat && hotseatSelection >= 0) return hotseatSelection;
  return realtime.session
    ? Math.max(
        0,
        state.players.findIndex((p) => p.id === realtime.session!.playerId),
      )
    : state.active;
}

function toast(text: string) {
  $("toast").textContent = text;
  $("toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("visible"), 3500);
}
function persist() {
  if (!realtime.session) {
    hasLocalJourney = true;
    saveGame(state);
  }
}
function update() {
  const player = state.players[state.active],
    c = CHARACTERS.find((c) => c.id === player.character)!,
    tile = getTiles(state.map)[player.position];
  $("map-title").innerHTML = theme.name.replace(/ (\S+)$/, "<br>$1");
  $("hero-name").textContent = c.name;
  $("hero-class").textContent = c.title.replace(/^The /, "");
  $("hero-avatar").style.setProperty("--hero-color", c.color);
  $("hero-avatar").innerHTML = icon(
    ["knight", "paladin", "valkyrie"].includes(c.role)
      ? "shield"
      : ["rogue", "assassin", "swordsman"].includes(c.role)
        ? "swords"
        : "wand-sparkles",
  );
  $("tile-current").textContent = String(player.position + 1).padStart(2, "0");
  $("progress-fill").style.width = `${(player.position / 92) * 100}%`;
  $("gold").textContent = String(player.gold);
  $("clues").textContent = String(player.clues);
  $("points").textContent = String(playerScore(player));
  $("region-list").innerHTML = theme.regions
    .map(
      (r, i) =>
        `<div class="region-step ${i === tile.region ? "current" : i < tile.region ? "completed" : ""}"><span class="region-dot">${i < tile.region ? "✓" : i === tile.region ? "✧" : ""}</span><span>${r}</span>${i === tile.region ? '<span class="here-tag">YOU ARE HERE</span>' : ""}</div>`,
    )
    .join("");
  $("chapter").textContent =
    `CHAPTER ${["I", "II", "III", "IV"][tile.region]} · ${theme.tagline.toUpperCase()}`;
  $("region-name").textContent = theme.regions[tile.region];
  $("region-subtitle").textContent =
    [
      "Every great tale begins with a small step.",
      "There’s more to this place than meets the eye.",
      "Old magic waits beneath the stone.",
      "One final climb. A thousand untold stories.",
    ][tile.region] +
    (SKY_ROUTES[theme.id]?.length
      ? ` · ${layerName(theme.id, player.position)}`
      : "");
  $("destination-label").innerHTML =
    icon("flag") + `<span>${theme.regions[3].toUpperCase()}</span>`;
  $("player-count").textContent =
    state.players.length === 1
      ? "SOLO EXPEDITION"
      : `${state.players.length} TRAVELERS · ${player.name.toUpperCase()}`;
  $("turn-label").textContent = `TURN ${String(state.turn).padStart(2, "0")}`;
  $("journal").innerHTML = state.journal
    .slice(0, 3)
    .map(
      (j, i) =>
        `<div class="journal-entry ${i === 0 ? "latest" : ""}"><span class="journal-dot"></span><p>${safe(j.text)}</p><small>${String(j.turn).padStart(2, "0")}</small></div>`,
    )
    .join("");
  const button = $<HTMLButtonElement>("roll-button");
  button.disabled =
    busy ||
    state.phase !== "ready" ||
    Boolean(
      realtime.session && (!realtime.myTurn || realtime.status !== "online"),
    );
  button.innerHTML =
    icon(busy ? "footprints" : state.phase === "won" ? "crown" : "dices") +
    `<span>${busy ? "On the path…" : state.phase === "event" ? "A mystery awaits" : state.phase === "won" ? "Journey complete" : "Roll the dice"}</span>${!busy && state.phase === "ready" ? "<kbd>SPACE</kbd>" : ""}`;
  $("turn-eyebrow").textContent =
    state.phase === "won"
      ? "A LEGEND IS WRITTEN"
      : busy
        ? "ONE STEP CLOSER"
        : state.players.length > 1
          ? `${player.name.toUpperCase()} · ${c.name.toUpperCase()}`
          : state.turn === 1
            ? "YOUR STORY STARTS HERE"
            : "YOUR NEXT CHAPTER";
  $("turn-title").textContent =
    state.phase === "won"
      ? "You made it, wanderer."
      : busy
        ? `${c.name} is exploring…`
        : state.turn === 1
          ? "The first step is yours."
          : `${c.name}, the path is calling.`;
  $("turn-description").textContent =
    state.phase === "won"
      ? "The destination is only half the story."
      : busy
        ? "A little courage goes a long way."
        : "Roll the dice. See where the path takes you.";
  if (realtime.session) {
    $("room-nav-label").textContent = "Room " + (realtime.room?.code || "");
    if (realtime.room?.phase === "lobby") {
      button.innerHTML = icon("users") + "<span>Gather your party</span>";
      $("turn-title").textContent = "Your party is getting ready.";
      $("turn-description").textContent =
        "Choose a unique hero, mark ready, and let the host begin.";
    } else if (!realtime.myTurn && state.phase !== "won") {
      button.innerHTML =
        icon("moon") + "<span>Waiting for " + safe(player.name) + "</span>";
      $("turn-title").textContent = player.name + "’s turn";
      $("turn-description").textContent =
        realtime.status === "online"
          ? "The whole party sees every roll and discovery."
          : "Reconnecting to your expedition…";
    } else if (realtime.myTurn && !busy && state.phase === "ready") {
      $("turn-title").textContent = "Your turn, " + player.name + ".";
      $("turn-description").textContent =
        "The server rolls the die. You choose the adventure.";
    }
  } else $("room-nav-label").textContent = "Play · Solo & party";
  renderParty();
  if (scene) {
    scene.active = state.active;
    if (!busy) scene.positionPlayers(state.players);
  }
  refreshIcons();
}
function showDice(n: number) {
  const pipSets: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  $("dice").innerHTML = Array.from(
    { length: 9 },
    (_, i) =>
      `<span class="${pipSets[n].includes(i) ? "dice-pip" : ""}"></span>`,
  ).join("");
  $("dice").setAttribute("aria-label", `Rolled ${n}`);
}
function sound(type: SoundEffect) {
  gameAudio.play(type);
}
function syncSoundButton() {
  const el = document.querySelector<HTMLButtonElement>(".sound-button")!;
  el.innerHTML = icon(muted ? "volume-x" : "volume-2");
  el.setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
  refreshIcons();
}
window.addEventListener(
  "pointerdown",
  () => {
    void gameAudio.unlock();
  },
  { once: true },
);
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
function randomInt(max: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  const limit = Math.floor(0x100000000 / max) * max;
  if (a[0] >= limit) return randomInt(max);
  return a[0] % max;
}
async function doRoll() {
  if (busy || state.phase !== "ready" || dialog.open) return;
  if (realtime.session) {
    if (!realtime.myTurn) return;
    busy = true;
    update();
    try {
      sound("roll");
      await realtime.command("ROLL_DIE");
    } catch (error) {
      busy = false;
      toast(error instanceof Error ? error.message : "Could not roll.");
      update();
    }
    return;
  }
  busy = true;
  update();
  $("dice").classList.add("rolling");
  sound("roll");
  for (let i = 0; i < 9; i++) {
    showDice(randomInt(6) + 1);
    await delay(65 + i * 5);
  }
  const n = randomInt(6) + 1;
  showDice(n);
  $("dice").classList.remove("rolling");
  const player = state.active;
  const route = roll(state, n, randomInt(1000));
  await scene.move(player, route, runMovement);
  if ((state.phase as string) === "won") {
    scene.react(player, "celebrate");
    scene.impact(player, "victory");
  } else if (
    (state.phase as string) === "event" ||
    state.journal[0]?.text.includes("gold")
  )
    scene.react(player, "magic");
  if ((state.phase as string) === "event") scene.impact(player, "mystery");
  else if (state.journal[0]?.text.includes("portal"))
    scene.impact(player, "portal");
  else if (state.journal[0]?.text.includes("gold"))
    scene.impact(player, "treasure");
  if (
    (state.phase as string) !== "ready" ||
    state.journal[0]?.text.includes("gold")
  )
    await delay(450);
  busy = false;
  persist();
  update();
  if ((state.phase as string) === "event") showEncounter();
  else if ((state.phase as string) === "won") showVictory();
  else if (
    state.journal[0].text.includes("gold") ||
    state.journal[0].text.includes("portal")
  ) {
    sound(state.journal[0].text.includes("portal") ? "portal" : "treasure");
    toast(state.journal[0].text);
  }
}
function closeModal() {
  if (
    modalType === "encounter" ||
    modalType === "victory" ||
    modalType === "challenge" ||
    modalType === "road"
  )
    return;
  challengePanel?.stop();
  preview?.dispose();
  preview = null;
  mapPreview?.dispose();
  mapPreview = null;
  profilePreview?.dispose();
  profilePreview = null;
  dialog.close();
  modalType = "";
}
function openModal(type: string, html: string, wide = false) {
  challengePanel?.stop();
  preview?.dispose();
  preview = null;
  mapPreview?.dispose();
  mapPreview = null;
  profilePreview?.dispose();
  profilePreview = null;
  modalType = type;
  if (scene) scene.paused = type !== "settings";
  dialog.className = `modal ${wide ? "modal-wide" : ""} modal-${type}`;
  $("modal-content").innerHTML =
    html +
    (titleMenu?.isOpen ||
    ["encounter", "challenge", "road", "victory", "handoff"].includes(type)
      ? ""
      : `<div class="modal-exit"><button class="text-button" data-action="exit-game">${icon("chevron-left")} Exit game · save & return to menu</button></div>`);
  if (!dialog.open) dialog.showModal();
  refreshIcons();
}
const modalHeader = (eyebrow: string, title: string, close = true) =>
  `<div class="modal-header"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div>${close ? `<button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon("x")}</button>` : ""}</div>`;
const roomPanels = new RoomPanels(
  realtime,
  {
    icon,
    escape: safe,
    open: openModal,
    header: modalHeader,
    toast,
    characters: showCharacters,
    leave: leaveOnline,
    map: () => state.map,
  },
  app,
);
challengePanel = new ChallengePanel(
  realtime,
  {
    icon,
    escape: safe,
    open: openModal,
    header: modalHeader,
    toast,
    sound: () => sound("step"),
  },
  app,
);
function menuJourney(): MenuJourney {
  const room = realtime.room;
  return {
    available: Boolean(room || realtime.session || hasLocalJourney),
    title: room ? getMap(room.game.map).name : theme.name,
    detail: room
      ? `${room.game.players.length} ${room.hotseat ? "on this device" : "online"} · turn ${room.game.turn}`
      : `Tile ${state.players[state.active].position + 1} · ${state.players.length} ${state.players.length === 1 ? "adventurer" : "adventurers"}`,
    online: Boolean(realtime.session),
  };
}
function showMainMenu() {
  if (busy) {
    toast("Your hero is moving. Open the menu after this step.");
    return;
  }
  persist();
  challengePanel?.stop();
  preview?.dispose();
  preview = null;
  mapPreview?.dispose();
  mapPreview = null;
  dialog.close();
  modalType = "";
  launchFromMenu = false;
  titleMenu?.show(menuJourney(), state.map);
}
function exitToMenu() {
  if (busy) {
    toast("Your hero is moving. Exit after this step.");
    return;
  }
  showMainMenu();
  if (realtime.session) realtime.disconnect(false);
  toast("Progress saved. You can continue from the main menu.");
}
async function continueJourney() {
  await restorePromise;
  if (realtime.session && !realtime.connected) await realtime.restore();
  launchFromMenu = false;
  titleMenu?.hide();
  shownNetworkEncounter = "";
  if (realtime.room) {
    await realtime.refresh();
    await roomQueue;
  } else if (state.phase === "event") showEncounter();
  else if (state.phase === "won") showVictory();
  update();
}
function beginMenuGame(map: string) {
  if (realtime.room) {
    openModal(
      "new-game-menu",
      modalHeader("ANOTHER STORY AWAITS", "Begin a new expedition?") +
        `<p class="modal-intro">Your current room will continue for its party. Creating a new game moves this browser to the new expedition.</p><div class="modal-actions"><button class="secondary-button" data-action="close-modal">Keep this journey</button><button class="primary-button" data-action="new-game-setup" data-world="${map}">Choose new game</button></div>`,
    );
  } else openGameSetup(map);
}
function openGameSetup(map: string) {
  previousMenuRoom = realtime.room?.id || "";
  launchFromMenu = true;
  roomPanels.open({ newGame: true, map });
}
titleMenu = new StartMenu(app, {
  newGame: beginMenuGame,
  continue: () => void continueJourney(),
  classic: () => {
    titleMenu?.hide();
    persist();
    if (state.phase === "event") showEncounter();
    else if (state.phase === "won") showVictory();
  },
  settings: showSettings,
  help: showHelp,
  world: confirmMap,
  icon,
  refreshIcons,
  toggle: (open) => {
    if (scene) {
      scene.controls.autoRotate =
        open &&
        prefs.menuOrbit &&
        !prefs.reduceMotion &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches;
      scene.controls.autoRotateSpeed = 0.15;
      scene.controls.enabled = !open;
      scene.paused = dialog.open;
    }
  },
});

function showCharacters(index?: number) {
  if (busy) return;
  hotseatSelection = realtime.room?.hotseat
    ? index !== undefined && index >= 0
      ? index
      : state.active
    : -1;
  selected = CHARACTERS.findIndex(
    (c) => c.id === state.players[ownPlayerIndex()].character,
  );
  previewTint = undefined;
  openModal(
    "characters",
    modalHeader("MEET YOUR NEXT ADVENTURER", "Every hero has a story.") +
      `<div class="character-layout"><div class="character-preview-panel"><div id="character-preview"></div><div class="preview-view"><button data-view="full" class="active">Full body</button><button data-view="upper">Upper body</button><button data-view="face">Close-up</button><button data-view="equipment">Equipment</button></div><div class="preview-caption">${icon("orbit")} Drag to rotate · Scroll to zoom</div><div id="asset-label" class="asset-label"></div></div><div class="character-detail"><div class="character-index"><span id="char-number"></span><div><button data-action="prev-character" class="icon-button" aria-label="Previous character">${icon("chevron-left")}</button><button data-action="next-character" class="icon-button" aria-label="Next character">${icon("chevron-right")}</button></div></div><h3 id="char-name"></h3><p id="char-title" class="char-title"></p><p id="char-bio"></p><div class="section-label">SEE THEM IN MOTION</div><div class="action-options">${[
        ["idle", "moon", "Idle"],
        ["walk", "footprints", "Walk"],
        ["run", "wind", "Run"],
        ["rest", "feather", "Relax"],
        ["magic", "wand-sparkles", "Magic"],
        ["wave", "hand", "Wave"],
        ["dance", "music", "Dance"],
        ["think", "lightbulb", "Think"],
        ["bow", "heart", "Bow"],
        ["celebrate", "party-popper", "Cheer"],
      ]
        .map(
          ([a, i, n]) =>
            `<button data-animation="${a}" class="${a === "idle" ? "active" : ""}">${icon(i)}${n}</button>`,
        )
        .join(
          "",
        )}</div><div class="section-label">PAWN AURA <span>Cosmetic only</span></div><div class="color-options">${["#cbb17a", "#a88bcf", "#8fc5b3", "#8dbed2", "#da998d"].map((c, i) => `<button aria-label="${["Gold", "Violet", "Sage", "Ice", "Rose"][i]} aura" data-tint="${c}" style="--swatch:${c}" class="${i === 0 ? "active" : ""}"></button>`).join("")}</div><p class="fair-play">${icon("check")} Every character shares the same game rules.</p><button class="primary-button" id="select-character" data-action="select-character">${icon("check")}<span>Select adventurer</span></button></div></div><div class="character-roster">${CHARACTERS.map((c, i) => `<button data-character="${i}" class="roster-card" style="--hero-color:${c.color}"><span class="roster-medallion">${icon(["knight", "paladin", "valkyrie"].includes(c.role) ? "shield" : ["rogue", "assassin", "swordsman"].includes(c.role) ? "swords" : "wand-sparkles")}</span><strong>${c.name}</strong><small>${MODEL_PATHS[c.id] ? "3D model" : "Prototype"}</small></button>`).join("")}</div>`,
    true,
  );
  preview = new CharacterPreview($("character-preview"));
  updateCharacter();
}
function updateCharacter() {
  const c = CHARACTERS[selected];
  $("char-number").textContent =
    `${String(selected + 1).padStart(2, "0")} / ${CHARACTERS.length} ADVENTURERS`;
  $("char-name").textContent = c.name;
  $("char-title").textContent = `${c.title} · Age ${c.age}`;
  $("char-bio").textContent = c.bio;
  $("asset-label").textContent = MODEL_PATHS[c.id]
    ? "Adapted character art · supplied GLB"
    : "Stylized prototype · production art pending";
  document
    .querySelectorAll<HTMLElement>("[data-character]")
    .forEach((el) =>
      el.classList.toggle(
        "selected",
        Number(el.dataset.character) === selected,
      ),
    );
  const taken = state.players.some(
    (p, i) => i !== ownPlayerIndex() && p.character === c.id,
  );
  const b = $<HTMLButtonElement>("select-character");
  const locked = Boolean(realtime.session && realtime.room?.phase !== "lobby");
  b.disabled = taken || locked;
  b.innerHTML =
    icon(taken ? "users" : "check") +
    `<span>${taken ? "Claimed by another player" : locked ? "Heroes are locked during the expedition" : `Select ${c.name}`}</span>`;
  document.querySelectorAll<HTMLElement>("[data-character]").forEach((card) => {
    const hero = CHARACTERS[Number(card.dataset.character)],
      owner = state.players.find(
        (p, i) => i !== ownPlayerIndex() && p.character === hero.id,
      );
    card.classList.toggle("is-taken", Boolean(owner));
    const label = card.querySelector("small");
    if (label)
      label.textContent = owner
        ? "Claimed · " + owner.name
        : MODEL_PATHS[hero.id]
          ? "3D model"
          : "Prototype";
  });
  void preview?.show(c, previewTint || state.players[ownPlayerIndex()].tint);
  refreshIcons();
}
function showMaps() {
  if (busy) return;
  openModal(
    "maps",
    modalHeader(
      `${MAPS.length} WORLDS. COUNTLESS STORIES.`,
      "Where will you wander?",
    ) +
      `<p class="modal-intro">${MAPS.length} silhouettes. Three to nine floors. Find a new kind of adventure.</p><div class="world-gallery-toolbar"><label>${icon("compass")}<input id="world-search" type="search" placeholder="Find a world, shape, or theme…" aria-label="Search worlds"/></label><label class="world-sort">${icon("sliders-horizontal")}<select id="world-sort" aria-label="Sort worlds"><option value="catalogue">Catalogue order</option><option value="floors-asc">Fewest floors first</option><option value="floors-desc">Tallest first</option><option value="name">A to Z</option></select></label><button class="secondary-button" data-action="random-world">${icon("shuffle")}Surprise me</button><span id="world-result-count">${MAPS.length} worlds</span></div><div class="world-filters" role="group" aria-label="Filter worlds by family">${["all", ...new Set(MAPS.map((m) => m.theme))].map((f) => `<button data-world-filter="${f}" class="${f === "all" ? "active" : ""}">${f === "all" ? "All worlds" : f[0].toUpperCase() + f.slice(1)}</button>`).join("")}</div><div class="maps-grid">${MAPS.map((m, i) => `<button class="map-card ${m.id === theme.id ? "selected" : ""}" data-map="${m.id}" data-family="${m.theme}" data-floors="${MAP_SHAPES[m.id].floors}" data-index="${i}" data-name="${m.name}" style="--map-sky:${m.sky};--map-ground:${m.terrain[2]};--map-accent:${m.accent}"><div class="map-art"><img class="map-thumbnail" src="/previews/${m.id}.webp" alt="3D preview of ${m.name}" loading="lazy" onerror="this.style.display='none'"/><div class="map-art-moon"></div><div class="map-art-mountain back"></div><div class="map-art-mountain"></div><div class="map-art-island"></div><span class="map-art-icon">${icon(m.icon)}</span><span class="map-number">${String(i + 1).padStart(2, "0")}</span>${m.id === theme.id ? '<span class="map-current">CURRENT WORLD</span>' : ""}</div><div class="map-card-copy"><h3>${m.name}</h3><p>${MAP_SHAPES[m.id].name} · ${MAP_SHAPES[m.id].floors} floors</p><span>${m.id === "dragonkind" ? "Dragon rider academy" : "93 tiles · 4 chapters"} ${icon("arrow-up-right")}</span></div></button>`).join("")}</div><p class="modal-note">Choosing another world starts a fresh expedition. Your current journey is saved until you confirm.</p>`,
    true,
  );
}
let worldFamily = "all";
function filterWorlds() {
  const q = ($<HTMLInputElement>("world-search")?.value || "")
    .toLowerCase()
    .trim();
  let shown = 0;
  document.querySelectorAll<HTMLElement>(".map-card").forEach((card) => {
    card.hidden =
      !card.textContent?.toLowerCase().includes(q) ||
      (worldFamily !== "all" && card.dataset.family !== worldFamily);
    if (!card.hidden) shown++;
  });
  $("world-result-count").textContent =
    shown + (shown === 1 ? " world" : " worlds");
}
function sortWorlds(order: string) {
  const grid = document.querySelector(".maps-grid");
  if (!grid) return;
  const cards = [...grid.querySelectorAll<HTMLElement>(".map-card")];
  const key = (c: HTMLElement) => Number(c.dataset.floors);
  cards.sort((a, b) =>
    order === "floors-asc"
      ? key(a) - key(b)
      : order === "floors-desc"
        ? key(b) - key(a)
        : order === "name"
          ? a.dataset.name!.localeCompare(b.dataset.name!)
          : Number(a.dataset.index) - Number(b.dataset.index),
  );
  grid.append(...cards);
}
function confirmMap(id: string) {
  const m = getMap(id),
    index = MAPS.indexOf(m),
    current = m.id === theme.id,
    fromMenu = titleMenu?.isOpen;
  openModal(
    "new-world",
    modalHeader("EXPLORE YOUR NEXT WORLD", m.name) +
      `
  <div class="map-preview-layout"><div class="map-preview-stage"><div id="map-preview-canvas"></div><span class="map-preview-badge">${icon(m.icon)} LIVE 3D PREVIEW</span><div id="map-preview-loading" class="map-preview-loading"><span class="loading-orbit"></span>Bringing this world to life…</div><div class="map-preview-tools"><button data-action="preview-map-reset" aria-label="Reset preview">${icon("scan")}</button><button data-action="preview-map-in" aria-label="Zoom preview in">${icon("plus")}</button><button data-action="preview-map-out" aria-label="Zoom preview out">${icon("minus")}</button></div><div class="map-preview-hint">${icon("orbit")} Drag to rotate · Scroll to explore</div></div><div class="map-preview-copy"><div class="character-index"><span>WORLD ${String(index + 1).padStart(2, "0")} / ${MAPS.length}</span><div><button class="icon-button" data-preview-map="${MAPS[(index + MAPS.length - 1) % MAPS.length].id}" aria-label="Previous map">${icon("chevron-left")}</button><button class="icon-button" data-preview-map="${MAPS[(index + 1) % MAPS.length].id}" aria-label="Next map">${icon("chevron-right")}</button></div></div><h3>${m.tagline}</h3><p class="modal-intro">${m.description}</p><div class="map-preview-chapters">${m.regions.map((region, i) => `<div><span>${String(i + 1).padStart(2, "0")}</span>${region}</div>`).join("")}</div><div class="map-preview-stats"><span>${icon("footprints")} 93 tiles</span><span>${icon("map")} ${MAP_SHAPES[m.id].name}</span><span>${icon("mountain")} ${MAP_SHAPES[m.id].floors} terraces · ${MAP_SHAPES[m.id].size}</span><span>${icon("wind")} ${SKY_ROUTES[m.id]?.length ? `Ground + ${SKY_ROUTES[m.id].length} sky route${SKY_ROUTES[m.id].length > 1 ? "s" : ""}` : "Ground realm"}</span><span>${icon("sparkles")} Unique mysteries</span></div><p class="modal-note">${current ? "You are exploring this world. Your journey is waiting." : "Start at tile 1 with your current party. This replaces the saved expedition."}</p><button class="primary-button full-width" ${fromMenu ? `data-action="new-game-setup" data-world="${m.id}"` : current ? 'data-action="close-modal"' : `data-start-map="${m.id}"`}>${icon("compass")}${fromMenu ? "New game in this world" : current ? "Return to my expedition" : "Begin this journey"}</button><button class="text-button" data-action="maps">See all worlds</button></div></div>`,
    true,
  );
  mapPreview = new GameScene($("map-preview-canvas"), m, graphicsQuality);
  mapPreview.controls.autoRotate = true;
  mapPreview.controls.autoRotateSpeed = 0.3;

  const currentPreview = mapPreview;
  void mapPreview.ready.then(() => {
    if (mapPreview === currentPreview) $("map-preview-loading").hidden = true;
  });
}
async function startMap(id: string, count = state.players.length) {
  titleMenu?.hide();
  if (realtime.session) {
    if (realtime.room?.phase !== "lobby" || !realtime.isHost) {
      toast("Only the host can choose a new world in the lobby.");
      return;
    }
    await realtime.command("SET_WORLD", { map: id });
    closeModal();
    roomPanels.lobby();
    return;
  }
  const char = state.players[state.active].character;
  state = newGame(count, char, id);
  persist();
  dialog.close();
  modalType = "";
  challengePanel?.stop();
  preview?.dispose();
  preview = null;
  mapPreview?.dispose();
  mapPreview = null;
  scene.dispose();
  theme = getMap(id);
  gameAudio.setTheme(theme);
  $("viewport").style.background = "";
  document
    .querySelector<HTMLElement>(".world-area")!
    .style.setProperty("--world-bg", theme.sky);
  $("scene-loading").hidden = false;
  await delay(20);
  scene = boardScene();
  attachScene();
  await scene.setPlayers(state.players, 0);
  $("scene-loading").hidden = true;
  showDice(1);
  update();
  sound("transition");
  toast(`Welcome to ${theme.name}. Your story starts here.`);
}
function showEncounter() {
  const event = currentMystery(state);
  if (!event) return;
  sound("magic");
  openModal(
    "encounter",
    modalHeader(
      `TILE ${state.players[state.active].position + 1} · A MYSTERY UNFOLDS`,
      event.title,
      false,
    ) +
      `<div class="encounter-art">${icon(event.icon)}<span>✧</span><span>✦</span></div><p class="encounter-text">${event.text}</p><div class="encounter-choices">${event.choices.map((c, i) => `<button data-choice="${i}" ${state.players[state.active].gold + c.gold < 0 || (realtime.session && !realtime.myTurn) ? "disabled" : ""}><div><strong>${c.label}</strong><span>${c.detail}</span></div>${icon("arrow-up-right")}</button>`).join("")}</div><p class="modal-note">${icon("sparkles")} Your choices make the journey.</p>`,
  );
}
async function resolveChoice(index: number) {
  if (busy) return;
  if (realtime.session) {
    if (!realtime.myTurn) return;
    try {
      await realtime.command("CHOOSE", { index });
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Could not resolve the choice.",
      );
    }
    return;
  }
  const player = state.active,
    route = choose(state, index);
  dialog.close();
  modalType = "";
  busy = true;
  update();
  await scene.move(player, route, runMovement);
  if ((state.phase as string) === "won") {
    scene.react(player, "celebrate");
    scene.impact(player, "victory");
  } else if (
    (state.phase as string) === "event" ||
    state.journal[0]?.text.includes("gold")
  )
    scene.react(player, "magic");
  busy = false;
  persist();
  update();
  if (state.phase === "won") showVictory();
  else toast(state.journal[0].text);
}
function showVictory() {
  const winner = state.players[state.winner!],
    c = CHARACTERS.find((c) => c.id === winner.character)!;
  const online = Boolean(realtime.session);
  const standings = [...state.players].sort(
    (a, b) => playerScore(b) - playerScore(a),
  );
  sound("victory");
  openModal(
    "victory",
    modalHeader(
      "YOUR LEGEND BEGINS",
      `${online ? safe(winner.name) : c.name} wins the expedition.`,
      false,
    ) +
      `<div class="victory-art">${icon("crown")}<span>✧</span><span>✧</span></div><p class="encounter-text">Through every twist, every mystery, and every leap of faith, your party found its way to ${theme.regions[3]}.</p><div class="victory-stats"><div><strong>${state.turn}</strong><span>Turns traveled</span></div><div><strong>${winner.gold}</strong><span>Gold found</span></div><div><strong>${winner.clues}</strong><span>Clues collected</span></div><div><strong>${playerScore(winner)}</strong><span>Winning points</span></div></div><div class="victory-standings">${standings.map((p, i) => `<div><span>${i + 1}. ${safe(p.name)} · ${CHARACTERS.find((c) => c.id === p.character)!.name}</span><strong>${playerScore(p)} pts</strong></div>`).join("")}</div>${online ? `<button class="primary-button" data-action="rooms">${icon("users")}Return to the party · ${realtime.isHost ? "Play again" : "Wait for a rematch"}</button>` : `<button class="primary-button" data-action="victory-maps">${icon("map")}Find your next adventure</button>`}<button class="text-button" data-action="view-board">Stay a little longer</button>`,
  );
}

let profilePreview: CharacterPreview | null = null;
function showSettings(section = "") {
  openModal(
    "settings",
    modalHeader("MAKE YOURSELF AT HOME", "Configuration") +
      configPage({
        graphics: readGraphics(),
        prefs,
        profile,
        quality: scene?.quality || graphicsQuality,
        audio: gameAudio.preferences,
        partySize: Math.min(4, state.players.length),
        room:
          realtime.room && realtime.room.phase !== "finished"
            ? {
                difficulty: realtime.room.difficulty || "soft",
                host: realtime.isHost,
              }
            : undefined,
        escape: safe,
        icon,
      }),
    true,
  );
  profilePreview?.dispose();
  profilePreview = new CharacterPreview($("profile-preview"));
  void profilePreview.show(
    CHARACTERS.find((c) => c.id === profile.character)!,
    profile.tint,
  );
  if (section) jumpToConfig(section);
}
function jumpToConfig(section: string) {
  document
    .getElementById("config-" + section)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  document
    .querySelectorAll<HTMLElement>("[data-config-jump]")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.configJump === section),
    );
}
function updateGraphics(change: (options: GraphicsOptions) => void) {
  const options = readGraphics();
  change(options);
  saveGraphics(options);
  scene.applyGraphics(options);
  configureBoard(scene);
}
function updatePreferences(change: (p: Preferences) => void) {
  change(prefs);
  runMovement = prefs.run;
  graphicsQuality = prefs.quality;
  savePreferences(prefs);
  applyPreferences();
}
function updateProfile(change: (p: Profile) => void) {
  change(profile);
  saveProfile(profile);
  const hero = CHARACTERS.find((c) => c.id === profile.character)!;
  $("profile-preview")?.style.setProperty("--hero-color", hero.color);
  void profilePreview?.show(hero, profile.tint);
}
function showHelp() {
  openModal(
    "help",
    modalHeader(
      "A SMALL GUIDE TO A BIG ADVENTURE",
      "Let curiosity lead the way.",
    ) +
      `<div class="help-steps"><div><span>01</span><div><h3>Choose your wanderer</h3><p>Open your character card to meet the 12 adventurers. Rotate the preview, try their actions, and select your favorite.</p></div></div><div><span>02</span><div><h3>Follow the path</h3><p>Roll a six-sided die and travel along 93 tiles through four rising regions. Reach the final tile to win; an exact roll is not required.</p></div></div><div><span>03</span><div><h3>Expect the unexpected</h3><p>Mysteries offer choices. Treasure gives 3 gold. Fortune gives 2 gold and a clue. Portals move you 3 extra tiles. Extra movement ends safely without triggering another encounter.</p></div></div><div><span>04</span><div><h3>Make it your adventure</h3><p>Use New Game for solo, 1–8 players on one device, or online rooms. Everyone chooses a unique hero. Adventure adds dragon guardians, mystery boxes, dares, dangers and ten mini-games. Classic races reward the first finisher; Score expeditions reward the highest points. Offline Classic supports 1–4 players in settings.</p></div></div></div><div class="keyboard-guide"><span><kbd>SPACE</kbd> Roll</span><span><kbd>F</kbd> Find hero</span><span><kbd>R</kbd> Reset view</span><span><kbd>ESC</kbd> Close</span></div><p class="modal-note">Drag the world to orbit. Scroll or pinch to zoom. Right-drag to pan. Sound is optional. <a href="/ASSET-CREDITS.md" target="_blank" rel="noopener">3D asset credits</a>.</p>`,
  );
}
function showJournal() {
  openModal(
    "journal",
    modalHeader(
      "LITTLE MOMENTS. LASTING MEMORIES.",
      "Your traveler’s journal",
    ) +
      `<div class="full-journal">${state.journal.map((j) => `<div><span>TURN ${String(j.turn).padStart(2, "0")}</span><p>${safe(j.text)}</p></div>`).join("")}</div>`,
  );
}
function attachScene() {
  scene.onStep = () => sound("step");
  scene.onLand = () => sound("land");
  scene.onTile = (id) => {
    const tip = $("tile-tooltip");
    if (id === null || busy || !prefs.tooltips) {
      tip.hidden = true;
      return;
    }
    const t = getTiles(state.map)[id];
    const stop = realtime.room?.challenges ? roadStop(id) : undefined;
    if (stop) {
      tip.hidden = false;
      tip.innerHTML = `<span style="color:${theme.accent}">✧</span><div><strong>${stop.title}</strong><small>Tile ${id + 1} · ${stop.description}</small></div>`;
      return;
    }
    const card =
      realtime.room?.challenges && t.kind !== "start" && t.kind !== "finish"
        ? ` · Then draw a ${realtime.room.difficulty || "soft"} party card.`
        : "";
    tip.innerHTML = `<span style="color:${TILE_INFO[t.kind].color}">${TILE_INFO[t.kind].icon}</span><div><strong>${t.kind === "finish" ? theme.regions[3] : t.kind === "start" ? theme.regions[0] : TILE_INFO[t.kind].label}</strong><small>Tile ${id + 1} · ${t.kind === "finish" ? "The end of this path. The beginning of your legend." : TILE_INFO[t.kind].description}${card}</small></div>`;
    tip.hidden = false;
  };
}
app.addEventListener("click", async (e) => {
  if ((e.target as HTMLElement).closest(".brand")) {
    e.preventDefault();
    showMainMenu();
    return;
  }
  const el = (e.target as HTMLElement).closest<HTMLElement>("button");
  if (!el || el.hasAttribute("disabled")) return;
  const action = el.dataset.action;
  if (action !== "sound") sound("ui");
  if (action === "exit-game") {
    exitToMenu();
  } else if (action === "main-menu") {
    showMainMenu();
  } else if (action === "new-game-setup") {
    openGameSetup(el.dataset.world || state.map);
  } else if (action === "rooms") {
    roomPanels.open();
  } else if (action === "journey") {
    document.querySelector(".game-shell")!.classList.toggle("journey-open");
  } else if (action === "roll") void doRoll();
  else if (action === "characters") showCharacters();
  else if (action === "maps") showMaps();
  else if (action === "settings") showSettings();
  else if (action === "reset-graphics") {
    saveGraphics(GRAPHICS_DEFAULTS);
    scene.applyGraphics(GRAPHICS_DEFAULTS);
    configureBoard(scene);
    showSettings("grading");
  } else if (action === "reset-preferences") {
    updatePreferences((p) =>
      Object.assign(p, { ...PREFERENCE_DEFAULTS, quality: p.quality }),
    );
    showSettings("access");
  } else if (el.dataset.configJump) jumpToConfig(el.dataset.configJump);
  else if (el.dataset.profileTint) {
    updateProfile((p) => (p.tint = el.dataset.profileTint!));
    document
      .querySelectorAll("[data-profile-tint]")
      .forEach((b) => b.classList.toggle("active", b === el));
  } else if (action === "help") showHelp();
  else if (action === "journal") showJournal();
  else if (action === "close-modal") closeModal();
  else if (action === "focus") scene.focusPlayer();
  else if (action === "zoom-in") scene.zoom(0.85);
  else if (action === "zoom-out") scene.zoom(1.18);
  else if (action === "reset-camera") scene.resetCamera();
  else if (action === "sound") {
    muted = !muted;
    await gameAudio.setEnabled(!muted);
    syncSoundButton();
    sound("magic");
    toast(
      muted
        ? "Sound is off. A quieter kind of adventure."
        : "Sound is on. Music and ambience follow your world.",
    );
  } else if (action === "prev-character" || action === "next-character") {
    selected =
      (selected + (action === "next-character" ? 1 : CHARACTERS.length - 1)) %
      CHARACTERS.length;
    updateCharacter();
  } else if (action === "select-character") {
    if (realtime.session) {
      try {
        await realtime.command("SELECT_CHARACTER", {
          character: CHARACTERS[selected].id,
          ...(previewTint ? { tint: previewTint } : {}),
          ...(realtime.room?.hotseat
            ? { playerId: state.players[ownPlayerIndex()].id }
            : {}),
        });
        closeModal();
        roomPanels.lobby();
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : "That character could not be selected.",
        );
      }
      return;
    }
    state.players[state.active].character = CHARACTERS[selected].id;
    if (previewTint) state.players[state.active].tint = previewTint;
    persist();
    closeModal();
    busy = true;
    update();
    await scene.setPlayers(state.players, state.active);
    busy = false;
    update();
    toast(`${CHARACTERS[selected].name} is ready for the journey.`);
  } else if (action === "confirm-restart") {
    if (realtime.session) {
      roomPanels.open();
      return;
    }

    const count = Number($<HTMLSelectElement>("party-setting").value);
    openModal(
      "restart",
      modalHeader("A FRESH START", "Another story is waiting.") +
        `<p class="modal-intro">Begin a new ${count === 1 ? "solo" : count + " player"} expedition in ${theme.name}? This replaces your saved progress.</p><div class="modal-actions"><button class="secondary-button" data-action="close-modal">Keep my journey</button><button class="primary-button" data-restart="${count}">Begin again</button></div>`,
    );
  } else if (action === "victory-maps") {
    modalType = "";
    dialog.close();
    showMaps();
  } else if (action === "view-board") {
    modalType = "";
    dialog.close();
  } else if (el.dataset.character !== undefined) {
    selected = Number(el.dataset.character);
    updateCharacter();
  } else if (el.dataset.animation) {
    preview?.setAction(el.dataset.animation as Action);
    document
      .querySelectorAll("[data-animation]")
      .forEach((b) => b.classList.toggle("active", b === el));
  } else if (el.dataset.view) {
    preview?.setView(el.dataset.view);
    document
      .querySelectorAll("[data-view]")
      .forEach((b) => b.classList.toggle("active", b === el));
  } else if (el.dataset.tint) {
    previewTint = el.dataset.tint;
    document
      .querySelectorAll("[data-tint]")
      .forEach((b) => b.classList.toggle("active", b === el));
    updateCharacter();
  } else if (action === "preview-map-reset") mapPreview?.resetCamera();
  else if (action === "preview-map-in") mapPreview?.zoom(0.85);
  else if (action === "preview-map-out") mapPreview?.zoom(1.18);
  else if (el.dataset.previewMap) confirmMap(el.dataset.previewMap);
  else if (el.dataset.map) confirmMap(el.dataset.map);
  else if (el.dataset.startMap) void startMap(el.dataset.startMap);
  else if (el.dataset.choice !== undefined)
    void resolveChoice(Number(el.dataset.choice));
  else if (el.dataset.restart)
    void startMap(theme.id, Number(el.dataset.restart));
});
app.addEventListener("change", (e) => {
  const el = e.target as HTMLInputElement;
  if (el.id === "lighting-setting")
    updateGraphics((o) => (o.lighting = el.value as LightingStyle));
  if (el.dataset.graphicsToggle) {
    const key = el.dataset.graphicsToggle as keyof GraphicsOptions;
    updateGraphics(
      (o) => ((o as unknown as Record<string, boolean>)[key] = el.checked),
    );
  }
  if (el.dataset.graphicsSelect) {
    const key = el.dataset.graphicsSelect;
    updateGraphics((o) => {
      (o as unknown as Record<string, unknown>)[key] =
        key === "fpsCap" ? Number(el.value) : el.value;
    });
  }
  if (el.dataset.prefToggle && el.id !== "run-setting") {
    const key = el.dataset.prefToggle;
    updatePreferences(
      (p) => ((p as unknown as Record<string, boolean>)[key] = el.checked),
    );
  }
  if (el.dataset.prefSelect) {
    const key = el.dataset.prefSelect;
    updatePreferences(
      (p) => ((p as unknown as Record<string, string>)[key] = el.value),
    );
  }
  if (el.dataset.profile) {
    const key = el.dataset.profile;
    updateProfile((p) => {
      (p as unknown as Record<string, unknown>)[key] =
        key === "partySize" ? Number(el.value) : el.value;
    });
  }
  if (el.dataset.profileToggle)
    updateProfile((p) => (p.challenges = el.checked));
  if (el.id === "profile-name")
    updateProfile((p) => (p.name = el.value.trim().slice(0, 24)));
  if (el.id === "world-sort") sortWorlds(el.value);
  if (el.id === "game-difficulty")
    void realtime
      .command("SET_DIFFICULTY", { difficulty: el.value })
      .then(() =>
        toast("Deck switched. The next card comes from the new level."),
      )
      .catch((error) => toast(error.message));
  if (el.id === "quality-setting") {
    graphicsQuality = el.value as Quality;
    scene.setQuality(graphicsQuality);
    saveDisplayPreferences();
    toast(`Graphics set to ${el.value}.`);
  }
  if (el.id === "run-setting") {
    runMovement = el.checked;
    saveDisplayPreferences();
  }
  if (el.id === "audio-enabled") {
    muted = !el.checked;
    void gameAudio.setEnabled(el.checked);
    syncSoundButton();
  }
});
dialog.addEventListener("close", () => {
  if (scene) scene.paused = false;
});
dialog.addEventListener("cancel", (e) => {
  if (
    modalType === "encounter" ||
    modalType === "victory" ||
    modalType === "challenge" ||
    modalType === "road"
  )
    e.preventDefault();
  else {
    preview?.dispose();
    preview = null;
    mapPreview?.dispose();
    mapPreview = null;
    profilePreview?.dispose();
    profilePreview = null;
    modalType = "";
  }
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    )
      closeModal();
  }
});
window.addEventListener("keydown", (e) => {
  if (
    (e.target as HTMLElement).matches("input,select,textarea,button") ||
    dialog.open ||
    titleMenu?.isOpen
  )
    return;
  if (e.code === "Space") {
    e.preventDefault();
    void doRoll();
  }
  if (e.key.toLowerCase() === "f") scene.focusPlayer();
  if (e.key.toLowerCase() === "r") scene.resetCamera();
});
app.addEventListener("input", (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.graphics || el.dataset.pref) {
    const divisor = Number(el.dataset.divisor || 100),
      value = Number(el.value) / divisor,
      key = (el.dataset.graphics || el.dataset.pref)!;
    if (el.dataset.graphics)
      updateGraphics(
        (o) => ((o as unknown as Record<string, number>)[key] = value),
      );
    else
      updatePreferences(
        (p) => ((p as unknown as Record<string, number>)[key] = value),
      );
    const output = $((el.dataset.graphics ? "graphics-" : "pref-") + key);
    if (output)
      output.textContent = formatSetting(Number(el.value), el.dataset.unit);
  }
  if (el.id === "world-search") filterWorlds();
  if (el.dataset.audioVolume) {
    const channel = el.dataset.audioVolume as "music" | "ambience" | "effects";
    gameAudio.setVolume(channel, Number(el.value) / 100);
    $("volume-" + channel).textContent = el.value + "%";
  }
});
window.addEventListener("beforeunload", persist);
applyPreferences();
update();
refreshIcons();
syncSoundButton();
document
  .querySelector<HTMLElement>(".world-area")!
  .style.setProperty("--world-bg", theme.sky);
try {
  scene = boardScene();
  attachScene();
  update();
  void scene.setPlayers(state.players, state.active).then(() => {
    $("scene-loading").hidden = true;
  });
  if (state.dice) showDice(state.dice);
  restorePromise = realtime.restore();
  titleMenu.show(menuJourney(), state.map);
} catch (err) {
  console.error(err);
  $("scene-loading").innerHTML =
    `<div><h2>Your browser couldn’t open the 3D world.</h2><p>Enable WebGL and hardware acceleration, then refresh to continue.</p><button class="secondary-button" onclick="location.reload()">Try again</button></div>`;
}

function renderParty() {
  const panel = $("party-panel");
  panel.hidden = state.players.length === 1 && !realtime.session;
  if (panel.hidden) return;
  panel.innerHTML = `<div class="party-title"><span>${realtime.room?.hotseat ? "PASS THE DEVICE" : realtime.session ? "LIVE EXPEDITION" : "TURN ORDER"}</span><button class="icon-button" data-action="rooms" aria-label="Open room">${icon("users")}</button></div>${state.players.map((p, i) => `<div class="party-score-row ${i === state.active ? "active" : ""}"><span class="party-player-dot" style="--player:${p.tint}">${i === state.active ? "✧" : String(i + 1)}</span><div><strong>${safe(p.name)}${p.id === realtime.session?.playerId ? " <small>YOU</small>" : ""}</strong><span>${CHARACTERS.find((c) => c.id === p.character)!.name} · Tile ${p.position + 1}${p.wards ? " · ◇" + p.wards : ""}${p.hex ? " · Hexed" : ""}</span></div><b>${playerScore(p)}<small>PTS</small></b></div>`).join("")}<div class="party-footer">${realtime.session ? `${realtime.room?.mode === "score" ? "Score expedition" : "Classic race"} · Room ${realtime.room?.code}` : "Pass-and-play on this device"}</div>`;
}
async function leaveOnline() {
  challengePanel?.stop();
  dialog.close();
  modalType = "";
  visualRoomId = "";
  visualRoomPhase = "";
  shownNetworkEncounter = "";
  try {
    state =
      parseSave(localStorage.getItem("wilder-expedition-v1")) || newGame();
  } catch {
    state = newGame();
  }
  theme = getMap(state.map);
  scene.dispose();
  scene = boardScene();
  attachScene();
  await scene.setPlayers(state.players, state.active);
  busy = false;
  update();
  toast(
    "You returned to your local expedition. The room is saved on the server.",
  );
}
async function receiveRoom(message: RoomUpdate) {
  if (!realtime.session || message.room.id !== realtime.session.roomId) return;
  const room = message.room,
    previous = state,
    initial = visualRoomId !== room.id,
    partyChanged =
      initial ||
      previous.players
        .map((p) => p.id + ":" + p.character + ":" + p.tint)
        .join("|") !==
        room.game.players
          .map((p) => p.id + ":" + p.character + ":" + p.tint)
          .join("|"),
    mapChanged = state.map !== room.game.map,
    wasLobby = visualRoomPhase === "lobby",
    returnedToLobby = room.phase === "lobby" && visualRoomPhase === "finished";
  visualRoomId = room.id;
  visualRoomPhase = room.phase;
  state = room.game;
  if (mapChanged) {
    theme = getMap(state.map);
    gameAudio.setTheme(theme);
    scene.dispose();
    scene = boardScene();
    attachScene();
    $("scene-loading").hidden = false;
    document
      .querySelector<HTMLElement>(".world-area")!
      .style.setProperty("--world-bg", theme.sky);
  }
  if (partyChanged || mapChanged) {
    busy = true;
    await scene.setPlayers(state.players, state.active);
    $("scene-loading").hidden = true;
    busy = false;
  }
  scene.setRoadEncounters(Boolean(room.challenges));
  if (titleMenu?.isOpen) {
    titleMenu.updateJourney(menuJourney());
    if (launchFromMenu && room.id !== previousMenuRoom) {
      titleMenu.hide();
      launchFromMenu = false;
    } else {
      busy = false;
      update();
      return;
    }
  }
  const payload = message.event?.payload;
  if (payload?.route?.length && !initial && !partyChanged && !mapChanged) {
    if (dialog.open) {
      dialog.close();
      modalType = "";
      challengePanel?.stop();
    }
    busy = true;
    update();
    if (payload.dice) {
      showDice(payload.dice);
      sound("roll");
    }
    await scene.move(
      payload.playerIndex ?? previous.active,
      payload.route,
      runMovement,
    );
    if (room.game.phase === "won") {
      scene.react(payload.playerIndex ?? previous.active, "celebrate");
      scene.impact(payload.playerIndex ?? previous.active, "victory");
      sound("victory");
    } else if (
      room.game.phase === "event" ||
      room.game.phase === "challenge" ||
      room.game.phase === "road"
    ) {
      scene.react(payload.playerIndex ?? previous.active, "magic");
      scene.impact(payload.playerIndex ?? previous.active, "mystery");
    } else if (room.game.journal[0]?.text.includes("gold")) {
      scene.impact(payload.playerIndex ?? previous.active, "treasure");
      sound("treasure");
    }
    await delay(room.game.phase === "ready" ? 50 : 350);
  }
  busy = false;
  if (room.phase === "playing" && wasLobby && dialog.open) {
    dialog.close();
    modalType = "";
    preview?.dispose();
    preview = null;
  }
  update();
  if (room.phase === "lobby") {
    shownNetworkEncounter = "";
    if (modalType === "characters") updateCharacter();
    else if (
      modalType === "lobby" ||
      returnedToLobby ||
      modalType === "rooms" ||
      initial ||
      !dialog.open
    )
      roomPanels.lobby();
    return;
  }
  const encounterKey =
    room.id +
    ":" +
    state.turn +
    ":" +
    state.phase +
    ":" +
    (room.game.challenge?.id || state.mystery || "");
  if (
    (state.phase === "event" ||
      state.phase === "road" ||
      state.phase === "challenge" ||
      state.phase === "won") &&
    shownNetworkEncounter !== encounterKey
  ) {
    shownNetworkEncounter = encounterKey;
    if (state.phase === "event") showEncounter();
    else if (state.phase === "challenge") challengePanel?.open();
    else if (state.phase === "road") challengePanel?.openRoad();
    else showVictory();
  } else if (
    state.phase === "ready" &&
    ["encounter", "challenge", "road"].includes(modalType)
  ) {
    challengePanel?.stop();
    dialog.close();
    modalType = "";
  }
  const result =
    payload?.success !== undefined && payload.challengeTitle
      ? challengeResult(
          previous.players[payload.playerIndex ?? previous.active]?.name || "",
          payload,
        )
      : "";
  const handoff =
    room.hotseat &&
    prefs.handoff &&
    state.players.length > 1 &&
    state.phase === "ready" &&
    !initial &&
    previous.active !== state.active;
  if (handoff) {
    const player = state.players[state.active],
      hero = CHARACTERS.find((c) => c.id === player.character)!;
    openModal(
      "handoff",
      (result ? result : "") +
        modalHeader("PASS THE DEVICE", `${safe(player.name)}, your turn.`) +
        `<div class="handoff-hero" style="--hero-color:${hero.color}">${icon("users")}</div><p class="encounter-text">${hero.name} is waiting on tile ${player.position + 1}. Pass the phone or keyboard to ${safe(player.name)}.</p><button class="primary-button full-width" data-action="close-modal">${icon("check")}I’m ready to explore</button>`,
    );
  } else if (
    result &&
    !(
      dialog.open &&
      ["road", "challenge", "encounter", "victory"].includes(modalType)
    )
  )
    openModal(
      "challenge-result",
      result +
        `<button class="primary-button full-width" data-action="close-modal">${icon("check")}Continue</button>`,
    );
}
/** The outcome of a mini-game, shown to everyone once the server has judged it. */
function challengeResult(
  name: string,
  p: NonNullable<RoomUpdate["event"]>["payload"],
) {
  const won = Boolean(p.success);
  const verdict = won
    ? "Success!"
    : p.skipped
      ? "Challenge passed"
      : p.timedOut
        ? "Out of time"
        : "Not this time";
  sound(won ? "treasure" : "land");
  return `<section class="challenge-result ${won ? "won" : "lost"}"><div class="challenge-result-badge">${icon(won ? "crown" : "x")}</div><span class="eyebrow">${safe(name.toUpperCase())} · ${safe((p.challengeTitle || "").toUpperCase())}</span><h2>${verdict}</h2>${won ? `<p class="challenge-result-reward">+${p.rewardPoints} points · +${p.rewardGold} gold</p>` : ""}${p.solution ? `<dl><dt>${won ? "Answer" : "The answer was"}</dt><dd>${safe(p.solution)}</dd>${!won && p.given ? `<dt>${safe(name)} chose</dt><dd>${safe(p.given)}</dd>` : ""}</dl>` : ""}</section>`;
}
