"use client";

// Boot: before the playground first draws, apply what the page opened with (the share link and
// saved locks), so the first thing on screen is the stable avatar, never the default swapped out.
// Until then the playground shows its loading print.
import { useEffect } from "react";
import { restoreSavedLocks, saveLocksOnChange } from "./locks";
import { usePlayground } from "./playground";
import { openLinkFromUrl, syncLinkOnChange } from "./share";

export const useBoot = () =>
  useEffect(() => {
    restoreSavedLocks();
    openLinkFromUrl();
    usePlayground.getState().setReady();
    const stops = [saveLocksOnChange(), syncLinkOnChange()];
    return () => stops.forEach((stop) => stop());
  }, []);
