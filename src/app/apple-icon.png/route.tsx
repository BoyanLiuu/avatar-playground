import { ImageResponse } from "next/og";
import { ENGINES, renderAvatar } from "@/engine/registry";

// Home-screen icon, /apple-icon.png: the Robots avatar, square (iOS rounds it), 180px.
const size = { width: 180, height: 180 };
export const dynamic = "force-static";

export function GET() {
  const svg = renderAvatar(
    "robots",
    ENGINES.robots.defaults,
    { frame: "square", size: 180 },
    "apple",
  );
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>
    <img
      src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`}
      width={180}
      height={180}
      alt=""
    />,
    size,
  );
}
