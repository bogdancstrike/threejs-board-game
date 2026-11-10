import { getMap, MAPS } from "./maps";
import {
  CHARACTERS,
  MYSTERIES,
  getTiles,
  TILE_INFO,
  type Mystery,
} from "./data";
export interface Player {
  id?: string;
  points?: number;
  completed?: number;
  ready?: boolean;
  connected?: boolean;
  name: string;
  character: string;
  position: number;
  gold: number;
  clues: number;
  tint: string;
}
export interface JournalEntry {
  text: string;
  turn: number;
}
export interface GameState {
  version: 1;
  map: string;
  players: Player[];
  active: number;
  turn: number;
  phase: "ready" | "event" | "won" | "challenge";
  mystery: number | null;
  dice: number;
  journal: JournalEntry[];
  winner: number | null;
}
export const SAVE_KEY = "wilder-expedition-v1";
export function newGame(
  count = 1,
  character = "lyra",
  map = "verdant",
): GameState {
  return {
    version: 1,
    map,
    players: Array.from(
      { length: Math.max(1, Math.min(4, count)) },
      (_, i) => ({
        name: i === 0 ? "You" : `Player ${i + 1}`,
        character: i === 0 ? character : CHARACTERS[(i * 3) % 12].id,
        position: 0,
        gold: 0,
        clues: 0,
        tint: ["#cbb17a", "#90c7ba", "#c49adc", "#e89783"][i],
      }),
    ),
    active: 0,
    turn: 1,
    phase: "ready",
    mystery: null,
    dice: 0,
    journal: [
      { text: `Your expedition begins in ${getMap(map).regions[0]}.`, turn: 1 },
    ],
    winner: null,
  };
}
export function log(state: GameState, text: string) {
  state.journal.unshift({ text, turn: state.turn });
  state.journal = state.journal.slice(0, 50);
}
export function checkVictory(state: GameState) {
  if (state.players[state.active].position === 92) {
    state.phase = "won";
    state.winner = state.active;
    log(
      state,
      `${CHARACTERS.find((c) => c.id === state.players[state.active].character)!.name} reached ${getMap(state.map).regions[3]}!`,
    );
    return true;
  }
  return false;
}
export function endTurn(state: GameState) {
  state.mystery = null;
  if (checkVictory(state)) return;
  state.active = (state.active + 1) % state.players.length;
  state.turn++;
  state.phase = "ready";
}
export function roll(
  state: GameState,
  dice: number,
  mysteryIndex: number,
): number[] {
  if (state.phase !== "ready") throw new Error("Finish your encounter first.");
  if (!Number.isInteger(dice) || dice < 1 || dice > 6)
    throw new Error("Invalid dice roll.");
  state.dice = dice;
  const p = state.players[state.active];
  const old = p.position;
  p.position = Math.min(92, p.position + dice);
  const route = Array.from({ length: p.position - old }, (_, i) => old + i + 1);
  log(
    state,
    `${CHARACTERS.find((c) => c.id === p.character)!.name} rolled ${dice} and reached tile ${p.position + 1}.`,
  );
  if (checkVictory(state)) return route;
  const tile = getTiles(state.map)[p.position];
  if (tile.kind === "mystery") {
    state.phase = "event";
    state.mystery =
      Math.abs(Math.floor(mysteryIndex)) % mysteries(state).length;
  } else {
    if (tile.kind === "treasure") {
      p.gold += 3;
      log(state, "A forgotten treasure! Collected 3 gold.");
    }
    if (tile.kind === "fortune") {
      p.gold += 2;
      p.clues++;
      log(state, "Fortune smiles: 2 gold and a new clue.");
    }
    if (tile.kind === "portal") {
      const from = p.position;
      p.position = Math.min(92, p.position + 3);
      for (let i = from + 1; i <= p.position; i++) route.push(i);
      log(state, "The ancient portal carries you 3 tiles forward.");
    }
    if (tile.kind === "path") log(state, TILE_INFO.path.description);
    endTurn(state);
  }
  return route;
}
export function mysteries(state: GameState) {
  const own = getMap(state.map).encounters;
  return own.length ? own : MYSTERIES;
}
export function currentMystery(state: GameState): Mystery | null {
  return state.mystery === null ? null : mysteries(state)[state.mystery];
}
export function choose(state: GameState, index: number): number[] {
  const event = currentMystery(state);
  if (state.phase !== "event" || !event || !event.choices[index])
    throw new Error("No such choice.");
  const choice = event.choices[index];
  const p = state.players[state.active];
  if (p.gold + choice.gold < 0) throw new Error("Not enough gold.");
  p.gold += choice.gold;
  p.clues += choice.clues;
  const old = p.position;
  p.position = Math.max(0, Math.min(92, p.position + choice.move));
  const dir = Math.sign(p.position - old);
  const route = Array.from(
    { length: Math.abs(p.position - old) },
    (_, i) => old + (i + 1) * dir,
  );
  log(state, `${event.title}: ${choice.label.toLowerCase()}.`);
  endTurn(state);
  return route;
}
export function saveGame(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* Private browsing/storage quota: game remains playable. */
  }
}
export function parseSave(raw: string | null): GameState | null {
  try {
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    if (
      s.version !== 1 ||
      !MAPS.some((m) => m.id === s.map) ||
      !Array.isArray(s.players) ||
      s.players.length < 1 ||
      s.players.length > 4
    )
      return null;
    if (
      !Number.isInteger(s.active) ||
      s.active < 0 ||
      s.active >= s.players.length ||
      !Number.isInteger(s.turn) ||
      s.turn < 1
    )
      return null;
    if (
      !["ready", "event", "won"].includes(s.phase) ||
      !Array.isArray(s.journal) ||
      s.journal.some(
        (e) => typeof e.text !== "string" || !Number.isInteger(e.turn),
      )
    )
      return null;
    if (!Number.isInteger(s.dice) || s.dice < 0 || s.dice > 6) return null;
    if (
      s.phase === "event" &&
      (!Number.isInteger(s.mystery) || !mysteries(s)[s.mystery!])
    )
      return null;
    if (s.phase !== "event" && s.mystery !== null) return null;
    if (
      s.phase === "won" &&
      (!Number.isInteger(s.winner) ||
        s.winner! < 0 ||
        s.winner! >= s.players.length ||
        s.players[s.winner!].position !== 92)
    )
      return null;
    for (const p of s.players)
      if (
        !CHARACTERS.some((c) => c.id === p.character) ||
        !Number.isInteger(p.position) ||
        p.position < 0 ||
        p.position > 92 ||
        !Number.isInteger(p.gold) ||
        p.gold < 0 ||
        !Number.isInteger(p.clues) ||
        p.clues < 0 ||
        typeof p.name !== "string" ||
        !/^#[0-9a-f]{6}$/i.test(p.tint)
      )
        return null;
    return s;
  } catch {
    return null;
  }
}

export function playerScore(player: Player) {
  return (
    player.points ?? player.position + player.gold * 10 + player.clues * 20
  );
}
