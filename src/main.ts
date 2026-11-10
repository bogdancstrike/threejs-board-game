import "./style.css";
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
} from "lucide";
import { CHARACTERS, getTiles, TILE_INFO } from "./game/data";
import { MAPS, getMap } from "./game/maps";
import {
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
};
const icon = (name: string, cls = "") =>
  `<i data-lucide="${name}" class="${cls}"></i>`;
const refreshIcons = () =>
  createIcons({ icons, attrs: { "stroke-width": 1.6 } });
const app = document.querySelector<HTMLDivElement>("#app")!;
let state: GameState;
try {
  state = parseSave(localStorage.getItem("wilder-expedition-v1")) || newGame();
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
const safe = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
app.innerHTML = `
<header class="topbar"><a class="brand" href="/" aria-label="Wilder home"><span class="brand-mark">${icon("compass")}</span><span>Wilder<span class="brand-caption">A PATH OF MYSTERIES</span></span></a><div class="header-center"><span class="tiny-star">✧</span> A little courage. A little magic. <span class="tiny-star">✧</span></div><nav><button class="nav-link" data-action="journey" aria-label="Toggle journey details">${icon("book-open")}<span>Journey</span></button><button class="nav-link" data-action="characters" aria-label="Choose character">${icon("users")}<span>Adventurer</span></button><button class="nav-link" data-action="maps">${icon("map")}<span>Worlds</span><span class="count-badge">10</span></button><button class="nav-link" data-action="help">${icon("circle-help")}<span>How to play</span></button><span class="nav-divider"></span><button class="icon-button sound-button" data-action="sound" aria-label="Enable sound">${icon("volume-x")}</button><button class="icon-button" data-action="settings" aria-label="Game settings">${icon("settings-2")}</button></nav></header>
<main class="game-shell"><aside class="sidebar"><div class="expedition-intro"><div class="eyebrow">AN ADVENTURE AWAITS</div><h1 id="map-title"></h1><p class="intro-copy">Follow the path.<br>Find your own story.</p><button class="map-link" data-action="maps">${icon("map")}<span>Explore another world</span>${icon("arrow-up-right")}</button></div>
<div class="sidebar-rule"></div><div class="section-label">YOUR ADVENTURER<button data-action="characters">Change ${icon("chevron-right")}</button></div><button class="hero-card" data-action="characters"><div id="hero-avatar" class="hero-avatar">${icon("wand-sparkles")}</div><div><strong id="hero-name"></strong><span id="hero-class"></span></div><span class="hero-online"></span></button>
<div class="journey"><div class="section-label"><span>THE JOURNEY</span><span class="tile-counter"><b id="tile-current">01</b> / 93</span></div><div class="progress-track"><div id="progress-fill"></div></div><div id="region-list" class="region-list"></div></div>
<div class="inventory"><div>${icon("gem")}<strong id="gold">0</strong><span>Gold found</span></div><div>${icon("sparkles")}<strong id="clues">0</strong><span>Clues collected</span></div></div>
<div class="journal-section"><div class="section-label">TRAVELER’S JOURNAL<button data-action="journal">View all ${icon("arrow-up-right")}</button></div><div id="journal"></div></div><div class="sidebar-footer"><span class="save-dot"></span> Your journey is saved automatically</div></aside>
<section class="world-area" aria-label="Game board"><div class="sky-stars"></div><div class="world-grain"></div><div id="viewport"></div><div class="world-heading"><span class="eyebrow" id="chapter">CHAPTER I</span><h2 id="region-name">Hearthwick Village</h2><p id="region-subtitle">Every great tale begins with a small step.</p></div><div class="world-meta"><span class="live-dot"></span><span id="player-count">SOLO EXPEDITION</span><span class="meta-divider"></span><span id="turn-label">TURN 01</span></div><div class="world-label castle-label" id="destination-label">${icon("flag")}<span>CROWNFALL CASTLE</span></div><div id="tile-tooltip" class="tile-tooltip" hidden></div><div class="compass-rose"><span>N</span><div>✧</div></div><div class="camera-controls"><button data-action="focus" aria-label="Focus active character" title="Focus character (F)">${icon("crosshair")}</button><span></span><button data-action="zoom-in" aria-label="Zoom in">${icon("plus")}</button><button data-action="zoom-out" aria-label="Zoom out">${icon("minus")}</button><span></span><button data-action="reset-camera" aria-label="Reset camera" title="Reset camera (R)">${icon("scan")}</button></div><div class="camera-hint">${icon("orbit")} Drag to explore <span>·</span> Scroll to zoom</div>
<div class="turn-panel"><div class="turn-icon">${icon("sparkles")}</div><div class="turn-copy"><span class="eyebrow" id="turn-eyebrow">YOUR STORY STARTS HERE</span><h3 id="turn-title">The first step is yours.</h3><p id="turn-description">Roll the dice. See where the path takes you.</p></div><div class="dice-separator"></div><div id="dice" class="dice-face" aria-label="Dice"><span class="dice-pip"></span></div><button id="roll-button" class="primary-button" data-action="roll">${icon("dices")}<span>Roll the dice</span><kbd>SPACE</kbd></button></div>
<div class="board-legend"><span><i style="--dot:#b4a0dc"></i>Mystery</span><span><i style="--dot:#edbf67"></i>Treasure</span><span><i style="--dot:#83cbb4"></i>Fortune</span><span><i style="--dot:#82c9dd"></i>Portal</span></div><div class="scene-loading" id="scene-loading"><span class="loading-orbit"></span>Unfolding your world…</div></section></main>
<dialog id="modal" class="modal"><div id="modal-content"></div></dialog><div id="toast" class="toast" role="status"></div>`;
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const dialog = $<HTMLDialogElement>("modal");
let toastTimer: ReturnType<typeof setTimeout>;
function toast(text: string) {
  $("toast").textContent = text;
  $("toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("visible"), 3500);
}
function persist() {
  saveGame(state);
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
  $("region-list").innerHTML = theme.regions
    .map(
      (r, i) =>
        `<div class="region-step ${i === tile.region ? "current" : i < tile.region ? "completed" : ""}"><span class="region-dot">${i < tile.region ? "✓" : i === tile.region ? "✧" : ""}</span><span>${r}</span>${i === tile.region ? '<span class="here-tag">YOU ARE HERE</span>' : ""}</div>`,
    )
    .join("");
  $("chapter").textContent =
    `CHAPTER ${["I", "II", "III", "IV"][tile.region]} · ${theme.tagline.toUpperCase()}`;
  $("region-name").textContent = theme.regions[tile.region];
  $("region-subtitle").textContent = [
    "Every great tale begins with a small step.",
    "There’s more to this place than meets the eye.",
    "Old magic waits beneath the stone.",
    "One final climb. A thousand untold stories.",
  ][tile.region];
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
  button.disabled = busy || state.phase !== "ready";
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
let audio: AudioContext | null = null;
function sound(type: "roll" | "step" | "magic") {
  if (muted) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const now = audio.currentTime;
    const notes =
      type === "magic"
        ? [440, 554, 659, 880]
        : type === "roll"
          ? [220, 280, 180]
          : [260];
    notes.forEach((freq, i) => {
      const osc = audio!.createOscillator(),
        gain = audio!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.045, now + i * 0.08 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.24);
      osc.connect(gain);
      gain.connect(audio!.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.26);
    });
  } catch {}
}
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
  if((state.phase as string)==='won')scene.react(player,'celebrate');else if((state.phase as string)==='event'||state.journal[0]?.text.includes('gold'))scene.react(player,'magic');
  busy = false;
  persist();
  update();
  if ((state.phase as string) === "event") showEncounter();
  else if ((state.phase as string) === "won") showVictory();
  else if (
    state.journal[0].text.includes("gold") ||
    state.journal[0].text.includes("portal")
  ) {
    sound("magic");
    toast(state.journal[0].text);
  }
}
function closeModal() {
  if (modalType === "encounter" || modalType === "victory") return;
  preview?.dispose();
  preview = null;
  mapPreview?.dispose();
  mapPreview = null;
  dialog.close();
  modalType = "";
}
function openModal(type: string, html: string, wide = false) {
  preview?.dispose();
  preview = null;
  mapPreview?.dispose();
  mapPreview = null;
  modalType = type;
  if (scene) scene.paused = true;
  dialog.className = `modal ${wide ? "modal-wide" : ""} modal-${type}`;
  $("modal-content").innerHTML = html;
  if (!dialog.open) dialog.showModal();
  refreshIcons();
}
const modalHeader = (eyebrow: string, title: string, close = true) =>
  `<div class="modal-header"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div>${close ? `<button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon("x")}</button>` : ""}</div>`;
