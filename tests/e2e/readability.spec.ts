import { test, expect } from "./fixtures";

test("party lobby text has readable sizes and contrast on desktop and phone", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 2048, height: 1152 });
  await page.addInitScript(() =>
    localStorage.setItem(
      "wilder-display-v1",
      JSON.stringify({ quality: "low", run: true }),
    ),
  );
  await page.goto("/");
  await page.locator('[data-menu-action="new"]').click();
  await page.locator("#online-player-name").fill("Bogdan");
  await page.locator("#hotseat-count").selectOption("2");
  await page.locator("#room-world").selectOption("stormreach");
  await page.locator('[data-room-action="create"]').click();
  await expect(page.locator(".lobby-player")).toHaveCount(2);
  for (const width of [2048, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1152 });
    const audit = await page.evaluate(() => {
      const selectors = [
        ".modal-header .eyebrow",
        ".lobby-player-info strong",
        ".lobby-player-info small",
        ".lobby-player-info strong > span",
        ".lobby-ready",
        ".lobby-world strong",
        ".lobby-world > span",
        ".lobby-hint",
        ".connection-badge",
        ".lobby-room-code > span",
        ".lobby-actions .secondary-button",
        ".lobby-actions .text-button",
      ];
      const rgb = (value: string) =>
        value
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number);
      const luminance = (color: number[]) =>
        color
          .map((v) => {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      return selectors.flatMap((selector) =>
        Array.from(document.querySelectorAll<HTMLElement>(selector)).map(
          (el) => {
            const style = getComputedStyle(el);
            let node: HTMLElement | null = el;
            let background = "";
            while (node) {
              const bg = getComputedStyle(node).backgroundColor;
              if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
                background = bg;
                break;
              }
              node = node.parentElement;
            }
            const light = luminance(rgb(style.color)),
              dark = luminance(rgb(background));
            return {
              selector,
              font: parseFloat(style.fontSize),
              contrast:
                (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05),
            };
          },
        ),
      );
    });
    for (const entry of audit) {
      expect(
        entry.font,
        `${width}px ${entry.selector} size`,
      ).toBeGreaterThanOrEqual(
        entry.selector.includes("strong > span") ? 10 : 12,
      );
      expect(
        entry.contrast,
        `${width}px ${entry.selector} contrast`,
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(
      await page
        .locator("#modal")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page.locator(".lobby-player").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/lobby-readable-${width}.png` });
  }
  await page.locator('[data-room-action="ready"]').click();
  await expect(page.locator('[data-room-action="start"]')).toBeEnabled();
  await page.locator('[data-room-action="start"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled();
});
