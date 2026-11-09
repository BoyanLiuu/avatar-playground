"use client";

import { useEffect, useState } from "react";
import { WaxFilter } from "@/components/pencil/pencil";
import { CustomizeSheet } from "@/components/shell/customize-sheet";
import { TopBand } from "@/components/shell/top-band";
import { TooltipProvider } from "@/components/ui/tooltip";
import { STYLES } from "@/content/styles";
import { useCurrent, usePlayground } from "@/store/playground";
import {
  CustomizeColumn,
  CustomizePhone,
  CustomizeSections,
  subtitleOf,
} from "./customize-panel";
import { Stage } from "./stage";
import { StyleChips, StyleRail } from "./style-list";

/** Space must still press a focused control, and no shortcut fires while typing or in a menu. */
const CONTROL =
  "button, a, input, textarea, select, [contenteditable], [role=radio], [role=tab], [role=menuitem], [role=option]";
const TYPING = "input, textarea, select, [contenteditable], [role=menu]";

/** Space randomizes (or rolls a new sheet in Grid); 1–6 switch style. Never on key repeat. */
const useShortcuts = () =>
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(TYPING)) return;
      const s = usePlayground.getState();
      if (e.code === "Space") {
        if (target?.closest(CONTROL)) return;
        e.preventDefault();
        if (s.view === "grid") s.rollSheet();
        else s.roll();
        return;
      }
      const n = /^Digit([1-6])$/.exec(e.code)?.[1];
      if (n && !e.shiftKey) s.selectStyle(STYLES[Number(n) - 1].id);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

/** The playground screen: rail, stage and customize panel over one store. */
export const Playground = () => {
  const { style } = useCurrent();
  const [tab, setTab] = useState<string>("");
  useShortcuts();
  // The phone's part tab falls back to the style's first tile part.
  const phoneTab = style.sections.some((s) => s.key === tab)
    ? tab
    : (style.sections.find((s) => s.kind === "tiles")?.key ?? "");

  return (
    <TooltipProvider delay={400}>
      <WaxFilter />
      <div className="flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
        <TopBand />
        <main className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <StyleRail />
          <StyleChips />
          <Stage
            customize={
              <CustomizeSheet
                side="right"
                subtitle={subtitleOf(style)}
                className="max-sm:hidden xl:hidden"
              >
                <CustomizeSections />
              </CustomizeSheet>
            }
          />
          <CustomizeColumn />
          <CustomizePhone tab={phoneTab} onTab={setTab} />
        </main>
      </div>
    </TooltipProvider>
  );
};
