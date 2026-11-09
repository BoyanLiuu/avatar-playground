import { expect, test } from "@playwright/test";

test("home shows a shadcn button on the dark theme", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(15, 16, 20)",
  );

  const button = page.getByRole("button", { name: /randomize/i });
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS("background-color", "rgb(124, 108, 255)");

  await button.click();
  await expect(page.getByText("Randomize arrives in M2")).toBeVisible();

  await page.screenshot({ path: "test-results/m0-home.png" });
});
