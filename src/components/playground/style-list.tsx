"use client";

import { Fragment } from "react";
import { AvatarImg } from "@/components/avatar-img";
import { PencilLoop } from "@/components/pencil/pencil";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { STYLES, type StyleId, partsOf } from "@/content/styles";
import { avatarSrc } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { type Scope, currentShot, usePlayground } from "@/store/playground";
import { KeyCap } from "./key-cap";

/** Each style's current avatar, as the rail and the chips show it. */
const useThumbs = () => {
  const memory = usePlayground((s) => s.memory);
  return Object.fromEntries(
    STYLES.map(({ id }) => [
      id,
      avatarSrc(id, currentShot(memory[id]).config, {
        frame: memory[id].frame,
        flip: memory[id].flip,
      }),
    ]),
  ) as Record<StyleId, string>;
};

/** The style's parts as whole items; the separator ends an item, so no line starts with "·". */
const PartList = ({ id }: { id: StyleId }) => {
  const parts = partsOf(STYLES.find((s) => s.id === id)!).map((p) =>
    p.title.toLowerCase(),
  );
  return (
    <span className="mt-0.5 block text-[12.5px] leading-[1.35] text-graphite">
      {parts.map((p, k) => (
        <Fragment key={p}>
          <span className="whitespace-nowrap">
            {p}
            {k < parts.length - 1 ? " ·" : ""}
          </span>
          {k < parts.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>
  );
};

const segItem =
  "h-[30px] flex-1 rounded-inner px-3 text-[13px] font-semibold text-graphite hover:bg-transparent hover:text-ink aria-pressed:bg-surface-on aria-pressed:text-ink aria-pressed:shadow-sm";

export const ScopeToggle = ({
  scope,
  onScope,
  className,
}: {
  scope: Scope;
  onScope: (scope: Scope) => void;
  className?: string;
}) => (
  <ToggleGroup
    aria-label="Randomize from"
    spacing={0.5}
    value={[scope]}
    onValueChange={(v) => v[0] && onScope(v[0] as Scope)}
    className={cn(
      "w-full rounded-control border border-rule bg-tray p-[3px]",
      className,
    )}
  >
    <ToggleGroupItem value="style" className={segItem}>
      This style
    </ToggleGroupItem>
    <ToggleGroupItem value="any" className={segItem}>
      Any style
    </ToggleGroupItem>
  </ToggleGroup>
);

/** Desktop and tablet: the style rail (DESIGN.md › Navigation). */
export const StyleRail = () => {
  const current = usePlayground((s) => s.styleId);
  const onSelect = usePlayground((s) => s.selectStyle);
  const scope = usePlayground((s) => s.scope);
  const onScope = usePlayground((s) => s.setScope);
  const thumbs = useThumbs();
  return (
    <nav
      aria-label="Styles"
      className="hidden w-[232px] shrink-0 flex-col border-r border-rule px-3 pt-5 pb-4 sm:flex xl:w-[264px]"
    >
      <h2 className="edge-label px-2 pb-2">Styles</h2>
      <ul className="flex flex-col gap-1">
        {STYLES.map((style, i) => {
          const isCurrent = style.id === current;
          return (
            <li key={style.id}>
              <button
                type="button"
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => onSelect(style.id)}
                className="grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 rounded-control p-2 text-left transition-colors duration-(--dur-fast) hover:bg-tray aria-[current=true]:bg-surface aria-[current=true]:shadow-sm"
              >
                <span className="relative block rounded-print bg-print p-[3px] shadow-sm">
                  <AvatarImg src={thumbs[style.id]} className="size-[50px]" />
                  <PencilLoop on={isCurrent} w={56} h={56} pad={5} seed={77} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] leading-tight font-semibold">
                    {style.name}
                  </span>
                  <PartList id={style.id} />
                </span>
                <KeyCap>{i + 1}</KeyCap>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto border-t border-rule px-2 pt-4">
        <h2 className="edge-label pb-2">Randomize from</h2>
        <ScopeToggle scope={scope} onScope={onScope} />
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-graphite">
          <span className="inline-flex items-center gap-1.5">
            <KeyCap>Space</KeyCap>randomize
          </span>
          <span className="inline-flex items-center gap-1.5">
            <KeyCap>1</KeyCap>–<KeyCap>6</KeyCap>switch style
          </span>
        </p>
      </div>
    </nav>
  );
};

/** Phone: the rail becomes a row of style chips. */
export const StyleChips = () => {
  const current = usePlayground((s) => s.styleId);
  const onSelect = usePlayground((s) => s.selectStyle);
  const thumbs = useThumbs();
  return (
    <nav
      aria-label="Styles"
      className="flex gap-2 overflow-x-auto px-4 pt-3.5 pb-2 sm:hidden"
    >
      {STYLES.map((style) => {
        const isCurrent = style.id === current;
        return (
          <button
            key={style.id}
            type="button"
            aria-current={isCurrent ? "true" : undefined}
            onClick={() => onSelect(style.id)}
            className="flex shrink-0 items-center gap-2 rounded-control py-1.5 pr-3 pl-1.5 text-[13px] font-semibold aria-[current=true]:bg-surface aria-[current=true]:shadow-sm"
          >
            <span className="relative block rounded-print bg-print p-0.5 shadow-sm">
              <AvatarImg src={thumbs[style.id]} className="size-8" />
              <PencilLoop
                on={isCurrent}
                w={36}
                h={36}
                pad={4}
                stroke={2.2}
                seed={21}
              />
            </span>
            {style.name.split(" ")[0]}
          </button>
        );
      })}
    </nav>
  );
};
