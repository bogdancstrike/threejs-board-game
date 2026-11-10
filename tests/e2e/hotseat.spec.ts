import {test,expect} from '@playwright/test';
test('same device party names, unique character picks and turn handoff',async ({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('wilder-display-v1',JSON.stringify({quality:'low',run:true})));
  await page.goto('/');
  await expect(page.locator('#scene-loading')).toBeHidden({timeout:45000});
  await page.locator('[data-action="rooms"]').click();
  await page.locator('#online-player-name').fill('Ada');
  await page.locator('#hotseat-count').selectOption('2');
  await page.getByLabel('Player 2 name',{exact:true}).fill('Grace');
  await page.locator('[data-room-action="create"]').click();
  await expect(page.locator('.lobby-player')).toHaveCount(2);
  await page.locator('[data-room-action="character"]').nth(1).click();
  await page.locator('[data-character="0"]').click();
  await expect(page.locator('#select-character')).toBeDisabled();
  await page.locator('[data-character="3"]').click();
  await page.locator('#select-character').click();
  await expect(page.locator('.lobby-player').nth(1)).toContainText('Elowen');
  await page.locator('[data-room-action="ready"]').click();
  await expect(page.locator('[data-room-action="start"]')).toBeEnabled();
  await page.locator('[data-room-action="start"]').click();
  await expect(page.locator('#roll-button')).toBeEnabled();
  await page.locator('#roll-button').click();
  await expect.poll(async()=>await page.locator('[data-choice="1"]').isVisible() || await page.locator('[data-challenge-action="road"]').isVisible() || await page.locator('.handoff-hero').isVisible(),{timeout:40000}).toBe(true);
  if(await page.locator('[data-choice="1"]').isVisible()) await page.locator('[data-choice="1"]').click();
  if(await page.locator('[data-challenge-action="road"]').isVisible()) {
    await expect(page.locator('.road-choices')).toContainText('mystery box');
    await page.locator('[data-challenge-action="road"][data-choice="leave"]').click();
  }
  await expect(page.locator('.handoff-hero')).toBeVisible();
  await expect(page.locator('#modal-content')).toContainText('Grace, your turn.');
  await page.getByRole("button",{name:"I’m ready to explore"}).click();
  await expect(page.locator('#roll-button')).toBeEnabled();
  await expect(page.locator('#turn-title')).toContainText('Grace');
  await page.screenshot({path:'artifacts/hotseat-game.png'});
  expect(errors).toEqual([]);
});
