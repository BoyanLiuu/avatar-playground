import type { Frame } from "@/content/styles";

const RX: Record<Frame, number> = { circle: 100, squircle: 46, square: 0 };

export type WrapOptions = {
  frame: Frame;
  flip?: boolean;
  /** A viewBox in the 200-unit avatar space; option tiles crop to their part. */
  crop?: string;
  /** Width and height in px (exports); without it the SVG scales to its box. */
  size?: number;
  uid: string;
};

/** A standalone SVG: the avatar body, mirrored if flipped, clipped to its frame (crops are not). */
export const wrapSvg = (
  body: string,
  { frame, flip, crop, size, uid }: WrapOptions,
) => {
  const mirrored = flip
    ? `<g transform="matrix(-1 0 0 1 200 0)">${body}</g>`
    : body;
  const framed = crop
    ? mirrored
    : `<defs><clipPath id="${uid}-frame"><rect width="200" height="200" rx="${RX[frame]}"/></clipPath></defs><g clip-path="url(#${uid}-frame)">${mirrored}</g>`;
  const dims = size ? ` width="${size}" height="${size}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg"${dims} viewBox="${crop ?? "0 0 200 200"}" preserveAspectRatio="xMidYMid slice">${framed}</svg>`;
};

export const toDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
