import { test, expect } from "@playwright/test";

test("demo.html functionality test", async ({ page }) => {
  // Navigate to the demo page
  await page.goto("http://localhost:8080/demo.html");

  // Wait for the page to load completely
  await page.waitForLoadState("networkidle");

  // Test 1: Check if jspreadsheet is loaded
  const spreadsheetLoaded = await page.evaluate(() => {
    return typeof window.jspreadsheet !== "undefined";
  });
  expect(spreadsheetLoaded).toBe(true);

  // Test 2: Check if basic spreadsheet elements are present
  const spreadsheetElements = await page.$$eval(".jss_spreadsheet", (elements) => {
    return elements.length > 0;
  });
  expect(spreadsheetElements).toBe(true);

  // Test 3: Test basic interaction - click on a cell
  const firstCell = await page.$(".jss_worksheet td");
  expect(firstCell).not.toBeNull();

  if (firstCell) {
    await firstCell.click();

    // Check if cell gets focus (has editing class or attribute)
    const hasFocus = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement && activeElement.closest(".jss_worksheet") !== null;
    });
    expect(hasFocus).toBe(true);
  }

  // Test 4: Test basic data entry
  await page.keyboard.type("Test123");
  await page.keyboard.press("Enter");

  // Verify the value was entered
  const cellValue = await page.$eval(".jss_worksheet td", (cell) => cell.textContent);
  expect(cellValue).toBe("Test123");

  // Test 5: Check if toolbar functionality works
  const toolbarButtons = await page.$$eval(".jss_toolbar button", (buttons) => buttons.length);
  expect(toolbarButtons).toBeGreaterThan(0);

  // Test 6: Verify that external libraries (jSuites) are loaded
  const jSuitesLoaded = await page.evaluate(() => {
    return typeof window.jSuites !== "undefined";
  });
  expect(jSuitesLoaded).toBe(true);
});

test("demo.html should load without errors", async ({ page }) => {
  // Capture console errors
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  // Navigate to the demo page
  await page.goto("http://localhost:8080/demo.html");
  await page.waitForLoadState("networkidle");

  // Check for JavaScript errors
  expect(errors).toHaveLength(0);
});
