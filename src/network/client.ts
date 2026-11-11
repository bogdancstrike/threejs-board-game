import type { Difficulty } from "../game/decks";
import type { RoadStop } from "../game/road";
import { CHARACTERS } from "../game/data";
import type { GameState } from "../game/engine";
export interface OnlinePlayer {
  id: string;
  name: string;
  character: string;
  position: number;
  gold: number;
  clues: number;
  points: number;
  completed: number;
  ready: boolean;
  connected: boolean;
  tint: string;
}
export interface Challenge {
  id: string;
  type:
    | "riddle"
    | "count"
    | "memory"
    | "pattern"
    | "balance"
    | "rhythm"
    | "math"
    | "oddone"
    | "maze"
    | "alchemy";
  size?: number;
  walls?: number[];
  start?: number;
  goal?: number;
  values?: number[];
  targetSum?: number;
  context?: string;
  sourceTitle?: string;
  rewardPoints?: number;
  rewardGold?: number;
  failure?: string;
  title: string;
  prompt: string;
  options: string[];
  symbols?: string[];
  sequence?: string[];
  revealUntil?: number;
  startedAt: number;
  deadline: number;
  target?: { min: number; max: number };
  period?: number;
  taps?: number[];
  beat?: number;
}
export interface PartyCard {
  id: string;
  level: Difficulty;
  category: string;
  title: string;
  prompt: string;
  solo: string;
  alternative: string;
  seconds: number;
  points: number;
  gold: number;
}
export interface CardMechanic {
  id: string;
  name: string;
  icon: string;
  rules: string;
}
export interface RoadCard extends RoadStop {
  partyCard?: PartyCard;
  mechanic?: CardMechanic;
  /** "choose" before a card is revealed, "card" with a card, "result" for a wheel outcome. */
  stage?: "choose" | "card" | "result";
  banner?: string;
  multiplier?: number;
  wheel?: { segments: string[]; result: number };
  sourceTitle?: string;
  choices: { key: string; label: string; detail: string }[];
  dare?: string;
  deadline: number;
}
export interface Room {
  difficulty?: Difficulty;
  /** Per-game random layout of roadside stops and mini-game tiles. */
  layout?: { stops: number[]; minigames: number[] };
  hotseat?: boolean;
  id: string;
  code: string;
  hostId: string;
  phase: "lobby" | "playing" | "finished";
  mode: "classic" | "score";
  challenges: boolean;
  revision: number;
  eventSeq: number;
  turnDeadline: number | null;
  finishing: boolean;
  game: GameState & {
    players: OnlinePlayer[];
    challenge: Challenge | null;
    road: RoadCard | null;
  };
}
export interface RoomUpdate {
  type?: string;
  room: Room;
  event?: {
    type: string;
    seq: number;
    payload: {
      route?: number[];
      playerIndex?: number;
      dice?: number;
      success?: boolean;
      rewardPoints?: number;
      rewardGold?: number;
      challengeTitle?: string;
      skipped?: boolean;
      timedOut?: boolean;
      solution?: string;
      given?: string;
    };
  };
  commandId?: string;
  serverTime: number;
}
interface Session {
  roomId: string;
  playerId: string;
  token: string;
}
export type ConnectionStatus = "offline" | "connecting" | "online";
export class RealtimeClient {
  room: Room | null = null;
  session: Session | null = null;
  status: ConnectionStatus = "offline";
  clockOffset = 0;
  private socket: WebSocket | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private retry: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  private generation = 0;
  private pending = new Map<
    string,
    {
      resolve: (result: RoomUpdate) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  constructor(
    private onUpdate: (update: RoomUpdate) => void,
    private onStatus: (status: ConnectionStatus) => void,
    private onError: (message: string) => void,
  ) {}
  get myIndex() {
    return (
      this.room?.game.players.findIndex(
        (p) => p.id === this.session?.playerId,
      ) ?? -1
    );
  }
  get isHost() {
    return Boolean(this.session && this.room?.hostId === this.session.playerId);
  }
  get myTurn() {
    return Boolean(
      this.room?.phase === "playing" &&
        (this.room.hotseat
          ? this.isHost
          : this.room.game.active === this.myIndex),
    );
  }
  get connected() {
    return this.status === "online";
  }
  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.onStatus(status);
  }
  private async request<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch("/api/v1" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.session
          ? { Authorization: "Bearer " + this.session.token }
          : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = await response.json().catch(() => ({
      error: { message: "The game server could not be reached." },
    }));
    if (!response.ok)
      throw new Error(
        data.error?.message ||
          data.detail?.[0]?.msg ||
          "The game server rejected this action.",
      );
    return data;
  }
  async create(
    name: string,
    map: string,
    mode: "classic" | "score",
    challenges = true,
    hotseat = false,
    players: string[] = [],
    difficulty: Difficulty = "soft",
  ) {
    const result = await this.request<{
      room: Room;
      playerId: string;
      token: string;
      serverTime: number;
    }>("/rooms", { name, map, mode, challenges, hotseat, players, difficulty });
    this.adopt(result);
  }
  async join(code: string, name: string) {
    const result = await this.request<{
      room: Room;
      playerId: string;
      token: string;
      serverTime: number;
    }>("/rooms/" + encodeURIComponent(code.trim().toUpperCase()) + "/join", {
      name,
    });
    this.adopt(result);
  }
  private adopt(result: {
    room: Room;
    playerId: string;
    token: string;
    serverTime: number;
  }) {
    this.disconnect(false);
    this.session = {
      roomId: result.room.id,
      playerId: result.playerId,
      token: result.token,
    };
    try {
      localStorage.setItem("wilder-room-v1", JSON.stringify(this.session));
    } catch {}
    this.accept({
      room: result.room,
      serverTime: result.serverTime,
      type: "SNAPSHOT",
    });
    void this.connect();
  }
  async restore() {
    try {
      const raw = localStorage.getItem("wilder-room-v1");
      if (!raw) return;
      const session = JSON.parse(raw);
      if (
        typeof session.roomId !== "string" ||
        typeof session.playerId !== "string" ||
        typeof session.token !== "string"
      )
        throw new Error("Invalid session");
      this.session = session;
      const result = await this.request<RoomUpdate>("/rooms/" + session.roomId);
      this.accept({ ...result, type: "SNAPSHOT" });
      await this.connect();
    } catch {
      this.disconnect(true);
      this.onError(
        "Your previous room session is unavailable. You can create or join a new expedition.",
      );
    }
  }
  private accept(update: RoomUpdate) {
    const room = update.room;
    if (
      !room ||
      typeof room.id !== "string" ||
      !Array.isArray(room.game?.players) ||
      room.game.players.length > 8 ||
      !Number.isInteger(room.revision) ||
      !room.game.players.every(
        (p) =>
          typeof p.id === "string" &&
          typeof p.name === "string" &&
          CHARACTERS.some((c) => c.id === p.character),
      )
    )
      return;
    if (
      this.room &&
      room.id === this.room.id &&
      room.revision < this.room.revision
    )
      return;
    if (
      this.room &&
      room.id === this.room.id &&
      room.revision === this.room.revision &&
      update.event?.type !== "PRESENCE" &&
      update.type !== "SNAPSHOT"
    )
      return;
    this.clockOffset = update.serverTime - Date.now();
    this.room = room;
    this.onUpdate(update);
  }
  private async connect() {
    if (!this.session) return;
    const gen = ++this.generation;
    this.setStatus("connecting");
    try {
      const { ticket } = await this.request<{ ticket: string }>(
        "/rooms/" + this.session.roomId + "/ticket",
        {},
      );
      if (gen !== this.generation) return;
      const url = new URL(
        `/api/v1/rooms/${this.session.roomId}/ws`,
        location.href,
      );
      url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
      url.searchParams.set("ticket", ticket);
      const socket = new WebSocket(url);
      this.socket = socket;
      socket.onopen = () => {
        if (gen !== this.generation) {
          socket.close();
          return;
        }
        this.retryCount = 0;
        this.setStatus("online");
        this.heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN)
            socket.send(JSON.stringify({ type: "PING" }));
        }, 20000);
      };
      socket.onmessage = (event) => {
        let message: any;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === "PONG") return;
        if (message.type === "REJECTED") {
          const request = this.pending.get(message.commandId);
          if (request) {
            clearTimeout(request.timer);
            this.pending.delete(message.commandId);
            request.reject(
              new Error(message.error?.message || "Action rejected."),
            );
          }
          if (message.error?.code === "version_mismatch") void this.refresh();
          return;
        }
        if (message.room) this.accept(message);
        if (message.type === "ACK" && message.commandId) {
          const request = this.pending.get(message.commandId);
          if (request) {
            clearTimeout(request.timer);
            this.pending.delete(message.commandId);
            request.resolve(message);
          }
        }
      };
      socket.onclose = () => {
        if (gen !== this.generation) return;
        if (this.heartbeat) clearInterval(this.heartbeat);
        this.setStatus("offline");
        this.scheduleReconnect();
      };
      socket.onerror = () => socket.close();
    } catch {
      if (gen === this.generation) {
        this.setStatus("offline");
        this.scheduleReconnect();
      }
    }
  }
  private scheduleReconnect() {
    if (!this.session) return;
    if (this.retry) clearTimeout(this.retry);
    this.retry = setTimeout(
      () => {
        void this.connect();
      },
      Math.min(15000, 800 * 2 ** this.retryCount++),
    );
  }
  async refresh() {
    if (!this.session) return;
    const result = await this.request<RoomUpdate>(
      "/rooms/" + this.session.roomId,
    );
    this.accept({ ...result, type: "SNAPSHOT" });
  }
  async command(
    type: string,
    payload: Record<string, unknown> = {},
  ): Promise<RoomUpdate> {
    if (!this.session || !this.room)
      throw new Error("Join an expedition first.");
    const command = {
      type,
      payload,
      expected_version: this.room.revision,
      idempotency_key: crypto.randomUUID(),
    };
    const fallback = async () => {
      const result = await this.request<RoomUpdate>(
        "/rooms/" + this.session!.roomId + "/commands",
        command,
      );
      this.accept(result);
      return result;
    };
    if (this.socket?.readyState !== WebSocket.OPEN) return fallback();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(command.idempotency_key);
        void fallback().then(resolve, reject);
      }, 10000);
      this.pending.set(command.idempotency_key, { resolve, reject, timer });
      this.socket!.send(JSON.stringify(command));
    });
  }
  disconnect(clearSession = true) {
    this.generation++;
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.retry) clearTimeout(this.retry);
    this.socket?.close();
    this.socket = null;
    for (const p of this.pending.values()) {
      clearTimeout(p.timer);
      p.reject(new Error("You left the room."));
    }
    this.pending.clear();
    if (clearSession) {
      this.session = null;
      this.room = null;
      try {
        localStorage.removeItem("wilder-room-v1");
      } catch {}
    }
    this.setStatus("offline");
  }
}
