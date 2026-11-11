import { test, expect } from "./fixtures";
test("two browsers share unique heroes, turns, points and reconnect", async ({
  browser,
}) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  for (const context of [hostContext, guestContext])
    await context.addInitScript(() =>
      localStorage.setItem(
        "wilder-display-v1",
        JSON.stringify({ quality: "low", run: true }),
      ),
    );
  const host = await hostContext.newPage(),
    guest = await guestContext.newPage();
  for (const page of [host, guest])
    page.on("pageerror", (e) => errors.push(e.message));
  await Promise.all([host.goto("/"), guest.goto("/")]);
  for (const page of [host, guest])
    await page.locator('[data-menu-action="classic"]').click();
  for (const page of [host, guest])
    await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 60000 });
  await host.locator('[data-action="rooms"]').click();
  await host.locator("#online-player-name").fill("Ada");
  await host.locator("#room-play-style").selectOption("online");
  await host.locator("#room-challenges").uncheck();
  await host.locator('[data-room-action="create"]').click();
  await expect(host.locator(".lobby-room-code strong")).toBeVisible();
  const code = await host.locator(".lobby-room-code strong").innerText();
  await guest.locator('[data-action="rooms"]').click();
  await guest.locator("#online-player-name").fill("Grace");
  await guest.locator("#room-code").fill(code);
  await guest.locator('[data-room-action="join"]').click();
  await expect(host.locator(".lobby-player")).toHaveCount(2);
  await expect(guest.locator(".lobby-player")).toHaveCount(2);
  await guest.locator('[data-room-action="character"]').click();
  await guest.locator('[data-character="0"]').click();
  await expect(guest.locator("#select-character")).toBeDisabled();
  await expect(guest.locator("#select-character")).toContainText("Claimed");
  await guest.locator('[data-character="2"]').click();
  await guest.locator("#select-character").click();
  await expect(host.locator(".lobby-player").nth(1)).toContainText("Rhea");
  for (const page of [host, guest])
    await page.locator('[data-room-action="ready"]').click();
  await expect(host.locator('[data-room-action="start"]')).toBeEnabled();
  await host.locator('[data-room-action="start"]').click();
  await expect(host.locator("#modal")).not.toBeVisible();
  await expect(guest.locator("#modal")).not.toBeVisible();
  await expect(host.locator("#roll-button")).toBeEnabled();
  await expect(guest.locator("#roll-button")).toBeDisabled();
  await host.locator("#roll-button").click();
  await expect(
    host.locator(".party-score-row").first().locator("b"),
  ).not.toHaveText(/^0PTS$/);
  await expect
    .poll(
      async () =>
        (await guest.locator("#roll-button").isEnabled()) ||
        (await host.locator('[data-choice="1"]').isVisible()),
      { timeout: 45000 },
    )
    .toBe(true);
  if (await host.locator('[data-choice="1"]').isVisible())
    await host.locator('[data-choice="1"]').click();
  await expect(guest.locator("#roll-button")).toBeEnabled({ timeout: 45000 });
  await expect(host.locator("#roll-button")).toBeDisabled();
  const hostScore = await host
    .locator(".party-score-row")
    .first()
    .locator("b")
    .textContent();
  await expect(
    guest.locator(".party-score-row").first().locator("b"),
  ).toHaveText(hostScore!);
  await guest.reload();
  await guest.locator('[data-menu-action="continue"]').click();
  await expect(guest.locator("#roll-button")).toBeEnabled({ timeout: 60000 });
  await expect(
    guest.locator(".party-score-row").first().locator("b"),
  ).toHaveText(hostScore!);
  // Finish a full classic race through the public authenticated command API.
  // Both browser clients remain connected and resume the committed finish screen.
  for (const page of [host, guest])
    await page.locator('[data-action="main-menu"]').click();
  const sessions = await Promise.all(
    [host, guest].map((page) =>
      page.evaluate(() => JSON.parse(localStorage.getItem("wilder-room-v1")!)),
    ),
  );
  const winner = await host.evaluate(async (sessions) => {
    const url = "/api/v1/rooms/" + sessions[0].roomId;
    let { room } = await (
      await fetch(url, {
        headers: { Authorization: "Bearer " + sessions[0].token },
      })
    ).json();
    for (let turn = 0; turn < 500 && room.phase !== "finished"; turn++) {
      const player = room.game.players[room.game.active];
      const session = sessions.find((s) => s.playerId === player.id)!;
      const type = room.game.phase === "event" ? "CHOOSE" : "ROLL_DIE";
      const response = await fetch(url + "/commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.token,
        },
        body: JSON.stringify({
          type,
          payload: type === "CHOOSE" ? { index: 1 } : {},
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
    if (room.phase !== "finished") throw Error("Classic race did not finish");
    return room.game.players[room.game.winner].name;
  }, sessions);
  for (const page of [host, guest]) {
    await page.locator('[data-menu-action="continue"]').click();
    await expect(page.locator(".modal-header h2")).toHaveText(
      winner + " wins the expedition.",
    );
  }
  await host.locator('[data-action="rooms"]').last().click();
  await host.locator('[data-room-action="rematch"]').click();
  await expect(host.locator('[data-room-action="start"]')).toBeDisabled();
  await expect(guest.locator(".lobby-ready").first()).toContainText("Choosing");
  expect(errors).toEqual([]);
  await hostContext.close();
  await guestContext.close();
});
