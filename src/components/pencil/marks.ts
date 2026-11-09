// Grease-pencil geometry (DESIGN.md › Lock annotation, Hero print and crop marks). Pure and
// seeded, so server and client renders match. Ported from the mockup kit.

const f = (v: number) => Math.round(v * 10) / 10;

/** mulberry32: the prototype's seeded RNG, so marks match the mockups. */
const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, range: (a: number, b: number) => a + next() * (b - a) };
};

const openSpline = (pts: [number, number][]) => {
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
};

export type LoopGeometry = {
  d: string;
  width: number;
  height: number;
  /** Offset of the SVG from the marked box's top-left corner. */
  offset: number;
};

/** A hand-drawn loop around a w×h box: a wobbly ellipse that overshoots its start. */
export const loopGeometry = (
  w: number,
  h: number,
  { pad = 6, stroke = 2.6, seed = 1 } = {},
): LoopGeometry => {
  const r = rng(seed * 7919);
  const rx = w / 2 + pad;
  const ry = h / 2 + pad;
  const m = stroke * 2 + 4;
  const cx = rx + m;
  const cy = ry + m;
  const n = 30;
  const start = r.range(-2.5, -1.9);
  const pts = Array.from({ length: n + 1 }, (_, k): [number, number] => {
    const t = k / n;
    const a = start + t * Math.PI * 2 * 1.1;
    const wob = 1 + (r.next() - 0.5) * 0.035 + t * 0.045;
    return [cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob];
  });
  return {
    d: openSpline(pts),
    width: f(2 * cx),
    height: f(2 * cy),
    offset: f(-(pad + m)),
  };
};

/** Two quick passes of an underline, drawn on a 100-unit width (stretched to the label). */
export const underlinePaths = (seed = 1) => {
  const r = rng(seed * 15485863);
  const w = 100;
  const H = 12;
  return [0, 1].map((k) => {
    const y0 = H / 2 + r.range(-1.2, 1.2) + k * 2.2;
    const y1 = H / 2 + r.range(-1.6, 0.4) + k * 2.2;
    const x0 = r.range(-3, 1);
    const c1 = y0 + r.range(-1.4, 1.4);
    const c2 = y1 + r.range(-1.4, 1.4);
    const x1 = w + r.range(0, 4);
    return `M${f(x0)},${f(y0)} C${f(w * 0.35)},${f(c1)} ${f(w * 0.7)},${f(c2)} ${f(x1)},${f(y1)}`;
  });
};

/** Four crop corners (TL, TR, BL, BR), each in local coordinates with its vertex at 0,0. */
export const cropCornerPaths = ({ len = 34, seed = 3 } = {}) => {
  const r = rng(seed * 104729);
  const j = () => r.range(-1.6, 1.6);
  const corner = (dx: number, dy: number) => {
    const ax = f(dx * len + j());
    const ay = f(j());
    const bx = f(j() * 0.4);
    const by = f(j() * 0.4);
    const cx = f(j());
    const cy = f(dy * len + j());
    return `M${ax},${ay} L${bx},${by} L${cx},${cy}`;
  };
  return [corner(1, 1), corner(-1, 1), corner(1, -1), corner(-1, -1)];
};
