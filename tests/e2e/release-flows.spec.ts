import { test, expect } from "./fixtures";

test("offline rules finish a full party; restored encounters, victory and restart work through the UI", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto("/scripts/preview-stage.html");
  const completed = await page.evaluate(async () => {
    const path = "/src/game/engine.ts";
    const e = await import(path);
    const state = e.newGame(4);
    for (let n = 0; n < 1000 && state.phase !== "won"; n++) {
      if (state.phase === "event") e.choose(state, 1);
      else e.roll(state, 3, n % 6);
    }
    if (state.phase !== "won" || state.players[state.winner].position !== 92)
      throw Error("Full party did not finish");
    const corruptions = [
      null,
      "{",
      JSON.stringify({ ...state, active: 8 }),
      JSON.stringify({ ...state, phase: "road" }),
      JSON.stringify({ ...state, dice: 9 }),
      JSON.stringify({ ...state, winner: 9 }),
      JSON.stringify({ ...state, mystery: 1 }),
      JSON.stringify({ ...state, journal: [{ text: 3, turn: 1 }] }),
    ];
    if (corruptions.some((s) => e.parseSave(s) !== null))
      throw Error("Corrupt save accepted");
    const pending = e.newGame();
    e.roll(pending, 4, 0);
    e.saveGame(pending);
    localStorage.setItem(
      "wilder-display-v1",
      JSON.stringify({ quality: "low", run: true }),
    );
    return state;
  });
  expect(completed.phase).toBe("won");
  await page.goto("/");
  await page.locator('[data-menu-action="continue"]').click();
  await expect(page.locator(".encounter-choices")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".encounter-choices")).toBeVisible();
  await page.locator('[data-choice="1"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled({ timeout: 30000 });
  await page.locator('[data-action="journey"]').click();
  await page.locator('[data-action="journal"]').click();
  await expect(page.locator(".full-journal")).toContainText("TURN");
  await page.keyboard.press("Escape");
  for (const action of [
    "focus",
    "zoom-in",
    "zoom-out",
    "reset-camera",
    "sound",
    "sound",
  ])
    await page.locator(`[data-action="${action}"]`).click();
  await page.locator('[data-action="characters"]').first().click();
  await page.locator('[data-action="prev-character"]').click();
  for (const view of ["face", "upper", "equipment", "full"]) {
    await page.locator(`[data-view="${view}"]`).click();
    await page.waitForTimeout(650);
  }
  for (const action of ["rest", "magic", "run"])
    await page.locator(`[data-animation="${action}"]`).click();
  await page.locator("[data-tint]").last().click();
  await page.locator("#select-character").click();
  await expect(page.locator("#roll-button")).toBeEnabled();
  await page.locator('[data-action="maps"]').first().click();
  await page.locator("#world-search").fill("Dragonkind");
  await expect(page.locator("#world-result-count")).toHaveText("1 world");
  await page.locator('[data-map="dragonkind"]').click();
  await expect(page.locator("#map-preview-loading")).toBeHidden({
    timeout: 45000,
  });
  await page.locator('[data-action="preview-map-reset"]').click();
  await page.keyboard.press("Escape");
  await page.locator('[data-action="settings"]').click();
  for (const q of ["ultra", "medium", "low"])
    await page.locator("#quality-setting").selectOption(q);
  await page.locator("#run-setting").uncheck();
  await page.locator("#party-setting").selectOption("4");
  await page.locator('[data-action="confirm-restart"]').click();
  await page.locator('[data-restart="4"]').click();
  await expect(page.locator(".party-score-row")).toHaveCount(4);
  await expect(page.locator("#roll-button")).toBeEnabled();
  // Resume a real completed rules-engine save and check the finish screen's actions.
  await page.evaluate(
    (s) => localStorage.setItem("wilder-expedition-v1", JSON.stringify(s)),
    completed,
  );
  // beforeunload normally persists the current board; install the imported save after it.
  await page.addInitScript(
    (s) => localStorage.setItem("wilder-expedition-v1", JSON.stringify(s)),
    completed,
  );
  await page.reload();
  await page.locator('[data-menu-action="continue"]').click();
  await expect(page.locator(".victory-standings")).toBeVisible();
  await page.locator('[data-action="view-board"]').click();
  await expect(page.locator("#roll-button")).toBeDisabled();
  await page.locator(".brand").click();
  await page.locator('[data-menu-action="continue"]').click();
  await page.locator('[data-action="victory-maps"]').click();
  await expect(page.locator(".map-card")).toHaveCount(37);
});

