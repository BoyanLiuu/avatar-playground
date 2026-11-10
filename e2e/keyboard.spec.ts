import { type Page, expect, test } from "@playwright/test";
import { ready } from "./ready";

// M5: every task can be done with the keyboard alone, in a sensible focus order, always with a
// visible focus ring.

const readStop = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const region =
      el.closest("header")?.tagName.toLowerCase() ??
      el
        .closest("nav, section[aria-label], aside")
        ?.getAttribute("aria-label") ??
      "page";
    const style = getComputedStyle(el);
    const ring =
      (style.outlineStyle !== "none" &&
        Number.parseFloat(style.outlineWidth) > 0) ||
      style.boxShadow !== "none";
    const box = el.getBoundingClientRect();
    return {
      region,
      name: (el.getAttribute("aria-label") ?? el.textContent ?? "")
        .trim()
        .slice(0, 40),
      ring,
      hidden:
        !!el.closest("[aria-hidden=true]") ||
        box.width === 0 ||
        box.height === 0,
    };
  });

test("Tab reaches every region in order, each stop visible and ringed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await ready(page);
  const stops: NonNullable<Awaited<ReturnType<typeof readStop>>>[] = [];
  for (let n = 0; n < 150; n++) {
    await page.keyboard.press("Tab");
    const stop = await readStop(page);
    if (!stop) break;
    if (
      stops.length &&
      stop.name === stops[0].name &&
      stop.region === stops[0].region
    )
      break;
    stops.push(stop);
  }
  // Regions come in reading order: band, style rail, stage, customize panel.
  const order = stops
    .map((s) => s.region)
    .filter((r, i, all) => r !== all[i - 1]);
  expect(order).toEqual(["header", "Styles", "Avatar", "History", "Customize"]);
  for (const stop of stops) {
    expect(stop.hidden, stop.name).toBe(false);
    expect(stop.ring, `${stop.region}: ${stop.name}`).toBe(true);
  }
  // Radio groups are one stop each, so the panel stays short.
  expect(stops.filter((s) => s.region === "Customize").length).toBeLessThan(25);
});

const panel = (page: Page) =>
  page.getByRole("complementary", { name: "Customize" });
const hero = (page: Page) => page.getByRole("img", { name: /Current avatar/ });
const frameNo = async (page: Page) =>
  Number((await hero(page).getAttribute("alt"))!.match(/frame (\d+)/)![1]);
const checked = (page: Page, group: string) =>
  panel(page)
    .getByRole("radiogroup", { name: group, exact: true })
    .locator('[aria-checked="true"]')
    .getAttribute("aria-label");

test("every task with the keyboard alone", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const page = await context.newPage();
  await page.goto("/");
  await ready(page);
  const key = async (target: ReturnType<Page["locator"]>, press: string) => {
    await target.focus();
    await page.keyboard.press(press);
  };

  // Switch style from the rail.
  await key(
    page
      .getByRole("navigation", { name: "Styles" })
      .getByRole("button", { name: /Robots/ }),
    "Enter",
  );
  await expect(panel(page)).toContainText("Robots · 6 parts");

  // Randomize: the button, then Space with nothing focused.
  const first = await frameNo(page);
  await key(
    page.getByRole("button", { name: /^Randomize( Space)?$/ }),
    "Enter",
  );
  await expect.poll(() => frameNo(page)).toBe(first + 1);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.keyboard.press("Space");
  await expect.poll(() => frameNo(page)).toBe(first + 2);

  // Pick an option with the arrow keys, lock it, roll a part, undo.
  const eyes = await checked(page, "Eyes");
  await key(
    panel(page)
      .getByRole("radiogroup", { name: "Eyes" })
      .locator('[aria-checked="true"]'),
    "ArrowRight",
  );
  await expect.poll(() => checked(page, "Eyes")).not.toBe(eyes);
  await key(panel(page).getByRole("button", { name: "Lock Eyes" }), "Space");
  await expect(
    panel(page).getByRole("button", { name: "Lock Eyes" }),
  ).toHaveAttribute("aria-pressed", "true");
  const mouth = await checked(page, "Mouth");
  await key(
    panel(page).getByRole("button", { name: "Randomize Mouth" }),
    "Enter",
  );
  await expect.poll(() => checked(page, "Mouth")).not.toBe(mouth);
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => checked(page, "Mouth")).toBe(mouth);

  // Frame shape, flip.
  await key(
    panel(page)
      .getByRole("radiogroup", { name: "Frame shape" })
      .locator('[aria-checked="true"]'),
    "ArrowLeft",
  );
  await expect(
    panel(page).getByRole("radio", { name: "Circle" }),
  ).toHaveAttribute("aria-checked", "true");
  await key(page.getByRole("button", { name: "Flip" }), "Enter");
  await expect(page.getByRole("button", { name: "Flip" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // Restore an earlier frame from the history strip.
  await key(
    page
      .getByRole("group", { name: "Earlier rolls" })
      .first()
      .getByRole("button", { name: "Frame 1" }),
    "Enter",
  );
  await expect.poll(() => frameNo(page)).toBe(1);

  // Export through the PNG menu.
  await key(page.getByRole("button", { name: "PNG", exact: true }), "Enter");
  await expect(page.getByRole("menuitem").first()).toBeFocused();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.keyboard.press("Enter"),
  ]);
  expect(download.suggestedFilename()).toMatch(/^avatar-robots-.+\.png$/);

  // Copy the share link.
  await key(page.getByRole("button", { name: "Copy share link" }), "Enter");
  await expect(page.getByText("Link copied")).toBeVisible();

  // Grid: pick a frame, keep it.
  await key(page.getByRole("button", { name: "Grid view" }), "Space");
  const sheet = page.getByRole("group", { name: /Contact sheet/ });
  await key(sheet.getByRole("button").nth(2), "Enter");
  await expect(sheet.getByRole("button").nth(2)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const label = await sheet
    .getByRole("button")
    .nth(2)
    .getAttribute("aria-label");
  await key(page.getByRole("button", { name: /^Keep frame/ }), "Enter");
  await expect(hero(page)).toHaveAttribute(
    "alt",
    new RegExp(`frame ${label!.slice(6)}\\.`),
  );

  // Theme.
  await key(page.getByRole("button", { name: "Dark theme" }), "Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await context.close();
});

test("tablet: the customize sheet opens, traps focus, and Escape returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await ready(page);
  const trigger = page.getByRole("button", { name: "Customize" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let n = 0; n < 30; n++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => {
        const el = document.activeElement;
        // Base UI's focus guards hand focus straight back to the dialog's first or last control.
        return !!el?.closest("[role=dialog], [data-base-ui-focus-guard]");
      }),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("phone: part tabs and tiles work from the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await ready(page);
  const sheet = page.getByRole("region", { name: "Customize" });
  await sheet.getByRole("button", { name: "Eyes" }).focus();
  await page.keyboard.press("Enter");
  await expect(sheet.getByRole("radiogroup", { name: "Eyes" })).toBeVisible();
  const eyes = sheet.getByRole("radiogroup", { name: "Eyes" });
  const before = await eyes
    .locator('[aria-checked="true"]')
    .getAttribute("aria-label");
  await eyes.locator('[aria-checked="true"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(eyes.locator('[aria-checked="true"]')).not.toHaveAttribute(
    "aria-label",
    before!,
  );
});
