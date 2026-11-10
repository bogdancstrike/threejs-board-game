import { MAPS } from "../game/maps";
import { CHARACTERS } from "../game/data";
import type { RealtimeClient } from "./client";
interface UI {
  icon: (name: string) => string;
  escape: (text: string) => string;
  open: (type: string, html: string, wide?: boolean) => void;
  header: (eyebrow: string, title: string) => string;
  toast: (message: string) => void;
  characters: () => void;
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
    root.addEventListener("click", (e) => {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-room-action]",
      );
      if (button && !button.disabled)
        void this.action(button.dataset.roomAction!);
    });
  }
  open() {
    if (this.client.room) {
      this.lobby();
      return;
    }
    const i = this.ui.icon,
      savedName = localStorage.getItem("wilder-player-name") || "",
      code = new URLSearchParams(location.search).get("room") || "";
    this.ui.open(
      "rooms",
      this.ui.header(
        "BRING A LITTLE COMPANY",
        "An adventure is better together.",
      ) +
        `<div class="room-intro">${i("users")}<p>Create a persistent room or join your friends. Each player brings a name, a unique hero, and a little courage.</p></div><label class="settings-label">Your player name<input id="online-player-name" class="text-input" maxlength="24" autocomplete="nickname" placeholder="What should the island call you?" value="${this.ui.escape(savedName)}"/></label><div class="room-form-grid"><section><h3>Create an expedition</h3><label class="settings-label">Choose your world<select id="room-world">${MAPS.map((m) => `<option value="${m.id}" ${m.id === this.ui.map() ? "selected" : ""}>${m.name}</option>`).join("")}</select></label><label class="settings-label">Victory rules<select id="room-mode"><option value="classic">Classic race · first to finish</option><option value="score">Score expedition · highest points</option></select></label><label class="room-checkbox"><input type="checkbox" id="room-challenges" checked/> Include skill challenges</label><button class="primary-button full-width" data-room-action="create">${i("compass")}Create a room</button></section><section><h3>Join your friends</h3><p class="modal-note">Ask your host for the six-character room code. You can reconnect to your saved room from this browser.</p><label class="settings-label">Room code<input id="room-code" class="text-input room-code-input" maxlength="6" autocomplete="off" placeholder="ABC234" value="${this.ui.escape(code)}"/></label><button class="secondary-button full-width" data-room-action="join">${i("arrow-up-right")}Join expedition</button><div class="room-tech-note"><span class="live-dot"></span>Live turns · Shared scores · Saved progress</div></section></div><p id="room-error" class="room-error" role="alert"></p><p class="modal-note">2–8 players across browsers. One player can also start a solo online expedition. Your local save stays separate.</p>`,
      true,
    );
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
          ? "Gather your party."
          : "Your expedition is underway.",
      ) +
        `<div class="lobby-toolbar"><div class="lobby-room-code"><span>INVITE YOUR FRIENDS</span><strong>${room.code}</strong><button class="icon-button" data-room-action="copy" aria-label="Copy invitation link">${i("arrow-up-right")}</button></div><div class="connection-badge ${status}"><span></span>${status === "online" ? "LIVE · CONNECTED" : status === "connecting" ? "CONNECTING…" : "RECONNECTING…"}</div></div><div class="lobby-roster">${room.game.players
          .map((p) => {
            const c = CHARACTERS.find((c) => c.id === p.character)!;
            return `<div class="lobby-player ${p.id === me ? "is-you" : ""}" style="--hero-color:${c.color}"><div class="lobby-avatar">${i(["knight", "paladin", "valkyrie"].includes(c.role) ? "shield" : "wand-sparkles")}</div><div class="lobby-player-info"><strong>${e(p.name)} ${p.id === me ? "<span>YOU</span>" : ""} ${p.id === room.hostId ? "<span>HOST</span>" : ""}</strong><small>${c.name} · ${c.title.replace("The ", "")}</small></div><span class="lobby-ready ${p.ready ? "ready" : ""}">${i(p.ready ? "check" : "circle")}${room.phase === "lobby" ? (p.ready ? "Ready" : "Choosing") : `${p.points} pts`}</span>${p.id === me ? `<button class="secondary-button" data-room-action="character">${i("users")}Character</button>` : ""}</div>`;
          })
          .join(
            "",
          )}</div><div class="lobby-world"><div><span class="eyebrow">YOUR WORLD</span><strong>${MAPS.find((m) => m.id === room.game.map)!.name}</strong></div><span>${room.mode === "score" ? "Highest score after the finishing round" : "First adventurer to the finish"} · ${room.challenges ? "Challenges on" : "Story only"}</span></div><p class="lobby-hint">${i("check-check")} Each hero can be claimed by one player. Picks and readiness update for everyone in real time.</p><div class="lobby-actions"><button class="text-button" data-room-action="leave">Leave this room</button>${room.phase === "lobby" ? `<button class="secondary-button" data-room-action="ready">${i(own.ready ? "rotate-ccw" : "check")}${own.ready ? "Not ready yet" : "I’m ready"}</button>${host ? `<button class="primary-button" data-room-action="start" ${allReady ? "" : "disabled"}>${i("flag")}Begin expedition</button>` : '<span class="modal-note">The host will start when everyone is ready.</span>'}` : `${host && room.phase === "finished" ? `<button class="primary-button" data-room-action="rematch">${i("rotate-ccw")}Play again</button>` : '<button class="primary-button" data-action="close-modal">Return to the board</button>'}`}</div><p id="room-error" class="room-error" role="alert"></p>`,
      true,
    );
  }
  private async action(action: string) {
    if (this.submitting) return;
    const input = (id: string) =>
      (document.getElementById(id) as HTMLInputElement)?.value;
    const error = document.getElementById("room-error");
    try {
      this.submitting = true;
      if (error) error.textContent = "";
      if (action === "create" || action === "join") {
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
          );
        else await this.client.join(input("room-code"), name);
        this.lobby();
      } else if (action === "ready")
        await this.client.command("SET_READY", {
          ready: !this.client.room!.game.players[this.client.myIndex].ready,
        });
      else if (action === "start") await this.client.command("START_GAME");
      else if (action === "character") this.ui.characters();
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
