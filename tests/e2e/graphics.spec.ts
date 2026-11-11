import { test, expect } from "./fixtures";

test("graphics controls persist across worlds and Exit game resumes saved play", async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  await page.locator('[data-menu-action="classic"]').click();
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  await page.locator('[data-action="settings"]').click();
  await page.locator("#quality-setting").selectOption("medium");
  for (const lighting of ["daylight", "sunset", "moonlight", "cinematic"])
    await page.locator("#lighting-setting").selectOption(lighting);
  for (const [key, value] of Object.entries({
    exposure: "125",
    bloom: "80",
    fog: "35",
    weather: "45",
    waterSpeed: "120",
    foam: "75",
  }))
    await page.locator(`[data-graphics="${key}"]`).fill(value);
  for (const key of ["shadows", "ao", "spray"]) {
    await page.locator(`[data-graphics-toggle="${key}"]`).uncheck();
    await page.locator(`[data-graphics-toggle="${key}"]`).check();
  }
  await page.locator('[data-action="close-modal"]').click();
  await page.waitForTimeout(800);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("wilder-graphics-v1")!),
  );
  expect(saved).toMatchObject({
    exposure: 1.25,
    bloom: 0.8,
    fog: 0.35,
    weather: 0.45,
    waterSpeed: 1.2,
    foam: 0.75,
    spray: true,
  });
  await page.locator('[data-action="exit-game"]').first().click();
  await expect(page.locator("#start-menu")).toBeVisible();
  await page.locator('[data-menu-action="continue"]').click();
  await expect(page.locator("#roll-button")).toBeEnabled();
  await page.locator('[data-action="maps"]').first().click();
  await page.locator('[data-map="coral"]').click();
  await expect(page.locator("#map-preview-loading")).toBeHidden({
    timeout: 45000,
  });
  await page.locator('[data-start-map="coral"]').click();
  await expect(page.locator("#scene-loading")).toBeHidden({ timeout: 45000 });
  await page.reload();
  await page.locator('[data-menu-action="continue"]').click();
  await page.locator('[data-action="settings"]').click();
  await expect(page.locator('[data-graphics="bloom"]')).toHaveValue("80");
  await expect(page.locator("#lighting-setting")).toHaveValue("cinematic");
  await page.locator('[data-action="reset-graphics"]').click();
  await expect(page.locator('[data-graphics="exposure"]')).toHaveValue("116");
  expect(errors).toEqual([]);
});

test("waterfall shaders render curved curtains, animated spray and configurable foam", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/scripts/preview-stage.html");
  const result = await page.evaluate(async () => {
    const path = "/src/world/scene.ts",
      maps = "/src/game/maps.ts";
    const { GameScene } = await import(path),
      { getMap } = await import(maps);
    const scene = new GameScene(
      document.querySelector("#stage"),
      getMap("verdant"),
      "medium",
    );
    await scene.ready;
    const fall = scene.world.group.getObjectByName("waterfall");
    if (!fall) throw Error("Missing waterfall");
    const center = fall.position.clone();
    center.y -= 1;
    scene.controls.target.copy(center);
    scene.camera.position.copy(center).add({ x: 5, y: 2, z: 6 });
    scene.controls.update();
    const options = { ...scene.graphics };
    scene.applyGraphics({ ...options, spray: false, foam: 0, waterSpeed: 0 });
    const hidden = !fall.getObjectByName("waterfall-spray").visible;
    scene.applyGraphics(options);
    scene.world.animated.forEach((f: any) => f(3));
    const spray = fall.getObjectByName("waterfall-spray").children[0];
    const first = Array.from(spray.geometry.attributes.position.array);
    scene.world.animated.forEach((f: any) => f(3.5));
    const changed = first.some(
      (v, i) => v !== spray.geometry.attributes.position.array[i],
    );
    await new Promise((r) => setTimeout(r, 1000));
    (window as any).graphicsScene = scene;
    return {
      hidden,
      changed,
      curtains: fall.children.filter((o: any) => o.isMesh).length,
      calls: scene.renderer.info.render.calls,
    };
  });
  expect(result.hidden && result.changed).toBe(true);
  expect(result.curtains).toBeGreaterThan(2);
  expect(result.calls).toBeGreaterThan(0);
  await page.screenshot({ path: "artifacts/waterfall-cinematic.png" });
  await page.evaluate(() => (window as any).graphicsScene.dispose());
  expect(errors).toEqual([]);
});