test("a complete server score expedition persists, declares a winner and rematches", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      "wilder-display-v1",
      JSON.stringify({ quality: "low", run: true }),
    ),
  );
  await page.goto("/");
  await page.locator('[data-menu-action="new"]').click();
  await page.locator('[data-room-action="create"]').click();
  await expect(page.locator("#room-error")).toContainText("name");
  await page.locator("#online-player-name").fill("Finisher");
  await page.locator("#hotseat-count").selectOption("2");
  await page.locator("#room-mode").selectOption("score");
  await page.locator('[data-room-action="create"]').click();
  await expect(page.locator(".lobby-player")).toHaveCount(2);
  await page.locator('[data-room-action="copy"]').click();
  await page.locator('[data-room-action="ready"]').click();
  await page.locator('[data-room-action="start"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled();
  // Exercise the same authenticated command contract for every turn while the
  // title screen is open, then resume the final snapshot and rematch in the UI.
  await page.locator('[data-action="main-menu"]').click();
  const finish = await page.evaluate(async () => {
    const session = JSON.parse(localStorage.getItem("wilder-room-v1")!);
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + session.token,
    };
    const url = "/api/v1/rooms/" + session.roomId;
    let { room } = await (await fetch(url, { headers })).json();
    const seen = new Set<string>();
    for (let n = 0; n < 800 && room.phase !== "finished"; n++) {
      const phase = room.game.phase;
      seen.add(phase);
      let type = "ROLL_DIE",
        payload: any = {};
      if (phase === "event") {
        type = "CHOOSE";
        payload = { index: 1 };
      }
      if (phase === "road") {
        type = "RESOLVE_ROAD";
        payload = {
          choice:
            room.game.road.choices.find((c: any) =>
              ["leave", "pass", "rest", "decline", "detour"].includes(c.key),
            )?.key || room.game.road.choices.at(-1).key,
        };
      }
      if (phase === "challenge") type = "SKIP_CHALLENGE";
      const response = await fetch(url + "/commands", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type,
          payload,
          expected_version: room.revision,
          idempotency_key: crypto.randomUUID(),
        }),
      });
      const result = await response.json();
      if (response.status === 429) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      if (!response.ok) throw Error(JSON.stringify(result));
      room = result.room;
    }
    if (room.phase !== "finished") throw Error("Game did not reach finish");
    return {
      phase: room.phase,
      turn: room.game.turn,
      winner: room.game.players[room.game.winner].name,
      scores: room.game.players.map((p: any) => p.points),
      seen: [...seen],
    };
  });
  expect(finish.phase).toBe("finished");
  expect(finish.turn).toBeGreaterThan(10);
  expect(finish.seen).toContain("road");
  await page.locator('[data-menu-action="continue"]').click();
  await expect(page.locator(".modal-header h2")).toHaveText(
    finish.winner + " wins the expedition.",
  );
  await expect(page.locator(".victory-standings > div")).toHaveCount(2);
  await page.locator('[data-action="rooms"]').last().click();
  await page.locator('[data-room-action="rematch"]').click();
  await expect(page.locator('[data-room-action="start"]')).toBeDisabled();
  await expect(page.locator(".lobby-ready").first()).toContainText("Choosing");
  await page.locator('[data-room-action="leave"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled();
  expect(
    await page.evaluate(() => localStorage.getItem("wilder-room-v1")),
  ).toBeNull();
  expect(errors).toEqual([]);
});
