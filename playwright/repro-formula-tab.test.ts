import { test, expect } from '@playwright/test';

test('formula updates on tab out', async ({ page }) => {
  await page.goto('/demo.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const priceCellSelector = '#spreadsheet2 td[data-x="2"][data-y="0"]';
  const totalCellSelector = '#spreadsheet2 td[data-x="3"][data-y="0"]';

  // Click the price cell to select
  await page.click(priceCellSelector);

  // Type a new price and press Tab
  await page.keyboard.type('30');
  await page.keyboard.press('Tab');

  // Wait for possible async updates
  await page.waitForTimeout(300);

  const totalText = await page.$eval(totalCellSelector, el => el.textContent?.trim());
  console.log('Total text:', totalText);

  expect(totalText).toBeTruthy();
  // Expect 10 * 30 = 300 (formatted), accept containing '300'
  expect(totalText).toContain('300');
});

