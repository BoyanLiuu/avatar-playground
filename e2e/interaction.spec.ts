import { type Browser, type Page, expect, test } from "@playwright/test";
import { ready } from "./ready";

// M2: the interactive logic against the plan's checks.

const open = async (
  browser: Browser,
  options: Parameters<Browser["newPage"]>[0] = {},
) => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    ...options,
  });
  await page.goto("/");
  await ready(page);
  return page;
};

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
const randomize = (page: Page) =>
  page.getByRole("button", { name: /^Randomize( Space)?$/ });

test("Randomize adds a frame; locked parts survive 20 rolls", async ({
  browser,
}) => {
  const page = await open(browser);
  const kept = {
    skin: await checked(page, "Skin"),
    hair: await checked(page, "Hair"),
    colour: await checked(page, "Hair colour"),
  };
  const first = await frameNo(page);
  const srcs = new Set<string>();
  for (let n = 1; n <= 20; n++) {
    await randomize(page).click();
    await expect.poll(() => frameNo(page)).toBe(first + n);
    expect(await checked(page, "Skin")).toBe(kept.skin);
    expect(await checked(page, "Hair")).toBe(kept.hair);
    expect(await checked(page, "Hair colour")).toBe(kept.colour);
    srcs.add((await hero(page).getAttribute("src"))!);
  }
  expect(srcs.size).toBeGreaterThan(15);
  // The strip shows the newest nine frames, the current one last.
  const strip = page.getByRole("group", { name: "Earlier rolls" }).first();
  await expect(strip.getByRole("button")).toHaveCount(9);
  await expect(strip.locator('[aria-current="true"]')).toHaveAccessibleName(
    `Frame ${first + 20}`,
  );
  await page.close();
});

test("a pick or swatch updates the print in under 50ms", async ({
  browser,
}) => {
  const page = await open(browser);
  const timings = await page.evaluate(async () => {
    const img = document.querySelector<HTMLImageElement>(
      'img[alt^="Current avatar"]',
    )!;
    const radios = [
      ...document.querySelectorAll<HTMLElement>(
        'aside [role="radio"][aria-checked="false"]',
      ),
    ].slice(0, 12);
    const out: number[] = [];
    for (const radio of radios) {
      const before = img.src;
      const t0 = performance.now();
      const changed = new Promise<number>((resolve) =>
        new MutationObserver((_, obs) => {
          if (img.src !== before) {
            obs.disconnect();
            resolve(performance.now() - t0);
          }
        }).observe(img, { attributes: true }),
      );
      radio.click();
      out.push(await changed);
    }
    return out;
  });
  expect(timings.length).toBeGreaterThanOrEqual(10);
  for (const t of timings) expect(t).toBeLessThan(50);
  await page.close();
});

test("a part's dice changes that part only; locks follow the toggle", async ({
  browser,
}) => {
  const page = await open(browser);
  const eyes = await checked(page, "Eyes");
  const mouth = await checked(page, "Mouth");
  await panel(page).getByRole("button", { name: "Randomize Eyes" }).click();
  expect(await checked(page, "Eyes")).not.toBe(eyes);
  expect(await checked(page, "Mouth")).toBe(mouth);

  const lock = panel(page).getByRole("button", { name: "Lock Mouth" });
  await lock.click();
  await expect(lock).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Randomize keeps")).toContainText("Mouth");
  for (let n = 0; n < 5; n++) {
    await panel(page).getByRole("button", { name: "Shuffle unlocked" }).click();
    expect(await checked(page, "Mouth")).toBe(mouth);
  }
  await lock.click();
  await expect(page.getByText("Randomize keeps")).not.toContainText("Mouth");
  await page.close();
});

test("Flip mirrors the print and shows as pressed while on", async ({
  browser,
}) => {
  const page = await open(browser);
  const flip = page.getByRole("button", { name: "Flip" });
  const src = await hero(page).getAttribute("src");
  await expect(flip).toHaveAttribute("aria-pressed", "false");
  await flip.click();
  await expect(flip).toHaveAttribute("aria-pressed", "true");
  const flipped = await hero(page).getAttribute("src");
  expect(flipped).not.toBe(src);
  expect(decodeURIComponent(flipped!)).toContain("matrix(-1 0 0 1 200 0)");
  // It stays flipped across rolls, and toggles back.
  await randomize(page).click();
  await expect(flip).toHaveAttribute("aria-pressed", "true");
  await flip.click();
  await expect(flip).toHaveAttribute("aria-pressed", "false");
  expect(
    decodeURIComponent((await hero(page).getAttribute("src"))!),
  ).not.toContain("matrix(-1");
  await page.close();
});

test("switching Flat → Robots → Flat brings back the same avatar and locks", async ({
  browser,
}) => {
  const page = await open(browser);
  const rail = page.getByRole("navigation", { name: "Styles" });
  await randomize(page).click();
  await panel(page).getByRole("button", { name: "Lock Eyes" }).click();
  const src = await hero(page).getAttribute("src");
  await rail.getByRole("button", { name: /Robots/ }).click();
  await expect(panel(page)).toContainText("Robots · 6 parts");
  await randomize(page).click();
  await rail.getByRole("button", { name: /Flat Cartoon/ }).click();
  await expect(hero(page)).toHaveAttribute("src", src!);
  await expect(
    panel(page).getByRole("button", { name: "Lock Eyes" }),
  ).toHaveAttribute("aria-pressed", "true");
  // The rail thumbnail is the style's current avatar.
  await expect(
    rail.getByRole("button", { name: /Flat Cartoon/ }).locator("img"),
  ).toHaveAttribute("src", src!);
  await page.close();
});

