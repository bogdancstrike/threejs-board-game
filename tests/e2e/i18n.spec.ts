import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

// Acceptance tests for openspec/changes/i18n (English and Romanian localization).
// They observe only player-visible text and the Settings language selector.
// The English strings below are the current English UI copy; the Romanian
// copy is not specified, so Romanian is asserted by absence of English copy
// and by the presence of unchanged proper names.

const EN_TITLE_STRINGS = ["New game", "Settings", "How to play"];
const EN_IN_PLAY_STRINGS = ["Roll the dice", "The first step is yours."];
// Proper names of worlds and characters must stay identical in both languages.
const PROPER_NAME_WORLD = "The Verdant Crown";
const PROPER_NAME_CHARACTER = "Elowen";

async function openSettings(page: Page) {
  await page.locator('[data-menu-action="settings"]').last().click();
  await expect(page.locator("#quality-setting")).toBeVisible();
}

function languageSelector(page: Page) {
  return page.getByRole("combobox", { name: /language|limb/i });
}

async function selectLanguage(page: Page, code: "EN" | "RO") {
  await openSettings(page);
  const selector = languageSelector(page);
  if ((await selector.count()) > 0) {
    await selector.selectOption(code === "EN" ? "en" : "ro");
  } else {
    const name = code === "EN" ? /^EN$|English/i : /^RO$|Rom[aâ]n/i;
    await page.getByRole("button", { name }).first().click();
  }
  await page.locator('[data-action="close-modal"]').click();
  await expect(page.locator("#start-menu")).toBeVisible();
}

async function expectTitleInEnglish(page: Page) {
  for (const text of EN_TITLE_STRINGS) {
    await expect(page.locator("#start-menu")).toContainText(text);
  }
}

async function expectTitleNotInEnglish(page: Page) {
  for (const text of EN_TITLE_STRINGS) {
    await expect(page.locator("#start-menu")).not.toContainText(text);
  }
}

test("default-en: without a saved choice the application starts in English", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#start-menu")).toBeVisible();
  await expectTitleInEnglish(page);
  await openSettings(page);
  await expect(languageSelector(page)).toHaveValue(/en/i);
});

test("select-ro: selecting RO in Settings translates the interface and keeps proper names", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#start-menu")).toBeVisible();
  await expectTitleInEnglish(page);
  const worldBefore = await page.locator("#menu-world-name").textContent();

  await selectLanguage(page, "RO");

  await expectTitleNotInEnglish(page);
  await expect(page.locator("#menu-world-name")).toHaveText(worldBefore!);
});

test("select-ro: in-play text, prompts and character names are displayed in Romanian", async ({
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
  await expect(page.locator("#start-menu")).toBeVisible();
  await selectLanguage(page, "RO");

  await page.locator('[data-menu-action="world"]').click();
  await expect(page.locator("#map-preview-loading")).toBeHidden({
    timeout: 45000,
  });
  await expect(page.locator("body")).toContainText(PROPER_NAME_WORLD);
  await page.locator('[data-action="new-game-setup"]').click();
  await page.locator("#online-player-name").fill("Explorator");
  await page.locator('[data-room-action="create"]').click();
  await expect(page.locator("#start-menu")).toBeHidden();
  await expect(page.locator(".lobby-player")).toContainText(
    /Explorator/,
  );
  await page.locator('[data-room-action="ready"]').click();
  await page.locator('[data-room-action="start"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled();

  for (const text of EN_IN_PLAY_STRINGS) {
    await expect(page.locator("body")).not.toContainText(text);
  }
  await expect(page.locator("#roll-button")).not.toContainText(
    "Roll the dice",
  );
  expect(errors).toEqual([]);
});

test("select-en: selecting EN from Romanian restores English and keeps proper names", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#start-menu")).toBeVisible();
  await selectLanguage(page, "RO");
  await expectTitleNotInEnglish(page);
  const worldBefore = await page.locator("#menu-world-name").textContent();

  await selectLanguage(page, "EN");

  await expectTitleInEnglish(page);
  await expect(page.locator("#menu-world-name")).toHaveText(worldBefore!);
});

test("restore-language: a saved RO choice is used after reload and shown as selected", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#start-menu")).toBeVisible();
  await selectLanguage(page, "RO");

  await page.reload();
  await expect(page.locator("#start-menu")).toBeVisible();
  await expectTitleNotInEnglish(page);

  await openSettings(page);
  const selector = languageSelector(page);
  if ((await selector.count()) > 0) {
    await expect(selector).toHaveValue(/ro/i);
  } else {
    await expect(
      page.getByRole("button", { name: /^RO$|Rom[aâ]n/i }).first(),
    ).toHaveAttribute("aria-pressed", "true");
  }
});
