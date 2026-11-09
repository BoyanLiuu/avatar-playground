import { readFile } from "node:fs/promises";
import { type Browser, type Page, expect, test } from "@playwright/test";

// M4: export. Runs in Chromium, Firefox and WebKit (see playwright.config.ts). Downloads and
// canvas reads are slow in Firefox under parallel load, so these tests get more time.
test.describe.configure({ timeout: 90_000 });

/** Wait until the playground has booted (shortcuts and clicks only work after it). */
const hydrated = (page: Page) =>
  page.getByRole("button", { name: /^Randomize( Space)?$/ }).waitFor();

const open = async (browser: Browser, path = "/") => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    acceptDownloads: true,
  });
  const page = await context.newPage();
  await page.goto(path);
  await hydrated(page);
  return { page, context };
};

const hero = (page: Page) => page.getByRole("img", { name: /Current avatar/ });
const STYLE_NAMES = [
  "Flat Cartoon",
  "Pixel Art",
  "Robots",
  "Line Doodle",
  "Monsters",
  "Geometric",
];

/** Switch style from the rail and wait until the panel shows it. */
const pickStyle = async (page: Page, n: number) => {
  const name = STYLE_NAMES[n - 1];
  await page
    .getByRole("navigation", { name: "Styles" })
    .getByRole("button", { name: new RegExp(name) })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Customize" }),
  ).toContainText(name);
};

const pngMenu = (page: Page) =>
  page.getByRole("button", { name: "PNG", exact: true });

/** Download through the PNG menu; returns the file name and bytes. */
const fromMenu = async (page: Page, item: string | RegExp) => {
  await pngMenu(page).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("menuitem", { name: item }).click(),
  ]);
  return {
    name: download.suggestedFilename(),
    bytes: await readFile((await download.path())!),
  };
};

const pngSize = (bytes: Buffer) => {
  expect(bytes.subarray(1, 4).toString()).toBe("PNG");
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
};

/** Pixels of an image (data URL) drawn at `size`, optionally over white. */
const pixelsOf = (page: Page, src: string, size: number, white = false) =>
  page.evaluate(
    async ({ src, size, white }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      if (white) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, size, size);
      }
      ctx.drawImage(img, 0, 0, size, size);
      return [...ctx.getImageData(0, 0, size, size).data];
    },
    { src, size, white },
  );

const dataUrl = (bytes: Buffer, type = "image/png") =>
  `data:${type};base64,${bytes.toString("base64")}`;

test("PNG sizes, file names, and the PNG matches the print in every style", async ({
  browser,
}) => {
  const { page, context } = await open(browser);
  await pngMenu(page).click();
  await expect(page.getByRole("menuitem", { name: /^PNG/ })).toHaveText([
    "PNG · 256 × 256",
    "PNG · 512 × 512",
    "PNG · 1024 × 1024",
  ]);
  await page.keyboard.press("Escape");
  for (const px of [256, 1024]) {
    const file = await fromMenu(page, `PNG · ${px} × ${px}`);
    expect(file.name).toBe("avatar-flat-4f2a9c.png");
    expect(pngSize(file.bytes)).toEqual([px, px]);
  }

  // Every style: the 512px PNG over the white print looks like the print itself (frame clip,
  // Robots' glow filter, Monsters' clip paths, Geometric's split).
  for (const n of [1, 2, 3, 4, 5, 6]) {
    await pickStyle(page, n);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    const file = await fromMenu(page, /^PNG · 5\d\d|^PNG · 400/);
    const shot = await hero(page).screenshot({ animations: "disabled" });
    const a = await pixelsOf(page, dataUrl(file.bytes), 104, true);
    const b = await pixelsOf(page, dataUrl(shot), 104, true);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff += Math.abs(a[i] - b[i]);
    expect(diff / a.length, STYLE_NAMES[n - 1]).toBeLessThan(4);
  }
  await context.close();
});

