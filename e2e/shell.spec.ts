import { expect, test } from "@playwright/test";

// M1.1: the app frame in both themes and at the three checked sizes.

test.describe("theme", () => {
  test("follows the OS on first visit", async ({ browser }) => {
    for (const scheme of ["light", "dark"] as const) {
      const page = await browser.newPage({ colorScheme: scheme });
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
      await page.close();
    }
  });

  test("the toggle overrides the OS, survives a reload, and the OS theme clears it", async ({
    browser,
  }) => {
    const page = await browser.newPage({
      colorScheme: "dark",
      viewport: { width: 1440, height: 900 },
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(
      await page.evaluate(() => localStorage.getItem("avatar-theme")),
    ).toBe("light");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: "Dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(
      await page.evaluate(() => localStorage.getItem("avatar-theme")),
    ).toBe("system");
    await page.close();
  });
});

test.describe("layout", () => {
  for (const [w, h] of [
    [1440, 900],
    [1280, 800],
  ] as const) {
    test(`three columns at ${w}x${h}, the page itself does not scroll`, async ({
      browser,
    }) => {
      for (const scheme of ["light", "dark"] as const) {
        const page = await browser.newPage({
          colorScheme: scheme,
          viewport: { width: w, height: h },
        });
        await page.goto("/");
        const rail = page.getByRole("navigation", { name: "Styles" });
        const panel = page.getByRole("complementary", { name: "Customize" });
        await expect(rail).toBeVisible();
        await expect(panel).toBeVisible();
        expect((await rail.boundingBox())?.width).toBe(264);
        expect((await panel.boundingBox())?.width).toBe(424);
        expect(
          await page.evaluate(() => document.documentElement.scrollHeight),
        ).toBe(h);
        await page.screenshot({
          path: `test-results/shell-${w}-${scheme}.png`,
        });
        await page.close();
      }
    });
  }

  test("phone 390x844: band, stage and the customize sheet", async ({
    browser,
  }) => {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Styles" })).toBeHidden();
    await expect(
      page.getByRole("complementary", { name: "Customize" }),
    ).toBeHidden();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
    await page.screenshot({ path: "test-results/shell-390.png" });
    await page.getByRole("button", { name: "Customize" }).click();
    await expect(page.getByRole("dialog", { name: "Customize" })).toBeVisible();
    await page.waitForTimeout(400); // let the sheet finish opening
    await page.screenshot({ path: "test-results/shell-390-sheet.png" });
    await page.close();
  });
});
