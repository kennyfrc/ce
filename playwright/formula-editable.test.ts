import { test, expect } from '@playwright/test';

test('total cell is editable via double click', async ({ page }) => {
  await page.goto('/demo.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const totalCell = await page.locator('#spreadsheet2 td[data-x="3"][data-y="0"]');
  await totalCell.click();
  await totalCell.dblclick();
  // Wait for editor to be created
  await page.waitForTimeout(200);

  const classNames = await totalCell.getAttribute('class');
  // The editor should replace innerHTML and add class 'editor' on the cell when editing
  expect(classNames && classNames.includes('editor')).toBeTruthy();
});

