import { test, expect } from "@playwright/test";

test("updated demo.html functionality test", async ({ page }) => {
  // Navigate to the demo page
  await page.goto("/demo.html");
  await page.waitForLoadState("networkidle");

  // Wait for spreadsheets to initialize
  await page.waitForTimeout(2000);

  // Test 1: Verify both spreadsheets are initialized
  const spreadsheet1Tables = await page.$$eval(
    "#spreadsheet1 table",
    (tables) => tables.length
  );
  const spreadsheet2Tables = await page.$$eval(
    "#spreadsheet2 table",
    (tables) => tables.length
  );

  expect(spreadsheet1Tables).toBe(1);
  expect(spreadsheet2Tables).toBe(1);

  // Test 2: Test getData button
  await page.click('button:has-text("Get Data")');

  // Should show alert about data logged to console
  const alertShown = await page.evaluate(() => {
    return new Promise((resolve) => {
      window.alert = function (message) {
        resolve(message.includes("logged to console"));
        return true;
      };

      // Trigger the alert by calling getData
      setTimeout(() => {
        window.getData();
      }, 100);
    });
  });

  expect(alertShown).toBe(true);

  // Test 3: Test addRow button
  await page.click('button:has-text("Add Row")');

  // Check if a new row was added by counting rows
  const rowCountAfterAdd = await page.$$eval(
    "#spreadsheet1 tbody tr",
    (rows) => rows.length
  );
  expect(rowCountAfterAdd).toBeGreaterThan(4); // Should be more than initial 4 rows

  // Test 4: Test clearData button (but don't confirm)
  await page.evaluate(() => {
    window.confirm = function () {
      return false;
    }; // Don't confirm clear
  });

  await page.click('button:has-text("Clear Data")');

  // Data should still be there since we didn't confirm
  const rowCountAfterCancel = await page.$$eval(
    "#spreadsheet1 tbody tr",
    (rows) => rows.length
  );
  expect(rowCountAfterCancel).toBe(rowCountAfterAdd); // Same number of rows

  // Test 5: Check for JavaScript errors
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  // Wait a bit more to catch any delayed errors
  await page.waitForTimeout(1000);

  console.log("Errors found:", errors);
  expect(errors).toHaveLength(0);
});
