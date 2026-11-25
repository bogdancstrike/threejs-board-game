import { test, expect } from "./fixtures";

const SECTIONS = [
  "profile",
  "display",
  "lighting",
  "grading",
  "gameplay",
  "camera",
  "audio",
  "access",
];

test("settings panel from the in-game header shows the version below all sections", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      "wilder-display-v1",
      JSON.stringify({ quality: "low", run: true }),
    ),
  );
  await page.goto("/");
  await page.locator('[data-menu-action="classic"]').click();
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  await page.locator('[data-action="settings"]').click();
  const modal = page.locator("#modal-content");
  await expect(modal).toContainText("Version 1.0.0");
  await expect(
    modal.getByText("Version 1.0.0", { exact: true }),
  ).toBeInViewport();
  expect(errors).toEqual([]);
});

test("settings opened from the title screen show the version", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#start-menu")).toBeVisible();
  await page.locator('[data-menu-action="settings"]').last().click();
  await expect(page.locator("#modal-content")).toContainText("Version 1.0.0");
  expect(errors).toEqual([]);
});

test("showing the version leaves existing settings values, sections and storage untouched", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      "wilder-display-v1",
      JSON.stringify({ quality: "low", run: true }),
    ),
  );
  await page.goto("/");
  await page.locator('[data-menu-action="classic"]').click();
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });

  await page.locator('[data-action="settings"]').click();
  await page.locator("#quality-setting").selectOption("medium");
  await page.locator('[data-action="close-modal"]').click();

  const before = await page.evaluate(() => {
    const out: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      out[k] = localStorage.getItem(k);
    }
    return out;
  });

  await page.locator('[data-action="settings"]').click();
  const modal = page.locator("#modal-content");
  await expect(modal).toContainText("Version 1.0.0");
  for (const id of SECTIONS)
    await expect(page.locator(`[data-config-section="${id}"]`)).toHaveCount(1);
  await expect(page.locator("#quality-setting")).toHaveValue("medium");

  const after = await page.evaluate(() => {
    const out: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      out[k] = localStorage.getItem(k);
    }
    return out;
  });
  expect(after).toEqual(before);
  expect(errors).toEqual([]);
});
