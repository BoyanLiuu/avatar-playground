import {
  type Frame,
  type Section,
  type StyleId,
  getStyle,
} from "@/content/styles";
import { makeRng, seedNumber } from "./rng";
import { doodle } from "./styles/doodle";
import { flat } from "./styles/flat";
import { geometric } from "./styles/geometric";
import { monsters } from "./styles/monsters";
import { pixel } from "./styles/pixel";
import { robots } from "./styles/robots";
import { wrapSvg } from "./svg";
import type { Config, StyleEngine } from "./types";

export const ENGINES: Record<StyleId, StyleEngine> = {
  flat,
  pixel,
  robots,
  doodle,
  monsters,
  geometric,
};

/** The config fields a part controls: its key, its colour row and any linked hidden fields. */
export const fieldsOf = (id: StyleId, section: Section) => [
  section.key,
  ...(section.kind === "tiles" && section.sub ? [section.sub.key] : []),
  ...(ENGINES[id].linked?.[section.key] ?? []),
];

/** What Randomize keeps: every field of every locked part, from the current config. */
export const keepOf = (
  id: StyleId,
  config: Config,
  locks: readonly string[],
): Partial<Config> => {
  const keep: Partial<Config> = {};
  for (const section of getStyle(id).sections)
    if (locks.includes(section.key))
      for (const field of fieldsOf(id, section)) keep[field] = config[field];
  return keep;
};

/** The current avatar with one part set to `option`, as that option's tile shows it. */
export const withOption = (
  id: StyleId,
  config: Config,
  key: string,
  option: string,
): Config => ({
  ...config,
  ...(ENGINES[id].preview?.[key] as Config | undefined),
  [key]: option,
});

export const SHEET_SIZE = 12;

/** A contact sheet: twelve rolls from one seed that all keep the locked parts. */
export const rollSheet = (id: StyleId, seed: string, keep: Partial<Config>) => {
  const r = makeRng(seedNumber(seed));
  return Array.from({ length: SHEET_SIZE }, () => ENGINES[id].random(r, keep));
};

export type RenderOptions = { frame: Frame; flip?: boolean; crop?: string };

/** A standalone SVG of the avatar. */
export const renderAvatar = (
  id: StyleId,
  config: Config,
  opts: RenderOptions,
  uid = "av",
) => wrapSvg(ENGINES[id].render(config, uid), { ...opts, uid });
