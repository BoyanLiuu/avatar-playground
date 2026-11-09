"use client";

import { useState } from "react";
import { WaxFilter } from "@/components/pencil/pencil";
import { CustomizeSheet } from "@/components/shell/customize-sheet";
import { TopBand } from "@/components/shell/top-band";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type StyleId, getStyle } from "@/content/styles";
import { fixtures } from "@/lib/fixtures";
import {
  CustomizeColumn,
  CustomizePhone,
  CustomizeSections,
  subtitleOf,
} from "./customize-panel";
import { Stage, type View } from "./stage";
import { type Scope, StyleChips, StyleRail } from "./style-list";

/**
 * The playground screen (M1: static UX). Local UI state only: the current style, Single/Grid,
 * the randomize scope and the phone's part tab. Everything else shows the fixture state.
 */
export const Playground = () => {
  const [styleId, setStyleId] = useState<StyleId>("flat");
  const [view, setView] = useState<View>("single");
  const [scope, setScope] = useState<Scope>("style");
  const [tab, setTab] = useState<string>("");
  const style = getStyle(styleId);
  const fx = fixtures[styleId];
  const phoneTab =
    tab || style.sections.find((s) => s.kind === "tiles")?.key || "";
  const selectStyle = (id: StyleId) => {
    setStyleId(id);
    setTab("");
  };

  return (
    <TooltipProvider delay={400}>
      <WaxFilter />
      <div className="flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
        <TopBand />
        <main className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <StyleRail
            current={styleId}
            onSelect={selectStyle}
            scope={scope}
            onScope={setScope}
          />
          <StyleChips current={styleId} onSelect={selectStyle} />
          <Stage
            style={style}
            fx={fx}
            view={view}
            onView={setView}
            scope={scope}
            onScope={setScope}
            customize={
              <CustomizeSheet
                side="right"
                subtitle={subtitleOf(style)}
                className="max-sm:hidden xl:hidden"
              >
                <CustomizeSections style={style} fx={fx} />
              </CustomizeSheet>
            }
          />
          <CustomizeColumn style={style} fx={fx} />
          <CustomizePhone style={style} fx={fx} tab={phoneTab} onTab={setTab} />
        </main>
      </div>
    </TooltipProvider>
  );
};
