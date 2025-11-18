import { test } from "@playwright/test";

test.describe.skip("record -> post -> feed", () => {
  test("placeholder until storage wiring is complete", async ({ page }) => {
    await page.goto("/");
  });
});
