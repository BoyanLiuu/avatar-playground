import { type Browser, type Page, expect, test } from "@playwright/test";
import { ready } from "./ready";

// M3.2: the URL describes the current avatar; links are validated before anything is drawn.

const open = async (browser: Browser, path = "/") => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(path);
  await ready(page);
  return { page, context, errors };
};

const hero = (page: Page) => page.getByRole("img", { name: /Current avatar/ });
const panel = (page: Page) =>
  page.getByRole("complementary", { name: "Customize" });
const randomize = (page: Page) =>
  page.getByRole("button", { name: /^Randomize( Space)?$/ });
const linkOf = (page: Page) =>
  page.evaluate(() => location.search).then((s) => new URLSearchParams(s));

test("the URL follows the avatar; a reload brings back the same avatar", async ({
  browser,
}) => {
  const { page, context, errors } = await open(browser);
  expect(await page.evaluate(() => location.search)).toBe("");
  const entries = await page.evaluate(() => history.length);

  await page.keyboard.press("3");
  await randomize(page).click();
  await panel(page)
    .getByRole("radiogroup", { name: "Frame shape" })
    .getByRole("radio", { name: "Circle" })
    .click();
  await page.getByRole("button", { name: "Flip" }).click();
  await expect.poll(async () => (await linkOf(page)).get("m")).toBe("1");
  const link = await linkOf(page);
  expect(link.get("s")).toBe("robots");
  expect(link.get("v")).toBe("1");
  expect(link.get("f")).toBe("circle");
  const src = await hero(page).getAttribute("src");

  await page.reload();

  await ready(page);
  await expect(panel(page)).toContainText("Robots · 6 parts");
  await expect(hero(page)).toHaveAttribute("src", src!);
  await expect(page.getByText(/Frame\s*\d+\s*·\s*shared/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Flip" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  // The link only replaces the history entry: Back does not step through rolls.
  expect(await page.evaluate(() => history.length)).toBe(entries);
  expect(errors).toEqual([]);
  await context.close();
});

test("the copied link shows the identical avatar in a fresh browser", async ({
  browser,
}) => {
  const { page, context } = await open(browser);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.keyboard.press("5");
  for (let n = 0; n < 3; n++) await randomize(page).click();
  const src = await hero(page).getAttribute("src");

  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.getByText("Link copied")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(await page.evaluate(() => location.href));

  const other = await open(browser, new URL(copied).search);
  await expect(panel(other.page)).toContainText("Monsters · 5 parts");
  await expect(hero(other.page)).toHaveAttribute("src", src!);
  await context.close();
  await other.context.close();
});

test("a shared link draws only the shared avatar: no default first, then a swap", async ({
  browser,
  request,
}) => {
  // The server page holds one avatar, the first one, in the loading print (hidden on a link).
  const html = await (await request.get("/")).text();
  expect(html.match(/data:image\/svg\+xml/g)).toHaveLength(1);
  expect(html).toContain("Developing");

  const { page, context } = await open(browser);
  await page.keyboard.press("3");
  await randomize(page).click();
  await expect.poll(async () => (await linkOf(page)).get("s")).toBe("robots");
  const url = await page.evaluate(() => location.href);
  const shared = await hero(page).getAttribute("src");

  // Fresh page: record every image the hero ever shows, from the first byte.
  const fresh = await context.newPage();
  await fresh.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __heroes: string[] }).__heroes = seen;
    new MutationObserver(() => {
      for (const img of document.querySelectorAll<HTMLImageElement>(
        'img[alt^="Current avatar"]',
      ))
        if (img.checkVisibility() && seen.at(-1) !== img.src)
          seen.push(img.src);
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });
  });
  await fresh.goto(url);
  await ready(fresh);
  await fresh.waitForTimeout(300);
  const heroes = await fresh.evaluate(
    () => (window as unknown as { __heroes: string[] }).__heroes,
  );
  expect(heroes).toEqual([shared]);
  await context.close();
});

const b64 = (text: string) => Buffer.from(text).toString("base64url");

test("broken, old or malicious links never crash and fall back to a fresh avatar", async ({
  browser,
}) => {
  const bad = [
    "?s=robots&v=1&c=%%%",
    "?s=robots&v=2&c=eyJ9",
    "?s=cats&v=1&c=eyJ9",
    `?s=robots&v=1&c=${b64('{"bg":"\\"/><script>window.__pwned=1</script>"}')}`,
    `?s=robots&v=1&c=${b64(JSON.stringify({ bg: "#1F2A44", onload: "alert(1)" }))}`,
    `?s=robots&v=1&c=${"A".repeat(5000)}`,
    "?s=robots&v=1&f=hexagon",
  ];
  for (const search of bad) {
    const { page, context, errors } = await open(browser, search);
    await expect(
      page.getByText("That link didn’t work, so here’s a fresh avatar."),
    ).toBeVisible();
    await expect(hero(page)).toBeVisible();
    const style = search.startsWith("?s=cats") ? "Flat Cartoon" : "Robots";
    await expect(panel(page)).toContainText(style);
    // The address bar now holds the fresh avatar's valid link.
    const link = await linkOf(page);
    expect(link.get("v")).toBe("1");
    expect(await page.evaluate(() => location.search)).not.toBe(search);
    expect(await page.evaluate(() => "__pwned" in window), search).toBe(false);
    expect(errors, search).toEqual([]);
    await context.close();
  }
});

test("the wordmark goes home: a fresh start and a clean address, locks kept", async ({
  browser,
}) => {
  const { page, context } = await open(browser);
  await page.keyboard.press("3");
  await randomize(page).click();
  await page
    .getByRole("complementary", { name: "Customize" })
    .getByRole("button", { name: "Lock Head" })
    .click();
  await expect.poll(async () => (await linkOf(page)).get("s")).toBe("robots");

  await page.getByRole("link", { name: "Avatar Playground" }).click();
  await ready(page);
  expect(await page.evaluate(() => location.pathname + location.search)).toBe(
    "/",
  );
  await expect(hero(page)).toHaveAttribute(
    "alt",
    /^Current avatar: Flat Cartoon, frame 1\./,
  );
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();
  await page.keyboard.press("3");
  await expect(hero(page)).toHaveAttribute("alt", /Robots, frame 1\./);
  await expect(
    page
      .getByRole("complementary", { name: "Customize" })
      .getByRole("button", { name: "Lock Head" }),
  ).toHaveAttribute("aria-pressed", "true");
  // Any other avatar gets its link; the home avatar keeps the address clean.
  await expect.poll(async () => (await linkOf(page)).get("s")).toBe("robots");
  await page.keyboard.press("1");
  await expect.poll(() => page.evaluate(() => location.search)).toBe("");
  await context.close();
});
