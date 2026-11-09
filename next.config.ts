import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A static site (M5): `next build` writes plain files to out/, servable from any static host.
  // (Cache Components and partial prefetching need a server, so they are off: the app is one
  // static page whose avatars render in the browser.)
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
