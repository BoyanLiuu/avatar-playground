// Controls that sit on the film band (DESIGN.md › Buttons "On film", Segmented controls).
// Borders use --band-control-edge so they reach 3:1 on film in both themes.

export const bandSeg =
  "rounded-control border border-band-control-edge bg-film-2 p-[3px]";

export const bandSegItem =
  "h-7 min-w-0 rounded-inner px-2.5 font-semibold text-[13px] text-edge hover:bg-film-on hover:text-band-fg aria-pressed:bg-film-on aria-pressed:text-band-fg aria-pressed:shadow-[inset_0_0_0_1px_var(--band-control-edge)] focus-visible:ring-0";

export const bandButton =
  "inline-flex h-9 items-center justify-center gap-2 rounded-control border border-band-control-edge bg-film-2 px-3 font-semibold text-[13px] text-band-fg transition-colors hover:bg-film-on";
