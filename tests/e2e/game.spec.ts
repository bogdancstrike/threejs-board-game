import { test, expect } from "@playwright/test";
test("full-screen board, character preview, movement and save restoration", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  const canvas = await page.locator("#viewport canvas").boundingBox();
  expect(canvas!.height / 900).toBeGreaterThan(0.9);
  expect(canvas!.width).toBe(1280);
  await page.locator('[data-action="settings"]').click();
  await page.locator("#quality-setting").selectOption("low");
  await page.locator("#run-setting").check();
  await page.locator('[data-action="close-modal"]').click();
  await page.locator('[data-action="characters"]').first().click();
  await expect(page.locator("#char-name")).toHaveText("Lyra");
  await page.locator('[data-action="next-character"]').click();
  await expect(page.locator("#char-name")).toHaveText("Seraphine");
  await page.locator('[data-animation="walk"]').click();
  await expect(page.locator('[data-animation="walk"]')).toHaveClass("active");
  await page.locator('[data-action="select-character"]').click();
  await page.locator("#roll-button").click();
  await expect(page.locator("#dice")).not.toHaveClass(/rolling/, {
    timeout: 10000,
  });
  await page.waitForFunction(
    () => {
      const s = JSON.parse(
        localStorage.getItem("wilder-expedition-v1") || "null",
      );
      return s && s.dice > 0;
    },
    { timeout: 30000 },
  );
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("wilder-expedition-v1")!),
  );
  expect(saved.players[0].position).toBeGreaterThan(0);
  expect(saved.players[0].character).toBe("seraphine");
  if (saved.phase === "event") {
    await page.locator('[data-choice="1"]').click();
    await expect(page.locator("#modal")).not.toBeVisible();
  }
  await page.reload();
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("wilder-expedition-v1")!).players[0]
          .character,
    ),
  ).toBe("seraphine");
  expect(errors).toEqual([]);
});
test("all ten themes render and mobile controls fit the viewport", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  await page.locator('[data-action="maps"]').first().click();
  expect(await page.locator("[data-map]").count()).toBe(10);
  await page.locator('[data-action="close-modal"]').click();
  for (const id of [
    "dragonkind",
    "frost",
    "desert",
    "sakura",
    "ember",
    "tide",
    "mycelium",
    "astral",
    "clockwork",
  ]) {
    await page.locator('[data-action="maps"]').first().click();
    await page.locator(`[data-map="${id}"]`).click();
    await page.locator(`[data-start-map="${id}"]`).click();
    await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("wilder-expedition-v1")!).map,
      ),
    ).toBe(id);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#roll-button")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("supplied characters remain centered in every action", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  const bounds = await page.evaluate(async () => {
    const assetPath = "/src/world/assets.ts",
      dataPath = "/src/game/data.ts",
      animationPath = "/src/world/animation.ts",
      threePath = "/node_modules/.vite/deps/three.js";
    const assets = await import(assetPath),
      data = await import(dataPath),
      animation = await import(animationPath),
      THREE = await import(threePath);
    const results: {
      id: string;
      action: string;
      minY: number;
      maxY: number;
      width: number;
    }[] = [];
    for (const id of Object.keys(assets.MODEL_PATHS)) {
      const root = await assets.characterModel(
        data.CHARACTERS.find((c: { id: string }) => c.id === id),
      );
      for (const action of ["idle", "walk", "run", "rest", "magic"]) {
        animation.setAction(root, action);
        animation.animateCharacter(root, 2, 0.016);
        root.updateMatrixWorld(true);
        root.traverse((o: any) => {
          if (o.isSkinnedMesh) o.computeBoundingBox();
        });
        const b = new THREE.Box3().setFromObject(root);
        results.push({
          id,
          action,
          minY: b.min.y,
          maxY: b.max.y,
          width: b.max.x - b.min.x,
        });
      }
    }
    return results;
  });
  expect(bounds).toHaveLength(40);
  for (const b of bounds) {
    expect(b.maxY, `${b.id} ${b.action} height`).toBeLessThan(2.3);
    expect(b.minY).toBeGreaterThan(-0.5);
    expect(b.width).toBeLessThan(2.6);
  }
});