test("transparent background: no background, the frame corners clear, the avatar opaque", async ({
  browser,
}) => {
  const { page, context } = await open(browser);
  await pngMenu(page).click();
  await page
    .getByRole("menuitemcheckbox", { name: "Transparent background" })
    .click();
  await expect(
    page.getByRole("menuitemcheckbox", { name: "Transparent background" }),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  const file = await fromMenu(page, "PNG · 256 × 256");
  const px = await pixelsOf(page, dataUrl(file.bytes), 256);
  const alpha = (x: number, y: number) => px[(y * 256 + x) * 4 + 3];
  expect(alpha(2, 2)).toBe(0); // frame corner
  expect(alpha(128, 20)).toBe(0); // background above the bun
  expect(alpha(128, 120)).toBe(255); // the face

  const svg = await fromMenu(page, "SVG");
  expect(svg.bytes.toString()).not.toContain('fill="#E6E0FF"');
  await context.close();
});

test("Pixel Art: whole-pixel sizes with crisp edges", async ({ browser }) => {
  const { page, context } = await open(browser);
  await pickStyle(page, 2);
  await pngMenu(page).click();
  await expect(page.getByRole("menuitem", { name: /^PNG/ })).toHaveText([
    "PNG · 200 × 200",
    "PNG · 400 × 400",
    "PNG · 800 × 800",
    "PNG · 1000 × 1000",
  ]);
  await page.keyboard.press("Escape");
  const file = await fromMenu(page, "PNG · 400 × 400");
  expect(file.name).toBe("avatar-pixel-91c0de.png");
  expect(pngSize(file.bytes)).toEqual([400, 400]);
  // Crisp: a handful of flat colours, no blended edge pixels.
  const px = await pixelsOf(page, dataUrl(file.bytes), 400);
  const colours = new Set<string>();
  for (let i = 0; i < px.length; i += 4)
    if (px[i + 3] === 255) colours.add(px.slice(i, i + 3).join());
  expect(colours.size).toBeLessThan(20);
  await context.close();
});

test("SVG download is self-contained and opens as an image", async ({
  browser,
}) => {
  const { page, context } = await open(browser, "/");
  await pickStyle(page, 3);
  const file = await fromMenu(page, "SVG");
  expect(file.name).toBe("avatar-robots-b07a11.svg");
  const svg = file.bytes.toString();
  expect(svg).toMatch(
    /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="512"/,
  );
  expect(svg).not.toMatch(/<script|href=/);
  const size = await page.evaluate(
    async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    },
    dataUrl(file.bytes, "image/svg+xml"),
  );
  expect(size).toEqual([512, 512]);
  await context.close();
});

test("a shared frame is named by its number; the phone saves a 512px PNG", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  // A valid link for the default Robot, flipped (so it opens as a new frame: frame 10).
  await page.goto("/");
  await hydrated(page);
  const search = await page.evaluate(() => {
    const c = btoa(
      JSON.stringify({
        bg: "#1F2A44",
        metal: "#F2C14E",
        glow: "#5CF2FF",
        head: "soft",
        eyes: "round",
        mouth: "eq",
        ant: "ball",
        wobble: 2483,
      }),
    ).replace(/=+$/, "");
    return `?s=robots&v=1&c=${c}&m=1`;
  });
  await page.goto(search);
  await hydrated(page);
  await expect(hero(page)).toHaveAttribute("alt", /frame 10/);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download PNG" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("avatar-robots-frame10.png");
  expect(pngSize(await readFile((await download.path())!))).toEqual([512, 512]);
  await context.close();
});

test("Copy SVG copies the avatar and says so", async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "clipboard permissions are Chromium-only",
  );
  const { page, context } = await open(browser);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy SVG" }).click();
  await expect(page.getByText("SVG copied")).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toMatch(
    /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="512"/,
  );
  expect(text).toContain('fill="#E6E0FF"');
  await context.close();
});
