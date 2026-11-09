import type { Page } from "@playwright/test";

/** The playground first draws after boot (share link and saved locks applied): wait for it. */
export const ready = (page: Page) =>
  page.getByRole("img", { name: /Current avatar/ }).waitFor();
