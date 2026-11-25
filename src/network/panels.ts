import { difficultySettings, describeDifficulty } from "../ui/difficulty";
import type { Difficulty } from "../game/decks";
import { MAPS } from "../game/maps";
import { CHARACTERS } from "../game/data";
import { readProfile } from "../settings/preferences";
import type { RealtimeClient } from "./client";
import { t } from "../i18n";
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
        t("net.roomEyebrow"),
        t("net.roomIntro"),
      ) +
        `<div class="room-intro">${i("users")}<p>${t("net.roomBlurb")}</p></div><label class="settings-label">${t("net.playerName")}<input id="online-player-name" class="text-input" maxlength="24" autocomplete="nickname" placeholder="${t("net.namePlaceholder")}" value="${this.ui.escape(savedName)}"/></label><label class="settings-label">${t("net.howPlay")}<select id="room-play-style"><option value="hotseat">${t("net.playHere")}</option><option value="online">${t("net.playOnline")}</option></select></label><div id="hotseat-setup"><label class="settings-label">${t("net.playersHere")}<select id="hotseat-count">${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<option value="${n}" ${n === profile.partySize ? "selected" : ""}>${n === 1 ? t("net.soloAdventure") : t("net.playersTurns", { count: n })}</option>`).join("")}</select></label><div id="hotseat-names"></div></div><div class="room-form-grid"><section><h3>${t("net.createTitle")}</h3><label class="settings-label">${t("net.chooseWorld")}<select id="room-world">${MAPS.map((m) => `<option value="${m.id}" ${m.id === (options?.map || this.ui.map()) ? "selected" : ""}>${m.name}</option>`).join("")}</select></label><button class="text-button" data-room-action="random-world">${t("net.suggestWorld")}</button><div id="setup-world-preview" class="setup-world-preview"></div><label class="settings-label">${t("net.victoryRules")}<select id="room-mode"><option value="classic">${t("net.classicRules")}</option><option value="score" ${profile.mode === "score" ? "selected" : ""}>${t("net.scoreRules")}</option></select></label>${difficultySettings(profile.difficulty)}<label class="room-checkbox"><input type="checkbox" id="room-challenges" ${profile.challenges ? "checked" : ""}/> ${t("net.challengesLabel")}</label><button class="primary-button full-width" data-room-action="create">${i("compass")}${t("net.createRoom")}</button></section><section><h3>${t("net.joinTitle")}</h3><p class="modal-note">${t("net.joinNote")}</p><label class="settings-label">${t("net.roomCode")}<input id="room-code" class="text-input room-code-input" maxlength="6" autocomplete="off" placeholder="ABC234" value="${this.ui.escape(code)}"/></label><button class="secondary-button full-width" data-room-action="join">${i("arrow-up-right")}${t("net.joinExpedition")}</button><div class="room-tech-note"><span class="live-dot"></span>${t("net.liveNote")}</div></section></div><p id="room-error" class="room-error" role="alert"></p><p class="modal-note">${t("net.footerNote")}</p>`,
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
          `<label class="settings-label">${t("net.playerN", { n: i + 2 })}<input class="text-input hotseat-name" maxlength="24" value="${t("net.playerN", { n: i + 2 })}" aria-label="${t("net.nameAria", { n: i + 2 })}"/></label>`,
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
    target.innerHTML = `<img src="/previews/${map.id}.webp" alt="${t("net.previewAlt", { name: map.name })}"/><div><strong>${map.name}</strong><span>${map.tagline}</span></div>`;
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
        t("lobby.roomTitle", { code: room.code, count: room.game.players.length }),
        room.phase === "lobby"
          ? room.hotseat
            ? t("lobby.oneDevice")
            : t("lobby.gather")
          : t("lobby.underway"),
      ) +
        `<div class="lobby-toolbar"><div class="lobby-room-code"><span>${t("lobby.invite")}</span><strong>${room.code}</strong><button class="icon-button" data-room-action="copy" aria-label="${t("lobby.copyLink")}">${i("arrow-up-right")}</button></div><div class="connection-badge ${status}"><span></span>${status === "online" ? t("lobby.live") : status === "connecting" ? t("lobby.connecting") : t("lobby.reconnecting")}</div></div><div class="lobby-roster">${room.game.players
          .map((p) => {
            const c = CHARACTERS.find((c) => c.id === p.character)!;
            return `<div class="lobby-player ${p.id === me ? "is-you" : ""}" style="--hero-color:${c.color}"><div class="lobby-avatar">${i(["knight", "paladin", "valkyrie"].includes(c.role) ? "shield" : "wand-sparkles")}</div><div class="lobby-player-info"><strong>${e(p.name)} ${p.id === me ? `<span>${t("lobby.you")}</span>` : ""} ${p.id === room.hostId ? `<span>${t("lobby.host")}</span>` : ""}</strong><small>${c.name} · ${c.title.replace("The ", "")}</small></div><span class="lobby-ready ${p.ready ? "ready" : ""}">${i(p.ready ? "check" : "circle")}${room.phase === "lobby" ? (p.ready ? t("lobby.ready") : t("lobby.choosing")) : t("lobby.pts", { points: p.points ?? 0 })}</span>${p.id === me || room.hotseat ? `<button class="secondary-button" data-room-player="${p.id}" data-room-action="character">${i("users")}${t("lobby.character")}</button>` : ""}</div>`;
          })
          .join(
            "",
          )}</div><div class="lobby-world"><div><span class="eyebrow">${t("lobby.yourWorld").toUpperCase()}</span><strong>${MAPS.find((m) => m.id === room.game.map)!.name}</strong></div><span>${room.mode === "score" ? t("lobby.highestScore") : t("lobby.firstFinish")} · ${room.challenges ? t("lobby.challengesOn") : t("lobby.storyOnly")}</span></div>${difficultySettings(room.difficulty || "soft", true, !host || room.phase === "finished")}<p class="lobby-hint">${i("check-check")} ${t("lobby.claimHint")}</p><div class="lobby-actions"><button class="text-button" data-room-action="leave">${t("lobby.leave")}</button>${room.phase === "lobby" ? `<button class="secondary-button" data-room-action="ready">${i(own.ready ? "rotate-ccw" : "check")}${room.hotseat ? (allReady ? t("lobby.partyNotReady") : t("lobby.readyParty")) : own.ready ? t("lobby.notReadyYet") : t("lobby.imReady")}</button>${host ? `<button class="primary-button" data-room-action="start" ${allReady ? "" : "disabled"}>${i("flag")}${t("lobby.beginExpedition")}</button>` : `<span class="modal-note">${t("lobby.hostWillStart")}</span>`}` : `${host && room.phase === "finished" ? `<button class="primary-button" data-room-action="rematch">${i("rotate-ccw")}${t("lobby.playAgain")}</button>` : `<button class="primary-button" data-action="close-modal">${t("lobby.returnBoard")}</button>`}`}</div><p id="room-error" class="room-error" role="alert"></p>`,
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
          throw new Error(t("net.nameFirst"));
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
          this.ui.toast(t("net.copied"));
        } catch {
          this.ui.toast(
            t("net.shareCode", { code: this.client.room!.code }),
          );
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("net.couldNotReach");
      const target = document.getElementById("room-error");
      if (target) target.textContent = message;
      else this.ui.toast(message);
    } finally {
      this.submitting = false;
    }
  }
}
