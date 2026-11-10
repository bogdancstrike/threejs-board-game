import { MAPS } from "../../src/game/maps";
import { test, expect } from "@playwright/test";
test("full-screen board, character preview, movement and save restoration", async ({
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
test("all thirty themes render and mobile controls fit the viewport", async ({
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
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  await page.locator('[data-action="maps"]').first().click();
  expect(await page.locator("[data-map]").count()).toBe(30);
  await page.locator('[data-action="close-modal"]').click();
  test.setTimeout(300000);
  for (const id of MAPS.slice(1).map((m) => m.id)) {
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
    expect(b.minY, `${b.id} ${b.action} feet`).toBeGreaterThan(-0.5);
    expect(b.width, `${b.id} ${b.action} width`).toBeLessThan(2.6);
  }
});
test("audio controls persist and the sound engine produces an audible signal", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  await page.locator('[data-action="settings"]').click();
  await page.locator("#audio-enabled").check();
  await page.locator('[data-audio-volume="music"]').fill("25");
  await page.locator('[data-audio-volume="effects"]').fill("70");
  await expect(page.locator("#volume-music")).toHaveText("25%");
  const prefs = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("wilder-audio-v1")!),
  );
  expect(prefs.enabled).toBe(true);
  expect(prefs.music).toBe(0.25);
  expect(prefs.effects).toBe(0.7);
  const peak = await page.evaluate(async () => {
    const path = "/src/audio/audio.ts",
      mapPath = "/src/game/maps.ts";
    const { GameAudio } = await import(path),
      { MAPS } = await import(mapPath);
    const engine = new GameAudio(MAPS[0]);
    await engine.setEnabled(true);
    engine.play("treasure");
    const analyser = engine.context.createAnalyser();
    engine.master.connect(analyser);
    await new Promise((r) => setTimeout(r, 650));
    const samples = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(samples);
    const peak = Math.max(...samples.map(Math.abs));
    engine.dispose();
    return peak;
  });
  expect(peak).toBeGreaterThan(0.0001);
  expect(peak).toBeLessThan(1);
  expect(errors).toEqual([]);
});
test("map preview is interactive and does not replace the current saved expedition", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  await page.locator('[data-action="maps"]').first().click();
  await expect(page.locator(".map-thumbnail")).toHaveCount(30);
  await page.locator('[data-map="dragonkind"]').click();
  await expect(page.locator("#map-preview-loading")).toBeHidden({
    timeout: 45000,
  });
  await expect(page.locator("#map-preview-canvas canvas")).toBeVisible();
  await page.locator('[data-action="preview-map-in"]').click();
  await page.locator('[data-action="preview-map-out"]').click();
  await page.locator('[data-preview-map="frost"]').click();
  await expect(page.locator("#map-preview-loading")).toBeHidden({
    timeout: 45000,
  });
  await expect(page.locator(".modal-header h2")).toHaveText(
    "The Frostbound Passage",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("wilder-expedition-v1") || '{"map":"verdant"}',
        ).map,
    ),
  ).toBe("verdant");
  await page.locator('[data-action="close-modal"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled();
});
