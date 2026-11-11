import { difficultySettings, describeDifficulty } from "../ui/difficulty";
import type { Difficulty } from "../game/decks";
import { MAPS } from "../game/maps";
import { CHARACTERS } from "../game/data";
import { readProfile } from "../settings/preferences";
import type { RealtimeClient } from "./client";
interface UI {
  icon: (name: string) => string;
  escape: (text: string) => string;
  open: (type: string, html: string, wide?: boolean) => void;
  header: (eyebrow: string, title: string) => string;
  toast: (message: string) => void;
  characters: (index?: number) => void;
  leave: () => void;
  map: () => string;
}
export class RoomPanels {
  private submitting = false;
  constructor(
    public client: RealtimeClient,
    private ui: UI,
    root: HTMLElement,
  ) {
    root.addEventListener("change", (event) => {
      const el = event.target as HTMLSelectElement;
      if (el.id === "room-difficulty" || el.id === "lobby-difficulty") {
        describeDifficulty(el.value);
        if (el.id === "lobby-difficulty")
          void this.client
            .command("SET_DIFFICULTY", { difficulty: el.value })
            .catch((error) => this.ui.toast(error.message));
      }
      if (el.id === "room-world") this.worldPreview();
    });
    root.addEventListener("click", (e) => {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-room-action]",
      );
      if (button && !button.disabled)
        void this.action(button.dataset.roomAction!, button.dataset.roomPlayer);
    });
  }
  open(options?: { newGame?: boolean; map?: string }) {
    if (this.client.room && !options?.newGame) {
      this.lobby();
      return;
    }
    const i = this.ui.icon,
      profile = readProfile(),
      savedName = profile.name,
      code = new URLSearchParams(location.search).get("room") || "";
    this.ui.open(
      "rooms",
      this.ui.header(
        "BRING A LITTLE COMPANY",
        "An adventure is better together.",
      ) +
        `<div class="room-intro">${i("users")}<p>Create a persistent room or join your friends. Each player brings a name, a unique hero, and a little courage.</p></div><label class="settings-label">Your player name<input id="online-player-name" class="text-input" maxlength="24" autocomplete="nickname" placeholder="What should the island call you?" value="${this.ui.escape(savedName)}"/></label><label class="settings-label">How will you play?<select id="room-play-style"><option value="hotseat">On this device · solo or pass-and-play</option><option value="online">Online · everyone on their own device</option></select></label><div id="hotseat-setup"><label class="settings-label">Players on this device<select id="hotseat-count">${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<option value="${n}" ${n === profile.partySize ? "selected" : ""}>${n === 1 ? "Solo adventure" : n + " players · take turns"}</option>`).join("")}</select></label><div id="hotseat-names"></div></div><div class="room-form-grid"><section><h3>Create an expedition</h3><label class="settings-label">Choose your world<select id="room-world">${MAPS.map((m) => `<option value="${m.id}" ${m.id === (options?.map || this.ui.map()) ? "selected" : ""}>${m.name}</option>`).join("")}</select></label><button class="text-button" data-room-action="random-world">✧ Suggest another random world</button><div id="setup-world-preview" class="setup-world-preview"></div><label class="settings-label">Victory rules<select id="room-mode"><option value="classic">Classic race · first to finish</option><option value="score" ${profile.mode === "score" ? "selected" : ""}>Score expedition · highest points</option></select></label>${difficultySettings(profile.difficulty)}<label class="room-checkbox"><input type="checkbox" id="room-challenges" ${profile.challenges ? "checked" : ""}/> Road adventures · dangers, dares & mini-games</label><button class="primary-button full-width" data-room-action="create">${i("compass")}Create a room</button></section><section><h3>Join your friends</h3><p class="modal-note">Ask your host for the six-character room code. You can reconnect to your saved room from this browser.</p><label class="settings-label">Room code<input id="room-code" class="text-input room-code-input" maxlength="6" autocomplete="off" placeholder="ABC234" value="${this.ui.escape(code)}"/></label><button class="secondary-button full-width" data-room-action="join">${i("arrow-up-right")}Join expedition</button><div class="room-tech-note"><span class="live-dot"></span>Live turns · Shared scores · Saved progress</div></section></div><p id="room-error" class="room-error" role="alert"></p><p class="modal-note">1–8 players on one device or across browsers. This mode uses the running game server to save your party. Offline Classic is available directly on the board.</p>`,
      true,
    );
    describeDifficulty(profile.difficulty);
    this.worldPreview();
    const style = document.getElementById(
      "room-play-style",
    ) as HTMLSelectElement;
    const count = document.getElementById("hotseat-count") as HTMLSelectElement;
    style.onchange = () => {
      document.getElementById("hotseat-setup")!.hidden =
        style.value !== "hotseat";
    };
    const renderNames = () => {
      document.getElementById("hotseat-names")!.innerHTML = Array.from(
        { length: Number(count.value) - 1 },
        (_, i) =>
          `<label class="settings-label">Player ${i + 2}<input class="text-input hotseat-name" maxlength="24" value="Player ${i + 2}" aria-label="Player ${i + 2} name"/></label>`,
      ).join("");
    };
    count.onchange = renderNames;
    renderNames();
  }
  private worldPreview() {
    const select = document.getElementById(
      "room-world",
    ) as HTMLSelectElement | null;
    const target = document.getElementById("setup-world-preview");
    if (!select || !target) return;
    const map = MAPS.find((m) => m.id === select.value)!;
    target.innerHTML = `<img src="/previews/${map.id}.webp" alt="Preview of ${map.name}"/><div><strong>${map.name}</strong><span>${map.tagline}</span></div>`;
  }
  lobby() {
    const room = this.client.room;
    if (!room) return;
    const i = this.ui.icon,
      e = this.ui.escape,
      me = this.client.session!.playerId,
      host = this.client.isHost,
      allReady = room.game.players.every((p) => p.ready),
      own = room.game.players.find((p) => p.id === me)!,
      status = this.client.status;
    this.ui.open(
      "lobby",
      this.ui.header(
        `ROOM ${room.code} · ${room.game.players.length}/8 ADVENTURERS`,
        room.phase === "lobby"
          ? room.hotseat
            ? "One device. A whole party."
            : "Gather your party."
          : "Your expedition is underway.",
      ) +
        `<div class="lobby-toolbar"><div class="lobby-room-code"><span>INVITE YOUR FRIENDS</span><strong>${room.code}</strong><button class="icon-button" data-room-action="copy" aria-label="Copy invitation link">${i("arrow-up-right")}</button></div><div class="connection-badge ${status}"><span></span>${status === "online" ? "LIVE · CONNECTED" : status === "connecting" ? "CONNECTING…" : "RECONNECTING…"}</div></div><div class="lobby-roster">${room.game.players
          .map((p) => {
            const c = CHARACTERS.find((c) => c.id === p.character)!;
            return `<div class="lobby-player ${p.id === me ? "is-you" : ""}" style="--hero-color:${c.color}"><div class="lobby-avatar">${i(["knight", "paladin", "valkyrie"].includes(c.role) ? "shield" : "wand-sparkles")}</div><div class="lobby-player-info"><strong>${e(p.name)} ${p.id === me ? "<span>YOU</span>" : ""} ${p.id === room.hostId ? "<span>HOST</span>" : ""}</strong><small>${c.name} · ${c.title.replace("The ", "")}</small></div><span class="lobby-ready ${p.ready ? "ready" : ""}">${i(p.ready ? "check" : "circle")}${room.phase === "lobby" ? (p.ready ? "Ready" : "Choosing") : `${p.points} pts`}</span>${p.id === me || room.hotseat ? `<button class="secondary-button" data-room-player="${p.id}" data-room-action="character">${i("users")}Character</button>` : ""}</div>`;
          })
          .join(
            "",
          )}</div><div class="lobby-world"><div><span class="eyebrow">YOUR WORLD</span><strong>${MAPS.find((m) => m.id === room.game.map)!.name}</strong></div><span>${room.mode === "score" ? "Highest score after the finishing round" : "First adventurer to the finish"} · ${room.challenges ? "Challenges on" : "Story only"}</span></div>${difficultySettings(room.difficulty || "soft", true, !host || room.phase === "finished")}<p class="lobby-hint">${i("check-check")} Each hero can be claimed by one player. Picks and readiness update for everyone in real time.</p><div class="lobby-actions"><button class="text-button" data-room-action="leave">Leave this room</button>${room.phase === "lobby" ? `<button class="secondary-button" data-room-action="ready">${i(own.ready ? "rotate-ccw" : "check")}${room.hotseat ? (allReady ? "Party not ready" : "Ready the party") : own.ready ? "Not ready yet" : "I’m ready"}</button>${host ? `<button class="primary-button" data-room-action="start" ${allReady ? "" : "disabled"}>${i("flag")}Begin expedition</button>` : '<span class="modal-note">The host will start when everyone is ready.</span>'}` : `${host && room.phase === "finished" ? `<button class="primary-button" data-room-action="rematch">${i("rotate-ccw")}Play again</button>` : '<button class="primary-button" data-action="close-modal">Return to the board</button>'}`}</div><p id="room-error" class="room-error" role="alert"></p>`,
      true,
    );
    describeDifficulty(room.difficulty || "soft");
  }
  private async action(action: string, playerId?: string) {
    if (this.submitting) return;
    const input = (id: string) =>
      (document.getElementById(id) as HTMLInputElement)?.value;
    const error = document.getElementById("room-error");
    try {
      this.submitting = true;
      if (error) error.textContent = "";
      if (action === "random-world") {
        const select = document.getElementById(
          "room-world",
        ) as HTMLSelectElement;
        const choices = MAPS.filter((m) => m.id !== select.value);
        select.value = choices[Math.floor(Math.random() * choices.length)].id;
        this.worldPreview();
      } else if (action === "create" || action === "join") {
        const name = input("online-player-name")?.trim();
        if (!name)
          throw new Error("Tell your fellow travelers your name first.");
        localStorage.setItem("wilder-player-name", name);
        if (action === "create")
          await this.client.create(
            name,
            input("room-world"),
            input("room-mode") as "classic" | "score",
            (document.getElementById("room-challenges") as HTMLInputElement)
              .checked,
            input("room-play-style") === "hotseat",
            input("room-play-style") === "hotseat"
              ? Array.from(
                  document.querySelectorAll<HTMLInputElement>(".hotseat-name"),
                ).map((el) => el.value.trim())
              : [],
            input("room-difficulty") as Difficulty,
          );
        else await this.client.join(input("room-code"), name);
        this.lobby();
      } else if (action === "ready") {
        const room = this.client.room!;
        const ready = room.hotseat
          ? !room.game.players.every((p) => p.ready)
          : !room.game.players[this.client.myIndex].ready;
        for (const p of room.hotseat
          ? room.game.players
          : [room.game.players[this.client.myIndex]])
          await this.client.command("SET_READY", {
            ready,
            ...(room.hotseat ? { playerId: p.id } : {}),
          });
      } else if (action === "start") await this.client.command("START_GAME");
      else if (action === "character")
        this.ui.characters(
          this.client.room!.game.players.findIndex((p) => p.id === playerId),
        );
      else if (action === "rematch")
        await this.client.command("REQUEST_REMATCH");
      else if (action === "leave") {
        this.client.disconnect();
        this.ui.leave();
      } else if (action === "copy") {
        const url = new URL(location.href);
        url.searchParams.set("room", this.client.room!.code);
        try {
          await navigator.clipboard.writeText(url.href);
          this.ui.toast("Invitation link copied.");
        } catch {
          this.ui.toast(
            `Share room code ${this.client.room!.code} with your friends.`,
          );
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not reach the game server.";
      const target = document.getElementById("room-error");
      if (target) target.textContent = message;
      else this.ui.toast(message);
    } finally {
      this.submitting = false;
    }
  }
}
