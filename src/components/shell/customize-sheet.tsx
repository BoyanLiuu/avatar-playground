"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Below 1280px the customize panel lives in a sheet: from the right on tablets, from the bottom
 * on phones. On wider screens it is the third column instead.
 */
export const CustomizeSheet = ({
  side,
  subtitle,
  className,
  children,
}: {
  side: "right" | "bottom";
  subtitle: string;
  className?: string;
  children: ReactNode;
}) => (
  <Sheet>
    <SheetTrigger
      render={
        <Button
          variant="outline"
          className={cn(
            "h-8 gap-2 rounded-inner border-control-edge bg-surface px-3 text-[13px] font-semibold hover:border-control-edge-hover hover:bg-tray",
            className,
          )}
        />
      }
    >
      <SlidersHorizontalIcon className="size-4" />
      Customize
    </SheetTrigger>
    <SheetContent
      side={side}
      className={cn(
        "gap-0 bg-panel",
        side === "right"
          ? "w-[424px] sm:max-w-[424px]"
          : "max-h-[80dvh] rounded-t-sheet",
      )}
    >
      <SheetHeader className="border-b border-rule px-5 py-3">
        <SheetTitle className="text-[17px] font-semibold">Customize</SheetTitle>
        <SheetDescription className="text-[12.5px] text-graphite">
          {subtitle}
        </SheetDescription>
      </SheetHeader>
      <div className="overflow-y-auto px-5">{children}</div>
    </SheetContent>
  </Sheet>
);
