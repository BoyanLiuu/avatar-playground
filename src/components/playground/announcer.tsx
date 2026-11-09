"use client";

import { useEffect, useRef } from "react";
import { describeAvatar } from "@/lib/describe";
import { useCurrent } from "@/store/playground";

/**
 * Screen readers hear each new current frame (a roll, undo, redo, restore, keep or style switch)
 * with what it shows. Picks are not repeated here: the option itself is announced as it is
 * checked. Nothing is announced on load.
 */
export const Announcer = () => {
  const { id, style, shot } = useCurrent();
  const ref = useRef<HTMLParagraphElement>(null);
  const last = useRef(`${id}-${shot.no}`);
  const text = `${style.name}, frame ${shot.no}: ${describeAvatar(style, shot.config)}`;
  useEffect(() => {
    const key = `${id}-${shot.no}`;
    if (key === last.current || !ref.current) return;
    last.current = key;
    ref.current.textContent = text;
  });
  return (
    <p ref={ref} aria-live="polite" aria-atomic="true" className="sr-only" />
  );
};
