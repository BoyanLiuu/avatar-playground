// Share links: the URL describes the current avatar exactly.
//   ?s=<style>&v=1&c=<base64url(JSON config)>[&f=<frame shape>][&m=1]
// `f` only when the shape is not the style's default, `m=1` only when mirrored. Locks and the
// film stay local. Decoding trusts nothing: the style and version must be known, `c` must be
// short base64url JSON, and the style's strict schema must accept it. Only the parsed result is
// ever rendered.
import { type Frame, STYLES, type StyleId, getStyle } from "@/content/styles";
import { ENGINES } from "@/engine/registry";
import type { Config } from "@/engine/types";

export const LINK_VERSION = "1";
const KEYS = ["s", "v", "c", "f", "m"] as const;
const FRAMES: readonly Frame[] = ["circle", "squircle", "square"];
/** Longest accepted `c` (the longest real config is ~400 characters). */
const MAX_PAYLOAD = 2048;

export type SharedAvatar = {
  id: StyleId;
  config: Config;
  frame: Frame;
  flip: boolean;
};

export type DecodedLink =
  /** No share link in the URL. */
  | { kind: "none" }
  | { kind: "ok"; avatar: SharedAvatar }
  /** A link that failed a check; `id` is its style when that much was valid. */
  | { kind: "bad"; id: StyleId };

const toBase64Url = (text: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");

const fromBase64Url = (code: string) => {
  const b64 = code.replaceAll("-", "+").replaceAll("_", "/");
  const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
};

/** The link's query string for an avatar, keeping any unrelated parameters of `search`. */
export const linkSearch = (avatar: SharedAvatar, search = "") => {
  const params = new URLSearchParams(search);
  for (const key of KEYS) params.delete(key);
  params.set("s", avatar.id);
  params.set("v", LINK_VERSION);
  params.set("c", toBase64Url(JSON.stringify(avatar.config)));
  if (avatar.frame !== getStyle(avatar.id).frame) params.set("f", avatar.frame);
  if (avatar.flip) params.set("m", "1");
  return `?${params}`;
};

/** The search string with the share link removed (other parameters stay). */
export const withoutLink = (search: string) => {
  const params = new URLSearchParams(search);
  for (const key of KEYS) params.delete(key);
  const rest = params.toString();
  return rest ? `?${rest}` : "";
};

export const decodeLink = (search: string): DecodedLink => {
  const params = new URLSearchParams(search);
  if (!KEYS.some((key) => params.has(key))) return { kind: "none" };
  const id = STYLES.find((s) => s.id === params.get("s"))?.id;
  const bad = { kind: "bad", id: id ?? "flat" } as const;
  if (!id || params.get("v") !== LINK_VERSION) return bad;

  const code = params.get("c") ?? "";
  if (!code || code.length > MAX_PAYLOAD || !/^[A-Za-z0-9_-]+$/.test(code))
    return bad;
  let json: unknown;
  try {
    json = JSON.parse(fromBase64Url(code));
  } catch {
    return bad;
  }
  const config = ENGINES[id].schema.safeParse(json);
  if (!config.success) return bad;

  const f = params.get("f");
  const frame = f === null ? getStyle(id).frame : FRAMES.find((x) => x === f);
  const m = params.get("m");
  if (!frame || (m !== null && m !== "1")) return bad;
  return {
    kind: "ok",
    avatar: { id, config: config.data, frame, flip: m === "1" },
  };
};
