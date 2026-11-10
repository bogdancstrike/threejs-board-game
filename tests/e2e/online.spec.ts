import { test, expect } from "@playwright/test";
test("two browsers share unique heroes, turns, points and reconnect", async ({
  browser,
}) => {
  test.setTimeout(180000);
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
  await expect(guest.locator("#roll-button")).toBeEnabled({ timeout: 60000 });
  await expect(
    guest.locator(".party-score-row").first().locator("b"),
  ).toHaveText(hostScore!);
  expect(errors).toEqual([]);
  await hostContext.close();
  await guestContext.close();
});
