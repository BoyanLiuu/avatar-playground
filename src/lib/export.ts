// Export (M4): the avatar's own SVG, saved as a file, copied, or drawn onto a canvas at the chosen
// size and saved as a PNG. No screenshot library: the PNG is the same SVG the print shows.
import type { StyleId } from "@/content/styles";
import { renderAvatar } from "@/engine/registry";
import type { Shot } from "@/store/playground";
import type { SharedAvatar } from "@/store/url";

/** PNG sizes per style: Pixel Art keeps whole pixels (its 20×20 grid divides each size). */
export const pngSizes = (id: StyleId) =>
  id === "pixel" ? [200, 400, 800, 1000] : [256, 512, 1024];

/** The phone's one-tap PNG size. */
export const defaultPngSize = (id: StyleId) => (id === "pixel" ? 400 : 512);

/** `avatar-flat-4f2a9c.png`, or `avatar-flat-frame2.png` for a shared frame (no seed). */
export const fileName = (id: StyleId, shot: Shot, ext: "png" | "svg") =>
  `avatar-${id}-${shot.seed ?? `frame${shot.no}`}.${ext}`;

/** FNV-1a: a short, stable hash of a string. */
const hash = (text: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
};

/**
 * The standalone SVG of an avatar, `size` px square, with or without its background. Its ids
 * (clip paths, filters, patterns) carry a prefix hashed from what it shows, so two different
 * avatars pasted inline into one page never share an id, and the same avatar always exports the
 * same bytes.
 */
export const avatarSvg = (
  { id, config, frame, flip }: SharedAvatar,
  { size, transparent = false }: { size: number; transparent?: boolean },
) => {
  const uid = `avatar-${hash(JSON.stringify([id, config, frame, flip, transparent]))}`;
  return renderAvatar(id, config, { frame, flip, size, transparent }, uid);
};

/** Rasterize an SVG at its own width and height. */
export const svgToPng = async (svg: string, size: number) => {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image(size, size);
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    canvas.getContext("2d")!.drawImage(img, 0, 0, size, size);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        "image/png",
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const saveFile = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
