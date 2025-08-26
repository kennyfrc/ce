import { test, expect } from "@playwright/test";

test("check for JavaScript errors in demo.html", async ({ page }) => {
  const errors: string[] = [];

  // Capture all console messages
  page.on("console", (msg) => {
    console.log(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  // Navigate to the demo page
  await page.goto("/demo.html");
  await page.waitForLoadState("networkidle");

  // Wait a bit more for any async operations
  await page.waitForTimeout(2000);

  // Check if there are any JavaScript errors
  console.log("Total errors found:", errors.length);
  errors.forEach((error, index) => {
    console.log(`Error ${index + 1}:`, error);
  });

  // The test should pass only if there are no JavaScript errors
  expect(errors).toHaveLength(0);
});
