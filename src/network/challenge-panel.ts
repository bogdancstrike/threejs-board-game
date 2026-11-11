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
  private path: number[] = [];
  private ingredients: number[] = [];
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
      this.path = [card.start || 0];
      this.ingredients = [];
      this.lastBeat = -1;
    }
    const i = this.ui.icon,
      e = this.ui.escape,
      owner = this.client.myTurn,
      player = room.game.players[room.game.active];
    let content = "";
    if (card.type === "count" || card.type === "pattern")
      content += `<div class="challenge-symbols ${card.type}">${card.symbols!.map((s) => `<span>${e(s)}</span>`).join("")}</div>`;
    if (card.type === "maze") {
      content += `<div class="maze-grid">${Array.from({ length: 25 }, (_, cell) => `<button data-challenge-action="maze" data-choice="${cell}" class="maze-cell ${card.walls!.includes(cell) ? "wall" : ""} ${cell === 0 ? "visited" : ""}" ${!owner || card.walls!.includes(cell) ? "disabled" : ""}>${cell === 0 ? "●" : cell === 24 ? "✦" : "·"}</button>`).join("")}</div><button class="text-button" data-challenge-action="reset" ${owner ? "" : "disabled"}>Reset path</button>`;
    }
    if (card.type === "alchemy")
      content += `<div id="alchemy-progress" class="alchemy-progress">0 / 3 ingredients · total 0 / 10</div><button class="text-button" data-challenge-action="reset" ${owner ? "" : "disabled"}>Empty the cauldron</button>`;
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
        `<p class="challenge-prompt">${e(card.prompt)}</p>${card.sourceTitle ? `<p class="trial-source">${e(card.sourceTitle)} · ${e(card.failure || "No penalty.")}</p>` : ""}${content}<div class="challenge-footer"><span id="challenge-clock"></span><span>Success: +${card.rewardPoints || 50} points · +${card.rewardGold || 2} gold</span></div><button class="text-button" data-challenge-action="skip" ${owner ? "" : "disabled"}>${owner ? (card.context && ["dragon", "hazard", "curse"].includes(card.context) ? "Forfeit trial · stated setback applies" : "Pass this challenge · no penalty") : e(player.name) + " is playing. Watch their progress."}</button>`,
    );
    this.tick();
  }
  openRoad() {
    this.stop();
    const room = this.client.room,
      card = room?.game.road;
    if (!room || !card) return;
    const owner = this.client.myTurn,
      e = this.ui.escape,
      p = room.game.players[room.game.active];
    if (card.partyCard) {
      this.openPartyCard();
      return;
    }
    this.ui.open(
      "road",
      this.ui.header(
        `${card.kind.toUpperCase()} · ${e(p.name)}’S TURN`,
        card.title,
        false,
      ) +
        `<div class="road-encounter-art ${card.kind}">${this.ui.icon(card.icon)}<span>✧</span></div><p class="challenge-prompt">${e(card.description)}</p>${card.dare ? `<blockquote class="dare-prompt">${e(card.dare)}</blockquote>` : ""}<div class="road-choices">${card.choices.map((c) => `<button data-challenge-action="road" data-choice="${c.key}" ${!owner || (c.key === "pay" && p.gold < 3) || (c.key === "clue" && p.clues < 1) ? "disabled" : ""}><strong>${e(c.label)}</strong><small>${e(c.detail)}</small></button>`).join("")}</div><p class="modal-note">${owner ? "Read each outcome before choosing. Setbacks affect only the game; gold and points never drop below zero." : e(p.name) + " is choosing. Everyone will see the outcome."}</p>`,
    );
  }
  /** A party card is the whole point of the dialog: the prompt is the hero. */
  private openPartyCard() {
    const room = this.client.room!,
      road = room.game.road!,
      card = road.partyCard!,
      owner = this.client.myTurn,
      e = this.ui.escape,
      i = this.ui.icon,
      p = room.game.players[room.game.active];
    const level = card.level,
      labels: Record<string, string> = {
        dare: "Done it",
        alternative: "Did the board-game version",
        leave: "Pass",
      };
    this.ui.open(
      "road",
      `<div class="party-card" data-level="${level}"><div class="party-card-top"><span class="party-card-level">${e(level.toUpperCase())}</span><span>${e(p.name)}’s card</span><span class="party-card-category">${e(card.category)}</span></div><p class="party-card-text">${e(road.description)}</p><div class="party-card-bottom"><span>${e(card.title)}</span><span id="party-card-clock"></span></div></div><div class="party-card-actions">${road.choices
        .map(
          (c) =>
            `<button class="${c.key === "dare" ? "primary-button" : c.key === "leave" ? "text-button" : "secondary-button"}" data-challenge-action="road" data-choice="${c.key}" ${owner ? "" : "disabled"}>${c.key === "dare" ? i("check") : c.key === "alternative" ? i("dices") : ""}<span>${labels[c.key] || e(c.label)}</span>${c.key !== "leave" ? `<small>+${card.points} pts · +${card.gold} gold</small>` : ""}</button>`,
        )
        .join(
          "",
        )}</div><details class="card-alternative"><summary>Board-game version</summary><p>${e(card.alternative)}</p></details>${owner ? "" : `<p class="modal-note party-card-wait">${e(p.name)} is playing this card.</p>`}`,
    );
    this.roadClock(road.deadline);
  }
  private roadTimer = 0;
  private roadClock(deadline: number) {
    clearInterval(this.roadTimer);
    const draw = () => {
      const el = document.getElementById("party-card-clock");
      if (!el) return clearInterval(this.roadTimer);
      const left = Math.max(
        0,
        Math.ceil((deadline - Date.now() - this.client.clockOffset) / 1000),
      );
      el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    };
    draw();
    this.roadTimer = window.setInterval(draw, 500);
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
    if (!card && kind !== "road") return;
    try {
      this.sending = true;
      if (kind === "road") {
        await this.client.command("RESOLVE_ROAD", { choice });
        return;
      }
      if (!card) return;
      if (kind === "reset") {
        this.path = [card.start || 0];
        this.ingredients = [];
        document
          .querySelectorAll<HTMLElement>(".maze-cell")
          .forEach((el, i) => el.classList.toggle("visited", i === 0));
        const progress = document.getElementById("alchemy-progress");
        if (progress) progress.textContent = "0 / 3 ingredients · total 0 / 10";
      } else if (kind === "maze") {
        const cell = Number(choice),
          last = this.path[this.path.length - 1];
        if (
          Math.abs(Math.floor(cell / 5) - Math.floor(last / 5)) +
            Math.abs((cell % 5) - (last % 5)) !==
          1
        ) {
          this.ui.toast("Choose a square beside your current path.");
          return;
        }
        if (this.path.length >= 30) {
          this.ui.toast("Reset and try a shorter route.");
          return;
        }
        this.path.push(cell);
        document
          .querySelector(
            `[data-challenge-action="maze"][data-choice="${cell}"]`,
          )
          ?.classList.add("visited");
        if (cell === card.goal)
          await this.client.command("SUBMIT_CHALLENGE", { answer: this.path });
      } else if (kind === "skip") await this.client.command("SKIP_CHALLENGE");
      else if (kind === "balance")
        await this.client.command("SUBMIT_CHALLENGE");
      else if (kind === "rhythm")
        await this.client.command(
          (card.taps?.length || 0) >= 4 ? "SUBMIT_CHALLENGE" : "CHALLENGE_TAP",
        );
      else if (kind === "choice") {
        if (card.type === "alchemy") {
          this.ingredients.push(Number(choice));
          const total = this.ingredients.reduce(
            (sum, n) => sum + card.values![n],
            0,
          );
          const progress = document.getElementById("alchemy-progress");
          if (progress)
            progress.textContent = `${this.ingredients.length} / 3 ingredients · total ${total} / 10`;
          if (this.ingredients.length === 3)
            await this.client.command("SUBMIT_CHALLENGE", {
              answer: this.ingredients,
            });
        } else if (card.type === "memory") {
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
    clearInterval(this.roadTimer);
  }
}
