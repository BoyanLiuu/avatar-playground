"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // DESIGN.md › Motion: an ink toast at the bottom centre that hides after 1.6s.
      position="bottom-center"
      duration={1600}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--primary-bg)",
          "--normal-text": "var(--primary-fg)",
          "--normal-border": "var(--band-control-edge)",
          "--border-radius": "var(--radius-control)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast !right-0 !left-0 !mx-auto !w-fit !px-4 !py-2.5 font-sans !text-[14px] !font-semibold !shadow-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
