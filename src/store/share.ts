"use client";

// Keeps the address bar on the current avatar's share link (./url.ts) and opens a link on load.
// replaceState, not pushState, so Back does not step through rolls; debounced, because Safari
// throws after 100 history updates in 30 seconds.
import { useEffect } from "react";
import { toast } from "sonner";
import { withoutMotion } from "@/lib/motion";
import { currentShot, usePlayground } from "./playground";
import { type SharedAvatar, decodeLink, linkSearch } from "./url";

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

/** The full share link of the current avatar. */
export const shareUrl = () =>
  `${location.origin}${location.pathname}${linkSearch(currentAvatar(), location.search)}${location.hash}`;

/** Put the current avatar's link in the address bar now. */
export const writeLink = () => {
  const search = linkSearch(currentAvatar(), location.search);
  if (search !== location.search)
    window.history.replaceState(
      null,
      "",
      `${location.pathname}${search}${location.hash}`,
    );
};

export const useShareLink = () =>
  useEffect(() => {
    const link = decodeLink(location.search);
    const store = usePlayground.getState();
    if (link.kind === "ok") withoutMotion(() => store.openShared(link.avatar));
    if (link.kind === "bad") {
      withoutMotion(() => store.rollStyle(link.id));
      toast("That link didn’t work, so here’s a fresh avatar.", {
        duration: 4000,
      });
    }
    // An opened link is rewritten in canonical form; a bad one is replaced.
    if (link.kind !== "none") writeLink();

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
  }, []);
