import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loopGeometry } from "@/components/pencil/marks";
import { STYLES } from "@/content/styles";
import { ENGINES, renderAvatar } from "@/engine/registry";

// The share card, /opengraph-image.png (DESIGN.md › Contact Sheet): the wordmark on photo paper
// over a strip of film holding each style's first avatar, frame 1 circled in red grease pencil.
const size = { width: 1200, height: 630 };
export const dynamic = "force-static";

const PAPER = "#f3f4f2";
const INK = "#141516";
const GRAPHITE = "#555a58";
const FILM = "#141516";
const SPROCKET = "#33363a";
const EDGE = "#aeb3b0";
const RED = "#d8382a";
const FRAME = 150;
const GAP = 28;

const svgSrc = (svg: string) =>
  `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const font = (file: string) =>
  readFile(join(process.cwd(), "assets/fonts", file));

/** A row of sprocket holes along one edge of the strip. */
const sprockets = (width: number) => {
  const holes = Math.floor(width / 38);
  return svgSrc(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="12">${Array.from(
      { length: holes },
      (_, k) =>
        `<rect x="${k * 38 + 10}" width="18" height="12" rx="3" fill="${SPROCKET}"/>`,
    ).join("")}</svg>`,
  );
};

const redLoop = () => {
  const g = loopGeometry(FRAME, FRAME, { pad: 9, stroke: 5, seed: 5 });
  return {
    src: svgSrc(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${g.width}" height="${g.height}" viewBox="0 0 ${g.width} ${g.height}"><path d="${g.d}" fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round"/></svg>`,
    ),
    width: g.width,
    height: g.height,
    offset: g.offset,
  };
};

export async function GET() {
  const [title, numbers, body] = await Promise.all([
    font("BarlowCondensed-Bold.ttf"),
    font("BarlowCondensed-SemiBold.ttf"),
    font("Barlow-SemiBold.ttf"),
  ]);
  const stripWidth = STYLES.length * FRAME + (STYLES.length - 1) * GAP + 96;
  const loop = redLoop();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: PAPER,
        paddingTop: 64,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Barlow Condensed",
          fontWeight: 700,
          fontSize: 84,
          lineHeight: 1,
          color: INK,
        }}
      >
        Avatar Playground
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 18,
          fontFamily: "Barlow",
          fontWeight: 600,
          fontSize: 30,
          color: GRAPHITE,
        }}
      >
        Six styles. Roll, tweak, lock, then export or share.
      </div>
      <div
        style={{
          marginTop: 56,
          width: stripWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: FILM,
          borderRadius: 14,
          padding: "16px 0",
        }}
      >
        <img
          src={sprockets(stripWidth - 32)}
          width={stripWidth - 32}
          height={12}
          alt=""
        />
        <div style={{ display: "flex", gap: GAP, padding: "24px 0 18px" }}>
          {STYLES.map((style, i) => (
            <div
              key={style.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", position: "relative" }}>
                <img
                  src={svgSrc(
                    renderAvatar(
                      style.id,
                      ENGINES[style.id].defaults,
                      { frame: style.frame, size: FRAME },
                      `og${i}`,
                    ),
                  )}
                  width={FRAME}
                  height={FRAME}
                  alt=""
                />
                {i === 0 && (
                  <img
                    src={loop.src}
                    width={loop.width}
                    height={loop.height}
                    alt=""
                    style={{
                      position: "absolute",
                      left: loop.offset,
                      top: loop.offset,
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Barlow Condensed",
                  fontWeight: 600,
                  fontSize: 22,
                  letterSpacing: 1.2,
                  color: i === 0 ? PAPER : EDGE,
                }}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
        <img
          src={sprockets(stripWidth - 32)}
          width={stripWidth - 32}
          height={12}
          alt=""
        />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Barlow Condensed", data: title, weight: 700 },
        { name: "Barlow Condensed", data: numbers, weight: 600 },
        { name: "Barlow", data: body, weight: 600 },
      ],
    },
  );
}
