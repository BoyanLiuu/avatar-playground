import type { StyleId } from "@/content/styles";
import { type RenderOptions, renderAvatar } from "@/engine/registry";
import { toDataUrl } from "@/engine/svg";
import type { Config } from "@/engine/types";

const cache = new Map<string, string>();
const LIMIT = 1000;

/**
 * An avatar as an <img> source (SVG data URL). Cached by config, so a pick re-renders only the
 * tiles whose avatar actually changed. Crops are never clipped, so their frame does not matter.
 */
export const avatarSrc = (
  id: StyleId,
  config: Config,
  { frame, flip = false, crop }: RenderOptions,
) => {
  const key = `${id}|${crop ?? frame}|${flip ? 1 : 0}|${JSON.stringify(config)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const src = toDataUrl(renderAvatar(id, config, { frame, flip, crop }));
  if (cache.size >= LIMIT) cache.delete(cache.keys().next().value as string);
  cache.set(key, src);
  return src;
};
