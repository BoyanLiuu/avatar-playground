import { type Browser, type Page, expect, test } from "@playwright/test";

// M3.1: history (undo, redo, restore) and locks that survive a reload.

const open = async (browser: Browser) => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto("/");
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
const strip = (page: Page) =>
  page.getByRole("group", { name: "Earlier rolls" }).first();
const undoButton = (page: Page) => page.getByRole("button", { name: "Undo" });
const redoButton = (page: Page) => page.getByRole("button", { name: "Redo" });

test("undo and redo: buttons and ⌘Z / ⇧⌘Z step through rolls and picks", async ({
  browser,
}) => {
  const page = await open(browser);
  await expect(undoButton(page)).toBeDisabled();
  await expect(redoButton(page)).toBeDisabled();

  await randomize(page).click();
  await randomize(page).click();
  const mouth = await checked(page, "Mouth");
  await panel(page)
    .getByRole("radiogroup", { name: "Mouth" })
    .locator('[aria-checked="false"]')
    .first()
    .click();
  expect(await checked(page, "Mouth")).not.toBe(mouth);
  await expect(undoButton(page)).toBeEnabled();

  await page.keyboard.press("ControlOrMeta+z");
  expect(await checked(page, "Mouth")).toBe(mouth);
  expect(await frameNo(page)).toBe(11);
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => frameNo(page)).toBe(10);
  await expect(
    strip(page).getByRole("button", { name: "Frame 11" }),
  ).toHaveCount(0);
  await expect(redoButton(page)).toBeEnabled();

  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect.poll(() => frameNo(page)).toBe(11);
  await redoButton(page).click();
  await expect.poll(() => checked(page, "Mouth")).not.toBe(mouth);
  await expect(redoButton(page)).toBeDisabled();
  await undoButton(page).click();
  expect(await checked(page, "Mouth")).toBe(mouth);
  await page.close();
});

test("undo keeps 50 steps", async ({ browser }) => {
  const page = await open(browser);
  // Real key events, dispatched in bulk so 165 of them stay quick.
  type Key = {
    key: string;
    code: string;
    metaKey?: boolean;
    shiftKey?: boolean;
  };
  const press = (count: number, init: Key) =>
    page.evaluate(
      ({ n, opts }) => {
        for (let k = 0; k < n; k++)
          document.body.dispatchEvent(
            new KeyboardEvent("keydown", { bubbles: true, ...opts }),
          );
      },
      { n: count, opts: init },
    );
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await press(55, { key: " ", code: "Space" });
  await expect.poll(() => frameNo(page)).toBe(64);
  await press(55, { key: "z", code: "KeyZ", metaKey: true });
  await expect(undoButton(page)).toBeDisabled();
  expect(await frameNo(page)).toBe(14);
  await press(55, { key: "z", code: "KeyZ", metaKey: true, shiftKey: true });
  await expect.poll(() => frameNo(page)).toBe(64);
  await expect(redoButton(page)).toBeDisabled();
  await page.close();
});

test("clicking an earlier frame restores it: the loop and the print move there", async ({
  browser,
}) => {
  const page = await open(browser);
  await randomize(page).click();
  const frame5 = strip(page).getByRole("button", { name: "Frame 5" });
  const src = await frame5.locator("img").getAttribute("src");
  await frame5.click();
  await expect(frame5).toHaveAttribute("aria-current", "true");
  await expect(strip(page).locator('[aria-current="true"]')).toHaveCount(1);
  await expect(hero(page)).toHaveAttribute("src", src!);
  expect(await frameNo(page)).toBe(5);
  await expect(page.getByText(/Frame\s*5\s*·\s*seed/)).toBeVisible();

  // Edits change the restored frame; undo goes back through them.
  await panel(page).getByRole("button", { name: "Randomize Eyes" }).click();
  await expect(frame5.locator("img")).not.toHaveAttribute("src", src!);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(frame5.locator("img")).toHaveAttribute("src", src!);
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => frameNo(page)).toBe(10);
  await page.close();
});

test("shortcuts are ignored while an input or a menu has focus", async ({
  browser,
}) => {
  const page = await open(browser);
  await randomize(page).click();
  await page.evaluate(() => {
    const input = document.createElement("input");
    input.id = "probe";
    document.body.append(input);
    const menu = document.createElement("div");
    menu.id = "menu";
    menu.setAttribute("role", "menu");
    menu.tabIndex = -1;
    document.body.append(menu);
  });
  for (const id of ["#probe", "#menu"]) {
    await page.locator(id).focus();
    await page.keyboard.press("ControlOrMeta+z");
    await page.keyboard.press("Space");
    await page.keyboard.press("2");
    await page.waitForTimeout(100);
    expect(await frameNo(page)).toBe(10);
    await expect(panel(page)).toContainText("Flat Cartoon");
  }
  await page.close();
});

test("locks survive a reload, and restoring them draws nothing", async ({
  browser,
}) => {
  const page = await open(browser);
  // Record every animation the page starts.
  await page.addInitScript(() => {
    const ids: string[] = [];
    (window as unknown as { __anims: string[] }).__anims = ids;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (typeof options === "object" && options?.id) ids.push(options.id);
      return animate.call(this, keyframes, options);
    };
  });
  await panel(page).getByRole("button", { name: "Lock Eyes" }).click();
  await panel(page).getByRole("button", { name: "Lock Skin" }).click();
  await page.keyboard.press("3");
  await panel(page).getByRole("button", { name: "Lock Head" }).click();
  await page.keyboard.press("1");

  await page.reload();
  await page.waitForTimeout(400);
  const lock = (name: string) => panel(page).getByRole("button", { name });
  await expect(lock("Lock Eyes")).toHaveAttribute("aria-pressed", "true");
  await expect(lock("Lock Skin")).toHaveAttribute("aria-pressed", "false");
  await expect(lock("Lock Hair")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Randomize keeps")).toContainText("Eyes");
  await expect(page.getByText("Randomize keeps")).not.toContainText("Skin");
  expect(
    await page.evaluate(
      () => (window as unknown as { __anims: string[] }).__anims,
    ),
  ).toEqual([]);

  await page.keyboard.press("3");
  await expect(lock("Lock Head")).toHaveAttribute("aria-pressed", "true");
  await expect(lock("Lock Body colour")).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // Bad saved data is ignored.
  await page.evaluate(() =>
    localStorage.setItem("avatar-locks", '{"v":1,"locks":{"flat":"oops"}}'),
  );
  await page.reload();
  await expect(lock("Lock Skin")).toHaveAttribute("aria-pressed", "true");
  await page.close();
});