function showCharacters() {
  if (busy) return;
  selected = CHARACTERS.findIndex(
    (c) => c.id === state.players[state.active].character,
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
    `${String(selected + 1).padStart(2, "0")} / 12 ADVENTURERS`;
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
    (p, i) => i !== state.active && p.character === c.id,
  );
  const b = $<HTMLButtonElement>("select-character");
  b.disabled = taken;
  b.innerHTML =
    icon(taken ? "users" : "check") +
    `<span>${taken ? "Traveling with another player" : `Select ${c.name}`}</span>`;
  void preview?.show(c, previewTint || state.players[state.active].tint);
  refreshIcons();
}
function showMaps() {
  if (busy) return;
  openModal(
    "maps",
    modalHeader("TEN WORLDS. COUNTLESS STORIES.", "Where will you wander?") +
      `<p class="modal-intro">A new landscape. A new mystery. The same adventurous spirit.</p><div class="maps-grid">${MAPS.map((m, i) => `<button class="map-card ${m.id === theme.id ? "selected" : ""}" data-map="${m.id}" style="--map-sky:${m.sky};--map-ground:${m.terrain[2]};--map-accent:${m.accent}"><div class="map-art"><img class="map-thumbnail" src="/previews/${m.id}.webp" alt="3D preview of ${m.name}" loading="lazy" onerror="this.style.display='none'"/><div class="map-art-moon"></div><div class="map-art-mountain back"></div><div class="map-art-mountain"></div><div class="map-art-island"></div><span class="map-art-icon">${icon(m.icon)}</span><span class="map-number">${String(i + 1).padStart(2, "0")}</span>${m.id === theme.id ? '<span class="map-current">CURRENT WORLD</span>' : ""}</div><div class="map-card-copy"><h3>${m.name}</h3><p>${m.tagline}</p><span>${m.id === "dragonkind" ? "Dragon rider academy" : "93 tiles · 4 chapters"} ${icon("arrow-up-right")}</span></div></button>`).join("")}</div><p class="modal-note">Choosing another world starts a fresh expedition. Your current journey is saved until you confirm.</p>`,
    true,
  );
}
function confirmMap(id: string) {
  const m = getMap(id),
    index = MAPS.indexOf(m),
    current = m.id === theme.id;
  openModal(
    "new-world",
    modalHeader("EXPLORE YOUR NEXT WORLD", m.name) +
      `
  <div class="map-preview-layout"><div class="map-preview-stage"><div id="map-preview-canvas"></div><span class="map-preview-badge">${icon(m.icon)} LIVE 3D PREVIEW</span><div id="map-preview-loading" class="map-preview-loading"><span class="loading-orbit"></span>Bringing this world to life…</div><div class="map-preview-tools"><button data-action="preview-map-reset" aria-label="Reset preview">${icon("scan")}</button><button data-action="preview-map-in" aria-label="Zoom preview in">${icon("plus")}</button><button data-action="preview-map-out" aria-label="Zoom preview out">${icon("minus")}</button></div><div class="map-preview-hint">${icon("orbit")} Drag to rotate · Scroll to explore</div></div><div class="map-preview-copy"><div class="character-index"><span>WORLD ${String(index + 1).padStart(2, "0")} / 10</span><div><button class="icon-button" data-preview-map="${MAPS[(index + 9) % 10].id}" aria-label="Previous map">${icon("chevron-left")}</button><button class="icon-button" data-preview-map="${MAPS[(index + 1) % 10].id}" aria-label="Next map">${icon("chevron-right")}</button></div></div><h3>${m.tagline}</h3><p class="modal-intro">${m.description}</p><div class="map-preview-chapters">${m.regions.map((region, i) => `<div><span>${String(i + 1).padStart(2, "0")}</span>${region}</div>`).join("")}</div><div class="map-preview-stats"><span>${icon("footprints")} 93 tiles</span><span>${icon("sparkles")} Unique mysteries</span></div><p class="modal-note">${current ? "You are exploring this world. Your journey is waiting." : "Start at tile 1 with your current party. This replaces the saved expedition."}</p><button class="primary-button full-width" ${current ? 'data-action="close-modal"' : `data-start-map="${m.id}"`}>${icon("compass")}${current ? "Return to my expedition" : "Begin this journey"}</button><button class="text-button" data-action="maps">See all worlds</button></div></div>`,
    true,
  );
  mapPreview = new GameScene($("map-preview-canvas"), m);
  mapPreview.controls.autoRotate = true;
  mapPreview.controls.autoRotateSpeed = 0.3;
  mapPreview.camera.position.set(32, 37, 43);
  const currentPreview = mapPreview;
  void mapPreview.ready.then(() => {
    if (mapPreview === currentPreview) $("map-preview-loading").hidden = true;
  });
}
async function startMap(id: string, count = state.players.length) {
  const char = state.players[state.active].character;
  state = newGame(count, char, id);
  persist();
  dialog.close();
  modalType = "";
  preview?.dispose();
  preview = null;
  mapPreview?.dispose();
  mapPreview = null;
  scene.dispose();
  theme = getMap(id);
  $("viewport").style.background = "";
  document
    .querySelector<HTMLElement>(".world-area")!
    .style.setProperty("--world-bg", theme.sky);
  $("scene-loading").hidden = false;
  await delay(20);
  scene = new GameScene($("viewport"), theme);
  attachScene();
  await scene.setPlayers(state.players, 0);
  $("scene-loading").hidden = true;
  showDice(1);
  update();
  sound("magic");
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
      `<div class="encounter-art">${icon(event.icon)}<span>✧</span><span>✦</span></div><p class="encounter-text">${event.text}</p><div class="encounter-choices">${event.choices.map((c, i) => `<button data-choice="${i}" ${state.players[state.active].gold + c.gold < 0 ? "disabled" : ""}><div><strong>${c.label}</strong><span>${c.detail}</span></div>${icon("arrow-up-right")}</button>`).join("")}</div><p class="modal-note">${icon("sparkles")} Your choices make the journey.</p>`,
  );
}
async function resolveChoice(index: number) {
  if (busy) return;
  const player = state.active,
    route = choose(state, index);
  dialog.close();
  modalType = "";
  busy = true;
  update();
  await scene.move(player, route, runMovement);
  if((state.phase as string)==='won')scene.react(player,'celebrate');else if((state.phase as string)==='event'||state.journal[0]?.text.includes('gold'))scene.react(player,'magic');
  busy = false;
  persist();
  update();
  if (state.phase === "won") showVictory();
  else toast(state.journal[0].text);
}
function showVictory() {
  const winner = state.players[state.winner!],
    c = CHARACTERS.find((c) => c.id === winner.character)!;
  sound("magic");
  openModal(
    "victory",
    modalHeader("YOUR LEGEND BEGINS", `${c.name} has arrived.`, false) +
      `<div class="victory-art">${icon("crown")}<span>✧</span><span>✧</span></div><p class="encounter-text">Through every twist, every mystery, and every leap of faith, you found your way to ${theme.regions[3]}.</p><div class="victory-stats"><div><strong>${state.turn}</strong><span>Turns traveled</span></div><div><strong>${winner.gold}</strong><span>Gold found</span></div><div><strong>${winner.clues}</strong><span>Clues collected</span></div></div><button class="primary-button" data-action="victory-maps">${icon("map")}Find your next adventure</button><button class="text-button" data-action="view-board">Stay a little longer</button>`,
  );
}
function showSettings() {
  openModal(
    "settings",
    modalHeader("MAKE YOURSELF AT HOME", "Expedition settings") +
      `<label class="settings-label">Graphics quality<select id="quality-setting"><option value="low" ${scene.quality === "low" ? "selected" : ""}>Low · lighter rendering</option><option value="medium" ${scene.quality === "medium" ? "selected" : ""}>Medium · balanced</option><option value="ultra" ${scene.quality === "ultra" ? "selected" : ""}>Ultra · cinematic</option></select></label><label class="toggle-setting"><span><strong>Run between tiles</strong><small>A quicker pace for your adventure</small></span><input type="checkbox" id="run-setting" ${runMovement ? "checked" : ""}></label><div class="sidebar-rule"></div><label class="settings-label">Traveling party<select id="party-setting">${[1, 2, 3, 4].map((n) => `<option value="${n}" ${state.players.length === n ? "selected" : ""}>${n === 1 ? "Solo expedition" : `${n} players · local pass-and-play`}</option>`).join("")}</select></label><p class="modal-note">Party size applies when you start a new expedition. Each player can choose a different character on their turn.</p><button class="secondary-button full-width" data-action="confirm-restart">${icon("rotate-ccw")}Start a new expedition</button><p class="modal-note">Your current game is saved on this browser automatically.</p>`,
  );
}
function showHelp() {
  openModal(
    "help",
    modalHeader(
      "A SMALL GUIDE TO A BIG ADVENTURE",
      "Let curiosity lead the way.",
    ) +
      `<div class="help-steps"><div><span>01</span><div><h3>Choose your wanderer</h3><p>Open your character card to meet the 12 adventurers. Rotate the preview, try their actions, and select your favorite.</p></div></div><div><span>02</span><div><h3>Follow the path</h3><p>Roll a six-sided die and travel along 93 tiles through four rising regions. Reach the final tile to win; an exact roll is not required.</p></div></div><div><span>03</span><div><h3>Expect the unexpected</h3><p>Mysteries offer choices. Treasure gives 3 gold. Fortune gives 2 gold and a clue. Portals move you 3 extra tiles. Extra movement ends safely without triggering another encounter.</p></div></div><div><span>04</span><div><h3>Make it your adventure</h3><p>Explore ten worlds, or set up 2–4 local players in settings. Take turns on this device. The first to the destination wins. Gold and clues record the stories you discover.</p></div></div></div><div class="keyboard-guide"><span><kbd>SPACE</kbd> Roll</span><span><kbd>F</kbd> Find hero</span><span><kbd>R</kbd> Reset view</span><span><kbd>ESC</kbd> Close</span></div><p class="modal-note">Drag the world to orbit. Scroll or pinch to zoom. Right-drag to pan. Sound is optional. <a href="/ASSET-CREDITS.md" target="_blank" rel="noopener">3D asset credits</a>.</p>`,
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
  scene.onTile = (id) => {
    const tip = $("tile-tooltip");
    if (id === null || busy) {
      tip.hidden = true;
      return;
    }
    const t = getTiles(state.map)[id];
    tip.innerHTML = `<span style="color:${TILE_INFO[t.kind].color}">${TILE_INFO[t.kind].icon}</span><div><strong>${t.kind === "finish" ? theme.regions[3] : t.kind === "start" ? theme.regions[0] : TILE_INFO[t.kind].label}</strong><small>Tile ${id + 1} · ${t.kind === "finish" ? "The end of this path. The beginning of your legend." : TILE_INFO[t.kind].description}</small></div>`;
    tip.hidden = false;
  };
}
app.addEventListener("click", async (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("button");
  if (!el || el.hasAttribute("disabled")) return;
  const action = el.dataset.action;
  if (action === "journey") {
    document.querySelector(".game-shell")!.classList.toggle("journey-open");
  } else if (action === "roll") void doRoll();
  else if (action === "characters") showCharacters();
  else if (action === "maps") showMaps();
  else if (action === "settings") showSettings();
  else if (action === "help") showHelp();
  else if (action === "journal") showJournal();
  else if (action === "close-modal") closeModal();
  else if (action === "focus") scene.focusPlayer();
  else if (action === "zoom-in") scene.zoom(0.85);
  else if (action === "zoom-out") scene.zoom(1.18);
  else if (action === "reset-camera") scene.resetCamera();
  else if (action === "sound") {
    muted = !muted;
    el.innerHTML = icon(muted ? "volume-x" : "volume-2");
    el.setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
    sound("magic");
    refreshIcons();
    toast(
      muted
        ? "Sound is off. A quieter kind of adventure."
        : "Sound is on. Let the magic ring.",
    );
  } else if (action === "prev-character" || action === "next-character") {
    selected = (selected + (action === "next-character" ? 1 : 11)) % 12;
    updateCharacter();
  } else if (action === "select-character") {
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
  } else if (el.dataset.map) confirmMap(el.dataset.map);
  else if (el.dataset.startMap) void startMap(el.dataset.startMap);
  else if (el.dataset.choice !== undefined)
    void resolveChoice(Number(el.dataset.choice));
  else if (el.dataset.restart)
    void startMap(theme.id, Number(el.dataset.restart));
});
app.addEventListener("change", (e) => {
  const el = e.target as HTMLInputElement;
  if (el.id === "quality-setting") {
    scene.setQuality(el.value as Quality);
    toast(`Graphics set to ${el.value}.`);
  }
  if (el.id === "run-setting") runMovement = el.checked;
});
dialog.addEventListener("close", () => {
  if (scene) scene.paused = false;
});
dialog.addEventListener("cancel", (e) => {
  if (modalType === "encounter" || modalType === "victory") e.preventDefault();
  else {
    preview?.dispose();
    preview = null;
    mapPreview?.dispose();
    mapPreview = null;
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
    dialog.open
  )
    return;
  if (e.code === "Space") {
    e.preventDefault();
    void doRoll();
  }
  if (e.key.toLowerCase() === "f") scene.focusPlayer();
  if (e.key.toLowerCase() === "r") scene.resetCamera();
});
window.addEventListener("beforeunload", persist);
update();
refreshIcons();
document
  .querySelector<HTMLElement>(".world-area")!
  .style.setProperty("--world-bg", theme.sky);
try {
  scene = new GameScene($("viewport"), theme);
  attachScene();
  update();
  void scene.setPlayers(state.players, state.active).then(() => {
    $("scene-loading").hidden = true;
  });
  if (state.dice) showDice(state.dice);
  if (state.phase === "event") showEncounter();
} catch (err) {
  console.error(err);
  $("scene-loading").innerHTML =
    `<div><h2>Your browser couldn’t open the 3D world.</h2><p>Enable WebGL and hardware acceleration, then refresh to continue.</p><button class="secondary-button" onclick="location.reload()">Try again</button></div>`;
}
