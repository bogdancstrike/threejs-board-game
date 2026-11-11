import { test, expect } from "./fixtures";
// Exercise real challenge widgets without spending GPU time on a second board.
// Domain and WebSocket tests separately validate the submitted commands.
test("ten mini-game widgets submit the expected player intentions", async ({
  page,
}) => {
  await page.goto("/scripts/preview-stage.html");
  await page.evaluate(async () => {
    const path = "/src/network/challenge-panel.ts";
    const { ChallengePanel } = await import(path);
    const root = document.createElement("div");
    root.id = "challenge-fixture";
    document.body.append(root);
    const base = {
      id: "test",
      startedAt: Date.now() - 6000,
      deadline: Date.now() + 30000,
      options: ["A", "B", "C", "D"],
      title: "Road trial",
      prompt: "Try this game",
    };
    const client: any = {
      myTurn: true,
      clockOffset: 0,
      room: {
        game: { active: 0, players: [{ name: "Ada" }], challenge: null },
      },
      command: async (type: string, payload: any) => {
        (window as any).lastIntent = { type, payload };
        if (type === "CHALLENGE_TAP")
          client.room.game.challenge.taps.push(Date.now());
      },
    };
    const panel = new ChallengePanel(
      client,
      {
        icon: () => "",
        escape: (s: string) => s.replaceAll("<", "&lt;"),
        header: (_: string, title: string) => `<h1>${title}</h1>`,
        toast: () => {},
        sound: () => {},
        open: (_: string, html: string) => (root.innerHTML = html),
      },
      root,
    );
    (window as any).openChallenge = (type: string) => {
      const details: any = {
        count: { symbols: ["◆", "◆", "◆"] },
        pattern: { symbols: ["◇", "☾", "?"] },
        memory: { sequence: ["A", "B", "C", "D"], revealUntil: Date.now() - 1 },
        balance: { target: { min: 40, max: 65 }, period: 2400 },
        rhythm: { beat: 700, taps: [] },
        maze: {
          size: 5,
          walls: [2, 7, 10, 14, 17, 19, 20, 21],
          start: 0,
          goal: 24,
          options: [],
        },
        alchemy: { values: [2, 3, 5, 7], targetSum: 10 },
      };
      client.room.game.challenge = {
        ...base,
        ...details[type],
        type,
        id: type,
      };
      (window as any).lastIntent = null;
      panel.open();
    };
  });
  for (const type of ["riddle", "count", "pattern", "math", "oddone"]) {
    await page.evaluate((type) => (window as any).openChallenge(type), type);
    await page.locator('[data-challenge-action="choice"]').first().click();
    expect(await page.evaluate(() => (window as any).lastIntent)).toEqual({
      type: "SUBMIT_CHALLENGE",
      payload: { answer: 0 },
    });
  }
  await page.evaluate(() => (window as any).openChallenge("memory"));
  for (const choice of [0, 1, 2, 3])
    await page
      .locator(`[data-challenge-action="choice"][data-choice="${choice}"]`)
      .click();
  expect(
    await page.evaluate(() => (window as any).lastIntent.payload.answer),
  ).toEqual(["A", "B", "C", "D"]);
  await page.evaluate(() => (window as any).openChallenge("balance"));
  await page.locator('[data-challenge-action="balance"]').click();
  expect(await page.evaluate(() => (window as any).lastIntent.type)).toBe(
    "SUBMIT_CHALLENGE",
  );
  await page.evaluate(() => (window as any).openChallenge("rhythm"));
  for (let n = 0; n < 4; n++)
    await page.locator('[data-challenge-action="rhythm"]').click();
  await page.locator('[data-challenge-action="rhythm"]').click();
  expect(await page.evaluate(() => (window as any).lastIntent.type)).toBe(
    "SUBMIT_CHALLENGE",
  );
  await page.evaluate(() => (window as any).openChallenge("maze"));
  for (const choice of [1, 6, 11, 12, 13, 18, 23, 24])
    await page
      .locator(`[data-challenge-action="maze"][data-choice="${choice}"]`)
      .click();
  expect(
    await page.evaluate(() => (window as any).lastIntent.payload.answer),
  ).toEqual([0, 1, 6, 11, 12, 13, 18, 23, 24]);
  await page.evaluate(() => (window as any).openChallenge("alchemy"));
  for (const choice of [0, 1, 2])
    await page
      .locator(`[data-challenge-action="choice"][data-choice="${choice}"]`)
      .click();
  expect(
    await page.evaluate(() => (window as any).lastIntent.payload.answer),
  ).toEqual([0, 1, 2]);
});
