import { test, expect } from "./fixtures";
test("title screen opens settings, previews worlds, starts solo and continues saved play", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      "wilder-display-v1",
      JSON.stringify({ quality: "low", run: true }),
    ),
  );
  await page.goto("/");
  await expect(page.locator("#start-menu")).toBeVisible();
  await expect(page.locator('[data-menu-action="continue"]')).toBeDisabled();
  await page.locator('[data-menu-action="settings"]').last().click();
  await page.locator("#quality-setting").selectOption("low");
  await page.locator('[data-action="close-modal"]').click();
  await expect(page.locator("#start-menu")).toBeVisible();
  await page.locator('[data-menu-action="help"]').click();
  await expect(page.locator("#modal-content")).toContainText(
    "dragon guardians",
  );
  await page.keyboard.press("Escape");
  const suggestion = await page.locator("#menu-world-name").textContent();
  await page.locator('[data-menu-action="next"]').click();
  await expect(page.locator("#menu-world-name")).not.toHaveText(suggestion!);
  await page.locator('[data-menu-action="previous"]').click();
  await expect(page.locator("#menu-world-name")).toHaveText(suggestion!);
  await page.locator('[data-menu-action="world"]').click();
  await expect(page.locator("#map-preview-loading")).toBeHidden({
    timeout: 45000,
  });
  await page.locator('[data-action="new-game-setup"]').click();
  await page.locator("#online-player-name").fill("Solo Explorer");
  await page.locator('[data-room-action="create"]').click();
  await expect(page.locator("#start-menu")).toBeHidden();
  await expect(page.locator(".lobby-player")).toHaveCount(1);
  await page.locator('[data-room-action="ready"]').click();
  await page.locator('[data-room-action="start"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled();
  await page.locator('[data-action="main-menu"]').click();
  await expect(page.locator("#start-menu")).toBeVisible();
  await expect(page.locator('[data-menu-action="continue"]')).toBeEnabled();
  await page.locator('[data-menu-action="continue"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled();
  await page.reload();
  await expect(page.locator("#start-menu")).toBeVisible();
  await page.locator('[data-menu-action="continue"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled({ timeout: 45000 });
  expect(errors).toEqual([]);
});
test("title screen fits a phone and offline Classic is playable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem(
      "wilder-display-v1",
      JSON.stringify({ quality: "low", run: true }),
    ),
  );
  await page.goto("/");
  await expect(page.locator("#start-menu")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({ path: "artifacts/menu-mobile.png" });
  await page.locator('[data-menu-action="classic"]').click();
  await expect(page.locator("#start-menu")).toBeHidden();
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  await expect(page.locator("#roll-button")).toBeEnabled();
});
