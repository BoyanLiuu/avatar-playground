import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Avatar Playground",
  description:
    "Generate avatars in six styles: pick a style, randomize, tweak each part.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // v1 is dark-only: a static class means no theme flash and no theme script.
    <html lang="en" className={cn("dark font-sans", geist.variable)}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
