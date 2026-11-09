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

/** `avatar-flat-4f2a9c.png`, or `avatar-flat-frame10.png` for a shared frame (no seed). */
export const fileName = (id: StyleId, shot: Shot, ext: "png" | "svg") =>
  `avatar-${id}-${shot.seed ?? `frame${shot.no}`}.${ext}`;

/** The standalone SVG of an avatar, `size` px square, with or without its background. */
export const avatarSvg = (
  { id, config, frame, flip }: SharedAvatar,
  { size, transparent = false }: { size: number; transparent?: boolean },
) => renderAvatar(id, config, { frame, flip, size, transparent }, "avatar");

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
