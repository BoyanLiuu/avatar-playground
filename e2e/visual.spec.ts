import { type Page, expect, test } from "@playwright/test";
import { ready } from "./ready";

// M5: visual baselines, 6 styles × light/dark × desktop/phone, of the page as it opens (fully
// deterministic: no roll has happened). Baselines live in visual.spec.ts-snapshots/ and are
// taken on macOS; refresh with `pnpm test:e2e e2e/visual.spec.ts --update-snapshots`.

const STYLES = [
  ["flat", "Flat Cartoon"],
  ["pixel", "Pixel Art"],
  ["robots", "Robots"],
  ["doodle", "Line Doodle"],
  ["monsters", "Monsters"],
  ["geometric", "Geometric"],
] as const;

const pick = async (page: Page, name: string, phone: boolean) => {
  const nav = page.getByRole("navigation", { name: "Styles" });
  await nav
    .getByRole("button", {
      name: phone ? name.split(" ")[0] : new RegExp(name),
    })
    .click();
  await page.mouse.move(0, 0);
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete),
  );
};

for (const scheme of ["light", "dark"] as const) {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["phone", { width: 390, height: 844 }],
  ] as const) {
    test(`baseline: ${device} ${scheme}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport,
        colorScheme: scheme,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto("/");
      await ready(page);
      for (const [id, name] of STYLES) {
        await pick(page, name, device === "phone");
        await expect(page).toHaveScreenshot(`${id}-${device}-${scheme}.png`, {
          fullPage: device === "phone",
          maxDiffPixelRatio: 0.002,
        });
      }
      await context.close();
    });
  }
}
