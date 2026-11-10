import type { RealtimeClient, Challenge } from "./client";
interface UI {
  icon: (name: string) => string;
  escape: (text: string) => string;
  open: (type: string, html: string, wide?: boolean) => void;
  header: (eyebrow: string, title: string, close?: boolean) => string;
  toast: (message: string) => void;
  sound: () => void;
}
export class ChallengePanel {
  private frame = 0;
  private selected: string[] = [];
  private cardId = "";
  private sending = false;
  private lastBeat = -1;
  constructor(
    private client: RealtimeClient,
    private ui: UI,
    root: HTMLElement,
  ) {
    root.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-challenge-action]",
      );
      if (button && !button.disabled)
        void this.action(
          button.dataset.challengeAction!,
          button.dataset.choice,
        );
    });
  }
  open() {
    const room = this.client.room,
      card = room?.game.challenge;
    if (!room || !card) return;
    this.stop();
    if (card.id !== this.cardId) {
      this.selected = [];
      this.cardId = card.id;
      this.lastBeat = -1;
    }
    const i = this.ui.icon,
      e = this.ui.escape,
      owner = this.client.myTurn,
      player = room.game.players[room.game.active];
    let content = "";
    if (card.type === "count" || card.type === "pattern")
      content += `<div class="challenge-symbols ${card.type}">${card.symbols!.map((s) => `<span>${e(s)}</span>`).join("")}</div>`;
    if (card.type === "memory")
      content +=
        '<div id="memory-display" class="challenge-symbols memory"></div>';
    if (card.type === "balance")
      content += `<div class="balance-track"><span class="balance-target" style="left:${card.target!.min}%;width:${card.target!.max - card.target!.min}%"></span><span id="balance-marker"></span></div><button class="primary-button full-width" data-challenge-action="balance" ${owner ? "" : "disabled"}>${i("crosshair")}Stop the lantern</button>`;
    if (card.type === "rhythm")
      content += `<div id="rhythm-beat" class="rhythm-beat">${i("sparkles")}</div><p id="rhythm-progress" class="modal-note">0 / 4 beats</p><button class="primary-button full-width" data-challenge-action="rhythm" ${owner ? "" : "disabled"}>${i("sparkles")}Tap the beat</button>`;
    if (card.options.length)
      content += `<div class="challenge-options">${card.options.map((option, index) => `<button data-challenge-action="choice" data-choice="${index}" ${owner ? "" : "disabled"}>${e(option)}</button>`).join("")}</div>`;
    this.ui.open(
      "challenge",
      this.ui.header(
        `SKILL CHALLENGE · ${e(player.name)}’S TURN`,
        card.title,
        false,
      ) +
        `<p class="challenge-prompt">${e(card.prompt)}</p>${content}<div class="challenge-footer"><span id="challenge-clock"></span><span>Success: +50 points · +2 gold</span></div><button class="text-button" data-challenge-action="skip" ${owner ? "" : "disabled"}>${owner ? "Pass this challenge · no penalty" : e(player.name) + " is playing. Watch their progress."}</button>`,
    );
    this.tick();
  }
  private card(): Challenge | null {
    return this.client.room?.game.challenge || null;
  }
  private tick = () => {
    this.frame = requestAnimationFrame(this.tick);
    const card = this.card();
    if (!card) return;
    const now = Date.now() + this.client.clockOffset,
      clock = document.getElementById("challenge-clock");
    if (clock)
      clock.textContent =
        Math.max(0, Math.ceil((card.deadline - now) / 1000)) + "s remaining";
    if (card.type === "memory") {
      const display = document.getElementById("memory-display");
      if (display)
        display.innerHTML = (
          now < (card.revealUntil || 0)
            ? card.sequence!
            : Array.from({ length: 4 }, (_, i) => this.selected[i] || "·")
        )
          .map((s) => "<span>" + this.ui.escape(s) + "</span>")
          .join("");
    }
    if (card.type === "balance") {
      const marker = document.getElementById("balance-marker");
      const phase =
        ((now - card.startedAt) % (card.period || 2400)) /
        (card.period || 2400);
      if (marker) marker.style.left = (1 - Math.abs(phase * 2 - 1)) * 100 + "%";
    }
    if (card.type === "rhythm") {
      const beat = card.beat || 700,
        age = now - card.startedAt,
        currentBeat = Math.floor(age / beat);
      document
        .getElementById("rhythm-beat")
        ?.classList.toggle("lit", age % beat < 160);
      const progress = document.getElementById("rhythm-progress");
      if (progress)
        progress.textContent = (card.taps?.length || 0) + " / 4 beats";
      const button = document.querySelector<HTMLButtonElement>(
        '[data-challenge-action="rhythm"]',
      );
      if (button)
        button.textContent =
          (card.taps?.length || 0) >= 4 ? "Finish rhythm" : "Tap the beat";
      if (currentBeat !== this.lastBeat) {
        this.lastBeat = currentBeat;
        this.ui.sound();
      }
    }
  };
  private async action(kind: string, choice?: string) {
    if (!this.client.myTurn || this.sending) return;
    const card = this.card();
    if (!card) return;
    try {
      this.sending = true;
      if (kind === "skip") await this.client.command("SKIP_CHALLENGE");
      else if (kind === "balance")
        await this.client.command("SUBMIT_CHALLENGE");
      else if (kind === "rhythm")
        await this.client.command(
          (card.taps?.length || 0) >= 4 ? "SUBMIT_CHALLENGE" : "CHALLENGE_TAP",
        );
      else if (kind === "choice") {
        if (card.type === "memory") {
          if (Date.now() + this.client.clockOffset < (card.revealUntil || 0))
            return;
          this.selected.push(card.options[Number(choice)]);
          if (this.selected.length === 4)
            await this.client.command("SUBMIT_CHALLENGE", {
              answer: this.selected,
            });
        } else
          await this.client.command("SUBMIT_CHALLENGE", {
            answer: Number(choice),
          });
      }
    } catch (error) {
      this.ui.toast(
        error instanceof Error
          ? error.message
          : "Could not submit your challenge.",
      );
    } finally {
      this.sending = false;
    }
  }
  stop() {
    cancelAnimationFrame(this.frame);
  }
}
