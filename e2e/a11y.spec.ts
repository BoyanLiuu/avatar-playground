import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";
import { ready } from "./ready";

// M5: automated accessibility audit (axe, WCAG 2.2 A/AA) of every screen state.

const audit = async (page: Page, label: string) => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const report = violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes
        .slice(0, 4)
        .map(
          (n) =>
            `${n.target.join(" ")} — ${n.failureSummary?.split("\n")[1]?.trim()}`,
        )
        .join("\n  ")}`,
  );
  expect(report, label).toEqual([]);
};

for (const scheme of ["light", "dark"] as const) {
  test(`axe: desktop, every style, single and grid (${scheme})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: scheme,
    });
    const page = await context.newPage();
    await page.goto("/");
    await ready(page);
    for (const key of ["1", "2", "3", "4", "5", "6"]) {
      await page.keyboard.press(key);
      await page.waitForTimeout(150);
      await audit(page, `style ${key}, ${scheme}`);
    }
    await page.getByRole("button", { name: "Grid view" }).click();
    await page.waitForTimeout(500);
    await audit(page, `grid, ${scheme}`);
    await page.getByRole("button", { name: "Single view" }).click();
    await page.getByRole("button", { name: "PNG", exact: true }).click();
    await page.getByRole("menuitem").first().waitFor();
    await audit(page, `png menu, ${scheme}`);
    await context.close();
  });

  test(`axe: phone and tablet (${scheme})`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      colorScheme: scheme,
    });
    const page = await context.newPage();
    await page.goto("/");
    await ready(page);
    await audit(page, `phone, ${scheme}`);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.getByRole("button", { name: "Customize" }).click();
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(400);
    await audit(page, `tablet sheet, ${scheme}`);
    await context.close();
  });
}
