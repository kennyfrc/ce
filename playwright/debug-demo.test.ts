import { test, expect } from "@playwright/test";

test("debug demo.html loading", async ({ page }) => {
  // Navigate to the demo page
  await page.goto("/demo.html");
  await page.waitForLoadState("networkidle");

  // Check what scripts are loaded
  const scripts = await page.$$eval("script", (scripts) =>
    scripts.map((script) => script.src || "inline")
  );
  console.log("Scripts found:", scripts);

  // Check if jspreadsheet is defined
  const jspreadsheetDefined = await page.evaluate(() => {
    return typeof window.jspreadsheet;
  });
  console.log("jspreadsheet type:", jspreadsheetDefined);

  // Check if jSuites is defined
  const jSuitesDefined = await page.evaluate(() => {
    return typeof window.jSuites;
  });
  console.log("jSuites type:", jSuitesDefined);

  // Check for any console errors
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  // Check if spreadsheet containers exist
  const spreadsheet1 = await page.$("#spreadsheet1");
  const spreadsheet2 = await page.$("#spreadsheet2");
  console.log("Spreadsheet 1 exists:", !!spreadsheet1);
  console.log("Spreadsheet 2 exists:", !!spreadsheet2);

  // Check for any jexcel elements
  const jexcelElements = await page.$$(".jexcel");
  console.log("jexcel elements found:", jexcelElements.length);

  // Take a screenshot for debugging
  await page.screenshot({ path: "debug-screenshot.png" });

  expect(errors).toHaveLength(0);
});
