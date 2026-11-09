import { ENGINES, renderAvatar } from "@/engine/registry";

// The favicon, /icon.svg: the Robots avatar, whose bold shapes still read at 16px. Rendered by the
// engine at build time; a route with an extension so static hosts send the right content type.
export const dynamic = "force-static";

export function GET() {
  const svg = renderAvatar(
    "robots",
    ENGINES.robots.defaults,
    { frame: "squircle", size: 32 },
    "icon",
  );
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