test("Space rolls only when no control has focus and never on key repeat; 1–6 switch style", async ({
  browser,
}) => {
  const page = await open(browser);
  const first = await frameNo(page);
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.keyboard.press("Space");
  await expect.poll(() => frameNo(page)).toBe(first + 1);

  // Held down: the repeats are ignored.
  await page.keyboard.down("Space");
  await page.keyboard.down("Space");
  await page.keyboard.down("Space");
  await page.keyboard.up("Space");
  await expect.poll(() => frameNo(page)).toBe(first + 2);

  // A focused control keeps Space for itself.
  await panel(page)
    .getByRole("radiogroup", { name: "Mouth" })
    .locator('[aria-checked="true"]')
    .focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(100);
  expect(await frameNo(page)).toBe(first + 2);

  await page.keyboard.press("3");
  await expect(panel(page)).toContainText("Robots · 6 parts");
  await page.keyboard.press("6");
  await expect(panel(page)).toContainText("Geometric · 6 parts");
  await page.close();
});

test("Grid: twelve frames keep the locks; pick one and keep it", async ({
  browser,
}) => {
  const page = await open(browser);
  const skin = await checked(page, "Skin");
  await page.getByRole("button", { name: "Grid view" }).click();
  const sheet = page.getByRole("group", { name: /Contact sheet/ });
  const frames = sheet.getByRole("button");
  await expect(frames).toHaveCount(12);
  const keep = page.getByRole("button", { name: /^Keep frame/ });
  await expect(keep).toBeDisabled();

  const srcs = await sheet
    .locator("img")
    .evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src));
  expect(new Set(srcs).size).toBe(12);
  await frames.nth(4).click();
  await expect(frames.nth(4)).toHaveAttribute("aria-pressed", "true");
  const label = (await frames.nth(4).getAttribute("aria-label"))!;
  await expect(keep).toHaveText(`Keep ${label.toLowerCase()}`);

  // A new sheet re-rolls every frame and clears the pick.
  await page.getByRole("button", { name: /Roll new sheet/ }).click();
  await expect(keep).toBeDisabled();
  await frames.nth(4).click();
  const picked = await sheet.locator("img").nth(4).getAttribute("src");
  await keep.click();

  await expect(
    page.getByRole("button", { name: "Single view" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(hero(page)).toHaveAttribute("src", picked!);
  await expect(hero(page)).toHaveAttribute("alt", new RegExp(label.slice(6)));
  expect(await checked(page, "Skin")).toBe(skin);
  await page.close();
});

/** Every running animation the page started (named), with what it animates. */
const animations = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.id)
      .map((a) => ({
        id: a.id,
        target: (a.effect as KeyframeEffect).target?.outerHTML.slice(0, 60),
        props: Object.keys(
          (a.effect as KeyframeEffect).getKeyframes()[0] ?? {},
        ).filter(
          (k) =>
            !["offset", "easing", "composite", "computedOffset"].includes(k),
        ),
      })),
  );

test("rapid rolls restart the motion instead of queueing it", async ({
  browser,
}) => {
  const page = await open(browser);
  for (let n = 0; n < 8; n++) await randomize(page).click({ delay: 0 });
  // At most one running animation of each kind per element.
  const most = await page.evaluate(() => {
    const seen = new Map<Element, Map<string, number>>();
    for (const a of document.getAnimations()) {
      const el = (a.effect as KeyframeEffect).target;
      if (!a.id || !el) continue;
      const ids = seen.get(el) ?? new Map<string, number>();
      ids.set(a.id, (ids.get(a.id) ?? 0) + 1);
      seen.set(el, ids);
    }
    return Math.max(0, ...[...seen.values()].flatMap((m) => [...m.values()]));
  });
  expect(most).toBe(1);
  await page.screenshot({ path: "test-results/m2-roll-mid.png" });
  await page.close();
});

test("the roll: the print develops, the strip advances, the loop draws", async ({
  browser,
}) => {
  const page = await open(browser);
  await randomize(page).click();
  const ids = new Set((await animations(page)).map((a) => a.id));
  for (const id of ["print", "shift", "land", "draw"])
    expect(ids).toContain(id);
  await page.close();
});

test("reduced motion: nothing slides or draws, every change still fades", async ({
  browser,
}) => {
  const page = await open(browser, { reducedMotion: "reduce" });
  await randomize(page).click();
  let running = await animations(page);
  expect(running.length).toBeGreaterThan(0);
  for (const a of running) expect(a.props).toEqual(["opacity"]);

  await panel(page).getByRole("button", { name: "Lock Eyes" }).click();
  await panel(page)
    .getByRole("radiogroup", { name: "Mouth" })
    .locator('[aria-checked="false"]')
    .first()
    .click();
  running = await animations(page);
  expect(running.length).toBeGreaterThan(0);
  for (const a of running) expect(a.props).toEqual(["opacity"]);

  await page.getByRole("button", { name: "Grid view" }).click();
  const names = await page.evaluate(() =>
    document
      .getAnimations()
      .map((a) => (a as CSSAnimation).animationName)
      .filter(Boolean),
  );
  expect(names).toContain("fade-in");
  expect(names).not.toContain("sheet-in");
  await page.close();
});
