import type { ZodMiniType } from "zod/mini";
import type { StyleId } from "@/content/styles";
import type { Rng } from "./rng";

export type Value = string | number | boolean;
/** A style's avatar config: every field a string ID, a palette colour, a flag or a seed. */
export type Config = Record<string, Value>;

export type RenderFlags = {
  /** Leave out the background: its fill and background-only decoration (halo, grid, sparkles…). */
  transparent?: boolean;
};

/**
 * One avatar style. `render` is pure: everything random (blob wobble, robot EQ bars, spot
 * positions) is decided in `random` and stored in the config, so a config always draws the same
 * avatar. Methods (not arrow properties) so typed styles fit the shared registry type.
 */
export type StyleEngine<C extends Config = Config> = {
  id: StyleId;
  /** Validates configs from outside (URLs, pasted JSON) and from the UI. */
  schema: ZodMiniType<C>;
  /** The style's first avatar: the one the mockups show. */
  defaults: C;
  /** Hidden fields a part's lock also keeps, beyond its key and colour row. */
  linked?: Partial<Record<string, readonly (keyof C & string)[]>>;
  /** What an option tile hides so its part reads clearly. */
  preview?: Partial<Record<string, Partial<C>>>;
  /** A random config; `keep` (the locked fields) wins over every roll. */
  random(r: Rng, keep?: Partial<C>): C;
  /** The 200×200 SVG body. `uid` prefixes any ids, so inline copies never clash. */
  render(c: C, uid: string, flags?: RenderFlags): string;
};

export const defineStyle = <C extends Config>(style: StyleEngine<C>) =>
  style as unknown as StyleEngine;
