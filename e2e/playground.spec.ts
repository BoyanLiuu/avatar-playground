import { type Page, expect, test } from "@playwright/test";

// M1.2–M1.4: the playground's layout against the plan's checks. Screenshots go to test-results/
// for side-by-side review with docs/avatar/playground-*.png (light) and docs/avatar/dark/ (dark).

const STYLES = [
  ["Flat Cartoon", "flat", 5],
  ["Pixel Art", "pixel", 5],
  ["Robots", "robots", 6],
  ["Line Doodle", "doodle", 6],
  ["Monsters", "monsters", 5],
  ["Geometric", "geometric", 6],
] as const;

const open = async (
  browser: import("@playwright/test").Browser,
  scheme: "light" | "dark",
  size = { width: 1440, height: 900 },
) => {
  const page = await browser.newPage({ colorScheme: scheme, viewport: size });
  await page.goto("/");
  return page;
};

/** Every image loaded and every entrance animation finished. */
const settle = (page: Page) =>
  page.waitForFunction(
    () =>
      [...document.images].every((img) => img.complete) &&
      document.getAnimations().every((a) => a.playState !== "running"),
  );

test("style list: six rows, the current one marked, part lists from data", async ({
  browser,
}) => {
  const page = await open(browser, "light");
  const rail = page.getByRole("navigation", { name: "Styles" });
  const rows = rail.locator("li > button");
  await expect(rows).toHaveCount(6);
  await expect(rail.locator('[aria-current="true"]')).toContainText(
    "Flat Cartoon",
  );
  await expect(rail.locator('[aria-current="true"]')).toContainText(
    "skin · hair · eyes · mouth · glasses",
  );
  for (const row of await rows.all()) {
    const lines = await row
      .locator("span.whitespace-nowrap")
      .evaluateAll((items) => items.map((i) => i.getBoundingClientRect().left));
    const firstLeft = Math.min(...lines);
    // An item that starts a line starts at the list's left edge and never with "·".
    for (const item of await row.locator("span.whitespace-nowrap").all()) {
      const left = (await item.boundingBox())!.x;
      if (Math.abs(left - firstLeft) < 1)
        expect((await item.textContent())!.startsWith("·")).toBe(false);
    }
  }
  await page.close();
});

for (const scheme of ["light", "dark"] as const) {
  test(`every style at 1440x900 (${scheme}): all parts visible, radio tiles, labelled controls`, async ({
    browser,
  }) => {
    const page = await open(browser, scheme);
    const panel = page.getByRole("complementary", { name: "Customize" });
    for (const [name, id, parts] of STYLES) {
      await page
        .getByRole("navigation", { name: "Styles" })
        .getByRole("button", { name: new RegExp(name) })
        .click();
      await expect(panel).toContainText(`${name} · ${parts} parts`);
      await settle(page);

      // The Everything Visible Rule: the last section ends inside the panel, no scrolling.
      const panelBox = (await panel.boundingBox())!;
      const last = panel.locator("section").last();
      const lastBox = (await last.boundingBox())!;
      expect(lastBox.y + lastBox.height).toBeLessThanOrEqual(
        panelBox.y + panelBox.height + 1,
      );

      // Tiles and swatches are radio groups with exactly one checked option.
      for (const group of await panel.getByRole("radiogroup").all()) {
        await expect(group.locator('[aria-checked="true"]')).toHaveCount(1);
      }

      // Every button has an accessible name.
      for (const button of await page.getByRole("button").all()) {
        if (!(await button.isVisible())) continue;
        const label =
          (await button.getAttribute("aria-label")) ??
          (await button.textContent());
        expect(label?.trim().length, await button.innerHTML()).toBeGreaterThan(
          0,
        );
      }

      await page.screenshot({ path: `test-results/m1-${id}-${scheme}.png` });
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBe(900);
    await page.close();
  });
}

test("locks: toggles are pressed and labelled, the locked line lists them", async ({
  browser,
}) => {
  const page = await open(browser, "light");
  const panel = page.getByRole("complementary", { name: "Customize" });
  await expect(
    panel.getByRole("button", { name: "Lock Skin" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    panel.getByRole("button", { name: "Lock Eyes" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Randomize keeps")).toContainText("Skin");
  await expect(page.getByText("Randomize keeps")).toContainText("Hair");
  await page.close();
});

test("tiles: arrow keys move focus within a group", async ({ browser }) => {
  const page = await open(browser, "light");
  const hair = page
    .getByRole("complementary", { name: "Customize" })
    .getByRole("radiogroup", { name: "Hair", exact: true });
  await hair.locator('[aria-checked="true"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(hair.getByRole("radio", { name: "Curly" })).toBeFocused();
  await page.close();
});

for (const scheme of ["light", "dark"] as const) {
  test(`grid view and 1280x800 hold (${scheme})`, async ({ browser }) => {
    const page = await open(browser, scheme);
    await page.getByRole("button", { name: "Grid view" }).click();
    await expect(
      page.getByRole("group", { name: /Contact sheet/ }),
    ).toHaveCount(3);
    await settle(page);
    await page.screenshot({ path: `test-results/m1-grid-${scheme}.png` });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByRole("button", { name: "Single view" }).click();
    await settle(page);
    const history = page.getByRole("region", { name: "History" });
    const actions = page.getByRole("button", { name: "Randomize" }).first();
    const historyTop = (await history.boundingBox())!.y;
    const actionsBottom = (await actions.boundingBox())!;
    expect(actionsBottom.y + actionsBottom.height).toBeLessThan(historyTop);
    const historyBox = (await history.boundingBox())!;
    expect(historyBox.y + historyBox.height).toBeLessThanOrEqual(800);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBe(800);
    await page.screenshot({ path: `test-results/m1-1280-${scheme}.png` });
    await page.close();
  });
}

for (const scheme of ["light", "dark"] as const) {
  test(`phone 390x844 (${scheme})`, async ({ browser }) => {
    const page = await open(browser, scheme, { width: 390, height: 844 });
    await settle(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
    await page.screenshot({
      path: `test-results/m1-phone-${scheme}.png`,
      fullPage: true,
    });
    await page.close();
  });
}
