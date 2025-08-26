import { test, expect } from "@playwright/test";

test("check DOM structure after initialization", async ({ page }) => {
  // Navigate to the demo page
  await page.goto("/demo.html");
  await page.waitForLoadState("networkidle");

  // Wait for potential async initialization
  await page.waitForTimeout(3000);

  // Check the inner HTML of spreadsheet containers
  const spreadsheet1HTML = await page.$eval(
    "#spreadsheet1",
    (el) => el.innerHTML
  );
  const spreadsheet2HTML = await page.$eval(
    "#spreadsheet2",
    (el) => el.innerHTML
  );

  console.log("Spreadsheet 1 HTML:", spreadsheet1HTML);
  console.log("Spreadsheet 2 HTML:", spreadsheet2HTML);

  // Check if any tables are created
  const tablesInSpreadsheet1 = await page.$$eval(
    "#spreadsheet1 table",
    (tables) => tables.length
  );
  const tablesInSpreadsheet2 = await page.$$eval(
    "#spreadsheet2 table",
    (tables) => tables.length
  );

  console.log("Tables in spreadsheet1:", tablesInSpreadsheet1);
  console.log("Tables in spreadsheet2:", tablesInSpreadsheet2);

  // Check for any elements with jexcel class
  const jexcelElements = await page.$$eval(
    ".jexcel",
    (elements) => elements.length
  );
  console.log("Elements with jexcel class:", jexcelElements);

  // Check if jspreadsheet initialization functions exist
  const jspreadsheetType = await page.evaluate(() => typeof window.jspreadsheet);
  console.log("jspreadsheet type:", jspreadsheetType);

  // Try to manually initialize a spreadsheet to see if the function works
  const manualInitResult = await page.evaluate(() => {
    try {
      const testDiv = document.createElement("div");
      document.body.appendChild(testDiv);
      const result = window.jspreadsheet(testDiv, {
        data: [["Test", "Value"]],
        columns: [{ type: "text" }, { type: "text" }],
      });
      return typeof result;
    } catch (error) {
      return "Error: " + error.message;
    }
  });

  console.log("Manual initialization result:", manualInitResult);
});
