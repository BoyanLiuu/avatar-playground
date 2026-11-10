import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LINK_SCRIPT } from "@/lib/link-script";
import "./globals.css";

// One superfamily (DESIGN.md › Typography): Barlow for interface text, Barlow Condensed for edge print.
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const OG_ALT =
  "Avatar Playground: six avatar styles on a strip of film, Flat Cartoon, Pixel Art, Robots, Line Doodle, Monsters and Geometric";

// Absolute URLs for the share card need the deployed address: SITE_URL if set, else Vercel's own
// production address (set automatically on Vercel builds), else the local dev server.
const VERCEL = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const SITE_URL =
  process.env.SITE_URL ??
  (VERCEL ? `https://${VERCEL}` : "http://127.0.0.1:3001");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Avatar Playground",
  description:
    "Generate avatars in six styles: pick a style, randomize, tweak each part, lock what you like, then export or share.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Avatar Playground",
    description:
      "Six avatar styles. Roll, tweak, lock, then export PNG or SVG, or share a link.",
    images: [
      { url: "/opengraph-image.png", width: 1200, height: 630, alt: OG_ALT },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image.png"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* First in <body>, so it runs before anything paints (like next-themes' script). A fixed
            string, no user input. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: LINK_SCRIPT }}
        />
        {/* Follows the OS until the visitor picks a theme (stored as "avatar-theme"). */}
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          storageKey="avatar-theme"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
