// Opens the share link at boot (./boot.ts) and keeps the address bar on the current avatar's link
// (./url.ts). replaceState, not pushState, so Back does not step through rolls; debounced,
// because Safari throws after 100 history updates in 30 seconds.
import { toast } from "sonner";
import { getStyle } from "@/content/styles";
import { ENGINES } from "@/engine/registry";
import { currentShot, usePlayground } from "./playground";
import { type SharedAvatar, decodeLink, linkSearch, withoutLink } from "./url";

const DEBOUNCE = 300;

export const currentAvatar = (): SharedAvatar => {
  const s = usePlayground.getState();
  const m = s.memory[s.styleId];
  return {
    id: s.styleId,
    config: currentShot(m).config,
    frame: m.present.frame,
    flip: m.present.flip,
  };
};

/** The avatar the plain address opens with: no link is needed to share it. */
const isHome = ({ id, config, frame, flip }: SharedAvatar) =>
  id === "flat" &&
  frame === getStyle("flat").frame &&
  !flip &&
  JSON.stringify(config) === JSON.stringify(ENGINES.flat.defaults);

/** The query string for the current avatar: its link, or none for the home avatar. */
const currentSearch = () => {
  const avatar = currentAvatar();
  return isHome(avatar)
    ? withoutLink(location.search)
    : linkSearch(avatar, location.search);
};

/** The full share link of the current avatar. */
export const shareUrl = () =>
  `${location.origin}${location.pathname}${currentSearch()}${location.hash}`;

/** Put the current avatar's link in the address bar now (a clean address for the home avatar). */
export const writeLink = () => {
  const search = currentSearch();
  if (search !== location.search)
    window.history.replaceState(
      null,
      "",
      `${location.pathname}${search}${location.hash}`,
    );
};

/** Open the link in the URL, if any (once, at boot); a bad one falls back with a toast. */
export const openLinkFromUrl = () => {
  const link = decodeLink(location.search);
  const store = usePlayground.getState();
  if (link.kind === "ok") store.openShared(link.avatar);
  if (link.kind === "bad") {
    store.rollStyle(link.id);
    toast("That link didn’t work, so here’s a fresh avatar.", {
      duration: 4000,
    });
  }
  // An opened link is rewritten in canonical form; a bad one is replaced.
  if (link.kind !== "none") writeLink();
};

/** Keep the address bar on the current avatar; returns the unsubscribe. */
export const syncLinkOnChange = () => {
  let last = linkSearch(currentAvatar());
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flush = () => {
    clearTimeout(timer);
    timer = undefined;
    writeLink();
  };
  const unsubscribe = usePlayground.subscribe(() => {
    const now = linkSearch(currentAvatar());
    if (now === last) return;
    last = now;
    clearTimeout(timer);
    timer = setTimeout(flush, DEBOUNCE);
  });
  const onHide = () => {
    if (timer !== undefined) flush();
  };
  window.addEventListener("pagehide", onHide);
  return () => {
    unsubscribe();
    window.removeEventListener("pagehide", onHide);
    clearTimeout(timer);
  };
};
