// DESIGN.md › Motion, in code (Web Animations). Each helper cancels its own previous run before
// starting, so rapid rolls restart the motion instead of queueing it. Under reduced motion nothing
// slides or draws: every gesture becomes a 120ms fade, and the crop marks stay put.

const EASE_OUT = "cubic-bezier(.16,1,.3,1)";
const EASE_DEVELOP = "cubic-bezier(.33,0,.2,1)";
const FAST = 120;
const BASE = 240;
const SLOW = 360;
const DEVELOP = 560;

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stop = (el: Element, id: string) => {
  for (const a of el.getAnimations()) if (a.id === id) a.cancel();
};

const play = (
  el: Element,
  id: string,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) => {
  stop(el, id);
  el.animate(keyframes, { ...options, id });
};

const fade = (el: Element, id: string) =>
  play(el, id, [{ opacity: 0.35 }, { opacity: 1 }], {
    duration: FAST,
    easing: "linear",
  });

const strokes = (el: Element) => el.querySelectorAll("path");

/** A pencil mark (or every mark inside `el`) draws on along its stroke. */
export const drawOn = (el: Element | null | undefined) => {
  if (!el) return;
  stop(el, "lift");
  if (reducedMotion()) return fade(el, "draw");
  for (const path of strokes(el))
    play(path, "draw", [{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], {
      duration: BASE,
      easing: EASE_OUT,
      fill: "backwards",
    });
};

/** The outgoing mark lifts: a short fade (its element is already hidden underneath). */
export const lift = (el: Element | null | undefined) => {
  if (!el) return;
  for (const path of strokes(el)) stop(path, "draw");
  play(el, "lift", [{ opacity: 1 }, { opacity: 0 }], {
    duration: FAST,
    easing: "linear",
  });
};

/** A mark removed outright (unlocking): stop any draw in progress. */
export const erase = (el: Element | null | undefined) => {
  if (!el) return;
  stop(el, "lift");
  stop(el, "draw");
  for (const path of strokes(el)) stop(path, "draw");
};

/** The roll: the new print develops from overexposure. */
export const develop = (img: Element | null) => {
  if (!img) return;
  if (reducedMotion()) return fade(img, "print");
  play(
    img,
    "print",
    [
      { filter: "brightness(1.75) contrast(.55) saturate(.3)" },
      { filter: "none" },
    ],
    { duration: DEVELOP, easing: EASE_DEVELOP },
  );
};

/** A pick: the print swaps with a short fade-up. */
export const swap = (img: Element | null) =>
  img &&
  play(img, "print", [{ opacity: 0.55 }, { opacity: 1 }], {
    duration: FAST,
    easing: "linear",
  });

/** The roll: the crop marks around the print are drawn again. */
export const redraw = (el: Element | null) => {
  if (!el || reducedMotion()) return;
  for (const path of el.querySelectorAll(".crop-mark path"))
    play(path, "draw", [{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], {
      duration: BASE,
      easing: EASE_OUT,
      fill: "backwards",
    });
};

/** The roll: the strip shifts one frame (FLIP) and the new frame lands from the right. */
export const advance = (
  shifted: readonly Element[],
  landed: Element,
  slot: number,
) => {
  if (reducedMotion()) return fade(landed, "land");
  for (const el of shifted)
    play(
      el,
      "shift",
      [{ transform: `translateX(${slot}px)` }, { transform: "none" }],
      { duration: SLOW, easing: EASE_OUT },
    );
  play(
    landed,
    "land",
    [
      { opacity: 0, transform: "translateX(28px)" },
      { opacity: 1, transform: "none" },
    ],
    { duration: SLOW, easing: EASE_OUT },
  );
};
