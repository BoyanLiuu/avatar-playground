import type { Page } from "@playwright/test";

/**
 * The playground first draws after boot (share link and saved locks applied); until then the
 * loading print shows. Wait for the real stage: its Randomize button exists only there.
 */
export const ready = (page: Page) =>
  page.getByRole("button", { name: /^Randomize( Space)?$/ }).waitFor();
