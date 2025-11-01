import { test } from "@playwright/test";

test.describe.skip("Configuration wizard smoke tests", () => {
  test("open home page and view header", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("text=Continue Dev Hub Configuration Wizard");
  });
});

