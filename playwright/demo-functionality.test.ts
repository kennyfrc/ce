import { test, expect } from "@playwright/test";

test("demo.html functionality verification", async ({ page }) => {
  // Navigate to the demo page
  await page.goto("/demo.html");
  await page.waitForLoadState("networkidle");

  // Wait for spreadsheets to initialize
  await page.waitForTimeout(1000);

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

  // Test 2: Verify data is loaded in spreadsheet 1
  const spreadsheet1Data = await page.$$eval("#spreadsheet1 tbody tr", (rows) =>
    rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("td")).slice(1); // Skip row number
      return cells.map((cell) => cell.textContent?.trim());
    })
  );

  expect(spreadsheet1Data).toHaveLength(4); // 4 data rows
  expect(spreadsheet1Data[0]).toEqual([
    "Jazz",
    "Honda",
    "2019-02-12",
    "",
    "",
    "$ 2,000.00",
    "",
  ]);

  // Test 3: Verify formulas are working in spreadsheet 2
  const spreadsheet2Totals = await page.$$eval(
    "#spreadsheet2 tbody tr:last-child td",
    (cells) => cells.map((cell) => cell.textContent?.trim())
  );

  expect(spreadsheet2Totals[3]).toBe("$ 753.73"); // Total should be calculated

  // Test 4: Verify interactive elements (dropdowns, checkboxes)
  const dropdownExists = await page.$eval(
    "#spreadsheet1 .jss_dropdown",
    (el) => !!el
  );
  const checkboxesExist = await page.$$eval(
    '#spreadsheet1 input[type="checkbox"]',
    (checkboxes) => checkboxes.length > 0
  );

  expect(dropdownExists).toBe(true);
  expect(checkboxesExist).toBe(true);

  // Test 5: Verify jspreadsheet function is available
  const jspreadsheetAvailable = await page.evaluate(
    () => typeof window.jspreadsheet === "function"
  );
  expect(jspreadsheetAvailable).toBe(true);

  // Test 6: Verify jSuites is available
  const jSuitesAvailable = await page.evaluate(
    () => typeof window.jSuites === "object"
  );
  expect(jSuitesAvailable).toBe(true);

  // Test 7: Check for JavaScript errors
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  // Wait a bit more to catch any delayed errors
  await page.waitForTimeout(1000);

  expect(errors).toHaveLength(0);
});

test("manual spreadsheet creation works", async ({ page }) => {
  await page.goto("/demo.html");
  await page.waitForLoadState("networkidle");

  // Test that we can manually create a spreadsheet
  const result = await page.evaluate(() => {
    const testDiv = document.createElement("div");
    document.body.appendChild(testDiv);

    try {
      const spreadsheet = window.jspreadsheet(testDiv, {
        data: [
          ["Test Product", 10, 25.5],
          ["Another Product", 5, 15.75],
        ],
        columns: [
          { type: "text", title: "Product" },
          { type: "numeric", title: "Quantity" },
          { type: "numeric", title: "Price", mask: "$ #,##0.00" },
        ],
      });

      return {
        success: true,
        rows: spreadsheet[0].rows,
        columns: spreadsheet[0].columns,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  });

  expect(result.success).toBe(true);
  expect(result.rows).toBe(2);
  expect(result.columns).toBe(3);
});
