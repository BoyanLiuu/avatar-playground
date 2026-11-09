import { expect, test } from "@playwright/test";
import { ready } from "./ready";

// M5: the static export works from a plain static file server (the e2e server is one:
// `python3 -m http.server` over out/). Every asset loads with the right type.

test("icons and the share card are real files with the right types", async ({
  request,
}) => {
  const icon = await request.get("/icon.svg");
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");
  expect(await icon.text()).toMatch(
    /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="32"/,
  );

  for (const [path, w, h] of [
    ["/apple-icon.png", 180, 180],
    ["/opengraph-image.png", 1200, 630],
  ] as const) {
    const res = await request.get(path);
    expect(res.headers()["content-type"]).toBe("image/png");
    const png = await res.body();
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([w, h]);
  }

  const html = await (await request.get("/")).text();
  expect(html).toContain(
    '<link rel="icon" href="/icon.svg" type="image/svg+xml"/>',
  );
  expect(html).toMatch(
    /<meta property="og:image" content="[^"]+\/opengraph-image\.png"/,
  );
  expect(html).toContain(
    '<meta name="twitter:card" content="summary_large_image"/>',
  );
});

test("the page loads every asset and runs from static files", async ({
  page,
}) => {
  const failed: string[] = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });
  page.on("pageerror", (e) => failed.push(e.message));
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: /^Randomize( Space)?$/ }).click();
  expect(failed).toEqual([]);
});
