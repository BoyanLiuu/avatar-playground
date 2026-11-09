// Shape helpers shared by the styles (ported from the prototype). Coordinates are rounded to one
// decimal so the SVG stays short and identical across platforms.
import type { Rng } from "./rng";

export const f = (v: number) => Math.round(v * 10) / 10;

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour towards white or black. */
export const shade = (hex: string, amt: number) => {
  const n = Number.parseInt(hex.slice(1), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const ch = (c: number) => Math.round((t - c) * p + c);
  const [rr, gg, bb] = [ch(n >> 16), ch((n >> 8) & 255), ch(n & 255)];
  return `#${((1 << 24) | (rr << 16) | (gg << 8) | bb).toString(16).slice(1)}`;
};

export const circleD = (cx: number, cy: number, rr: number) =>
  `M${f(cx - rr)},${f(cy)}a${f(rr)},${f(rr)} 0 1,0 ${f(2 * rr)},0a${f(rr)},${f(rr)} 0 1,0 ${f(-2 * rr)},0Z`;

const closedSpline = (pts: [number, number][]) => {
  const n = pts.length;
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return `${d}Z`;
};

/** A wobbly closed blob of n points around an ellipse; the wobble comes from r. */
export const blobPath = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  n: number,
  jitter: number,
  r: Rng,
) => {
  const pts: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + (k / n) * Math.PI * 2;
    const j = 1 + (r.next() * 2 - 1) * jitter;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return closedSpline(pts);
};

export const heartD = (x: number, y: number, s: number) =>
  `M${f(x)} ${f(y + s * 0.9)} C${f(x - s * 1.7)} ${f(y - s * 0.1)} ${f(x - s * 0.7)} ${f(y - s * 1.4)} ${f(x)} ${f(y - s * 0.4)} C${f(x + s * 0.7)} ${f(y - s * 1.4)} ${f(x + s * 1.7)} ${f(y - s * 0.1)} ${f(x)} ${f(y + s * 0.9)} Z`;
