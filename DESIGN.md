---
name: Avatar Playground
description: A photographer's contact sheet for rolling, circling and keeping avatars.
colors:
  paper: "#f3f4f2"
  panel-paper: "#f7f8f6"
  print-white: "#ffffff"
  tray: "#e6e8e5"
  ink: "#141516"
  ink-2: "#2a2c2e"
  graphite: "#555a58"
  rule: "#d9dcd9"
  rule-2: "#c4c8c5"
  film: "#141516"
  film-2: "#202224"
  sprocket: "#33363a"
  edge: "#aeb3b0"
  pencil-red: "#d8382a"
  pencil-yellow: "#f1c232"
  surface-on: "#ffffff"
  control-edge: "#868b88"
  control-edge-hover: "#737875"
  band-control-edge: "#70757a"
  band-fg: "#f3f4f2"
  swatch-ring: "rgb(20 21 22 / 0.52)"
  primary-kbd-edge: "#3d4043"
  primary-kbd-fg: "#d4d7d5"
  paper-dark: "#151618"
  panel-paper-dark: "#191a1d"
  surface-dark: "#212327"
  surface-on-dark: "#2e3135"
  print-dark: "#e7e8e4"
  tray-dark: "#1d1f22"
  ink-dark: "#ecedea"
  ink-2-dark: "#d2d5d1"
  graphite-dark: "#a3a8a5"
  rule-dark: "#2a2c30"
  rule-2-dark: "#3a3d42"
  control-edge-dark: "#767b81"
  control-edge-hover-dark: "#767b81"
  swatch-ring-dark: "rgb(255 255 255 / 0.42)"
  film-dark: "#0a0a0b"
  film-2-dark: "#18191c"
  film-on-dark: "#2e3135"
  sprocket-dark: "#3a3d42"
  band-edge-dark: "#232528"
  edge-dark: "#8f9592"
  pencil-red-dark: "#ff5f4e"
  pencil-yellow-dark: "#f6c84c"
  primary-fg-dark: "#151618"
  primary-kbd-bg-dark: "#d5d7d3"
  primary-kbd-edge-dark: "#b9bcb8"
  primary-kbd-fg-dark: "#2a2c2e"
typography:
  display:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: '"tnum" 1'
  body-sm:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.35
  control:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  section-title:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.07em"
  label:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  frame-no:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
    fontFeature: '"tnum" 1'
rounded:
  print: "3px"
  hero: "4px"
  tile: "6px"
  inner: "7px"
  control: "10px"
  sheet: "16px"
  pill: "999px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "0 16px 0 20px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.print-white}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "48px"
  button-sm:
    backgroundColor: "{colors.print-white}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.inner}"
    padding: "0 12px"
    height: "32px"
  button-icon:
    backgroundColor: "{colors.print-white}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    size: "40px"
  button-mini:
    backgroundColor: "{colors.print-white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.inner}"
    size: "28px"
  button-mini-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.inner}"
    size: "28px"
  button-dark:
    backgroundColor: "{colors.film-2}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  button-dark-icon:
    backgroundColor: "{colors.film-2}"
    textColor: "{colors.band-fg}"
    rounded: "{rounded.control}"
    size: "36px"
  segmented-band:
    backgroundColor: "{colors.film-2}"
    textColor: "{colors.edge}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "3px"
  segmented-band-active:
    backgroundColor: "{colors.sprocket}"
    textColor: "{colors.band-fg}"
    rounded: "{rounded.tile}"
    height: "28px"
  segmented-band-active-dark:
    backgroundColor: "{colors.film-on-dark}"
    textColor: "{colors.band-fg}"
    rounded: "{rounded.tile}"
    height: "28px"
  segmented:
    backgroundColor: "{colors.tray}"
    textColor: "{colors.graphite}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "3px"
  segmented-active:
    backgroundColor: "{colors.surface-on}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    height: "30px"
  segmented-active-dark:
    backgroundColor: "{colors.surface-on-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.inner}"
    height: "30px"
  option-tile:
    backgroundColor: "{colors.print-white}"
    rounded: "{rounded.tile}"
    size: "56px"
  swatch:
    rounded: "{rounded.pill}"
    size: "24px"
  style-row-current:
    backgroundColor: "{colors.print-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px"
  film-strip:
    backgroundColor: "{colors.film}"
    textColor: "{colors.edge}"
    typography: "{typography.frame-no}"
    rounded: "{rounded.tile}"
    padding: "20px 16px"
  kbd:
    backgroundColor: "{colors.print-white}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.hero}"
    padding: "3px 6px"
  tab-pill:
    backgroundColor: "{colors.print-white}"
    textColor: "{colors.graphite}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "30px"
  tab-pill-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
  tab-pill-active-dark:
    backgroundColor: "{colors.surface-on-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.pill}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  toast-dark:
    backgroundColor: "{colors.ink-dark}"
    textColor: "{colors.primary-fg-dark}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
---

# Design System: Avatar Playground

## Overview

**Creative North Star: "The Contact Sheet"**

The playground is a photographer's contact sheet. Work areas are photo paper, the top bar and the history are bands of film black with sprocket holes, and every roll lands as a numbered frame. The visitor edits the way a photographer edits proofs: a red grease-pencil loop circles the current pick, yellow grease pencil underlines what is kept. The chrome is black, white and graphite so the avatars carry all of the colour.

This is an Operate surface. The world lends type, palette, density and one signature move (the grease-pencil marks on a film strip); navigation and controls are standard web components with standard semantics (radio groups, pressed toggles, segmented controls). Hand marks annotate controls and never replace them. Density is high: at 1440x900 every part of a style fits the customize panel without scrolling, on one 4/8px module that sizes tiles, frames, swatches and gaps.

The world has two themes, and the owner decided both. Light is photo paper with film-black bands; dark is the same sheet viewed on a darkroom table: the ground and chrome go to film, prints stay paper, and the grease pencils are brightened. The page follows the OS until the visitor picks a theme (see Theme Model under Colors). The design artifacts live outside the repo in `../docs/avatar/mockups/`. Two worlds were rendered and not chosen, Departure Board and Flip Book (`../docs/avatar/mockups/worlds/`); their tokens are not part of this system.

**Key Characteristics:**

- Photo-paper work areas, film-black bands, graphite chrome; avatars are the only colour.
- Red grease pencil marks the current pick; yellow grease pencil marks locks. Each colour does one job.
- Barlow Condensed edge-print labels and frame numbers over Barlow interface text, tabular numerals throughout.
- Avatars sit on white "prints" with soft paper shadows; the export frame carries red crop marks.
- Standard controls (Lucide stroke icons, segmented toggles, bordered buttons), annotated rather than restyled.
- Light and dark from one token set: dark swaps the ground to film and keeps prints paper; every bordered control holds 3:1 in both.
- Motion has one focal moment, the roll: the strip advances a frame and the new print develops from overexposure.

## Colors

A neutral photo-lab palette of paper, ink, film and graphite, with two grease-pencil colours that each carry one meaning.

### Primary

- **Grease-Pencil Red** (pencil-red; pencil-red-dark in dark): the current pick, and nothing else. Drawn as a hand loop around the selected style print, option tile, swatch, history frame and grid frame, and as the four crop corners around the hero print showing the export frame. Dark brightens it (#ff5f4e) so the loop reads on film and on the dark ground; it still does one job.

### Secondary

- **Grease-Pencil Yellow** (pencil-yellow; pencil-yellow-dark in dark): what is locked, and nothing else. Drawn as a two-pass underline under a locked section title, a locked tab, and each locked part in the "Randomize keeps" line. Also the text-selection highlight. Dark uses #f6c84c, still one job.

### Neutral

- **Photo Paper** (paper): the page and work-area ground; also the text colour on film and on ink buttons.
- **Panel Paper** (panel-paper): the customize panel ground, a half-step lighter than the page.
- **Print White** (print-white): prints, option tiles, buttons, the current style row and the mobile customize sheet. In dark this role splits in two: control surfaces become surface-dark, while prints (hero mat, thumbnail mats) stay paper as print-dark (#e7e8e4), a softened white so the print does not glare on film.
- **Pressed Surface** (surface-on): the pressed segment of a segmented control and the frame-shape picker. White in light; in dark a raised film grey (surface-on-dark) that also fills the pressed phone tab.
- **Developing Tray** (tray): the track of segmented controls.
- **Ink** (ink): text, the primary button, the pressed lock toggle, the active tab pill and the focus ring.
- **Ink Soft** (ink-2): icon colour in toolbar buttons; key caps inside the ink button.
- **Graphite** (graphite): secondary text, labels, counts, hints and unpressed control text.
- **Hairline** (rule): panel dividers, section dividers, tile borders.
- **Control Rule** (rule-2): key-cap borders, the toolbar divider and the sheet handle.
- **Control Edge** (control-edge; control-edge-dark in dark): the border of every bordered control on paper: buttons, toolbar icons, small and mini buttons, phone tabs, and the hover edge of option tiles. It exists to clear 3:1 against the grounds those controls sit on: 3.46:1 on print white, 3.14:1 on photo paper, 3.25:1 on panel paper in light; 3.69:1 on the dark surface, 4.24:1 on the dark page, 4.08:1 on the dark panel.
- **Swatch Ring** (swatch-ring; swatch-ring-dark in dark): the 1px inset ring on every colour swatch, ink at 52% in light (about 3.6:1 on panel paper) and white at 42% in dark (4.06:1 on the dark panel), so a pale swatch never vanishes into the panel.
- **Film Black** (film): the top band and the film-strip history (same value as ink).
- **Film Raised** (film-2): controls sitting on the film band.
- **Sprocket** (sprocket; sprocket-dark in dark): sprocket holes on film strips and the pressed segment on the band. Dark lifts the sprocket fill to #3a3d42 so the holes stay visible on the darker film, and the pressed band segment uses film-on-dark.
- **Band Control Edge** (band-control-edge, the same in both themes): the border of controls on film (theme and GitHub buttons) and the inset ring on the pressed band segment. It exists to clear 3:1 against film and film-raised: 3.9:1 and 3.4:1 in light, 4.25:1 and 3.78:1 in dark.
- **Band Text** (band-fg, the same in both themes): wordmark, band control text, the current frame number, and the focus ring on film.
- **Edge Print** (edge; edge-dark in dark): frame numbers and unpressed text on film.

### Dark Theme

The same roles, re-valued for a darkroom table. Prints stay paper; everything else goes to film. The primary button inverts to a light ink plate with dark text.

| Role                                           | Light                       | Dark                        |
| ---------------------------------------------- | --------------------------- | --------------------------- |
| Page ground (paper)                            | #f3f4f2                     | #151618                     |
| Panel ground (panel-paper)                     | #f7f8f6                     | #191a1d                     |
| Control surface (print-white / surface-dark)   | #ffffff                     | #212327                     |
| Pressed surface (surface-on)                   | #ffffff                     | #2e3135                     |
| Print mat (print-white / print-dark)           | #ffffff                     | #e7e8e4                     |
| Tray                                           | #e6e8e5                     | #1d1f22                     |
| Ink                                            | #141516                     | #ecedea                     |
| Ink soft                                       | #2a2c2e                     | #d2d5d1                     |
| Graphite                                       | #555a58                     | #a3a8a5                     |
| Hairline (rule)                                | #d9dcd9                     | #2a2c30                     |
| Control rule (rule-2)                          | #c4c8c5                     | #3a3d42                     |
| Control edge                                   | #868b88                     | #767b81                     |
| Swatch ring                                    | ink at 52%                  | white at 42%                |
| Film                                           | #141516                     | #0a0a0b                     |
| Film raised                                    | #202224                     | #18191c                     |
| Pressed band segment (sprocket / film-on-dark) | #33363a                     | #2e3135                     |
| Sprocket fill                                  | #33363a                     | #3a3d42                     |
| Band edge                                      | none                        | #232528                     |
| Band control edge                              | #70757a                     | #70757a                     |
| Band text                                      | #f3f4f2                     | #f3f4f2                     |
| Edge print                                     | #aeb3b0                     | #8f9592                     |
| Pencil red                                     | #d8382a                     | #ff5f4e                     |
| Pencil yellow                                  | #f1c232                     | #f6c84c                     |
| Primary button fill / text                     | ink / paper                 | #ecedea / #151618           |
| Primary key cap fill / edge / text             | #2a2c2e / #3d4043 / #d4d7d5 | #d5d7d3 / #b9bcb8 / #2a2c2e |

### Theme Model

Two themes, light and dark. The page follows the OS (`prefers-color-scheme`) until the visitor picks a theme; the pick is stored as `avatar-theme`. Picking the theme the OS already uses clears the stored override, so the page follows the OS again; if storage is unavailable the pick lasts for the page only. On desktop the band carries a two-segment sun/moon toggle (pressed segment = current theme); on the phone it is a single 36px icon button on the band that shows the current theme's icon and switches to the other.

### Named Rules

**The Avatars Carry The Colour Rule.** Chrome is paper, ink, film and graphite. The only hues on screen are the avatars, their swatches, and the two grease pencils.

**The One Job Per Pencil Rule.** Red means "current pick". Yellow means "locked". Never use either for emphasis, errors, links, hover or decoration.

**The 3:1 Edge Rule.** Every bordered control and every swatch ring holds at least 3:1 against the ground it sits on, in both themes. Borders of controls use the control edge (on paper) or the band control edge (on film), never the hairline; hairlines are for dividers and resting tile borders only.

**The Annotation Rule.** Grease-pencil marks sit on top of standard controls (`aria-hidden`, pointer-events none) and never carry state alone: a locked part also has the ink pressed lock toggle, a pick also has `aria-checked` or `aria-current`.

## Typography

**Display Font:** Barlow Condensed (with system-ui, sans-serif)
**Body Font:** Barlow (with system-ui, sans-serif)
**Label Font:** Barlow Condensed, uppercase and tracked

**Character:** One superfamily split by job. The condensed cut is the edge print on film stock (frame numbers, section titles, labels, the wordmark); the regular cut is quiet interface text. Numerals are tabular everywhere so seeds and frame numbers line up.

### Hierarchy

- **Display** (700, 22px, 1): the wordmark on the film band only. On the phone it steps down to 20px, a compact step because 22px does not fit the 390px band beside its controls.
- **Headline** (600, 17px, 1.2): panel and sheet titles ("Customize"), 17px on desktop and in the phone sheet alike.
- **Title** (600, 15px, 1.25): style names and the 48px action buttons.
- **Body** (400, 14px, 1.45): default interface text.
- **Body Small** (400, 12.5px, 1.35): style part lists, panel subtitles, history hints, graphite.
- **Control** (600, 13px): segmented controls, small buttons, band controls, tab pills, lock chips.
- **Section Title** (600, 13px, 0.07em, uppercase): customize-panel part headings, in ink.
- **Label** (600, 12px, 0.08em, uppercase): edge-print labels ("Styles", "History", "Randomize from", "Frame 24 · seed"), in graphite; also key caps (0.04em).
- **Frame Number** (600, 11px, 0.06em, tabular): numbers under film-strip frames, edge grey; paper on the current frame; 12px in the grid sheet.

### Named Rules

**The Edge Print Rule.** Condensed uppercase type names things the way film edge print does: a section, a frame, a seed. It labels a control group; it never sits above a headline as decoration.

## Layout

Desktop (1440x900) is a fixed app frame: a 56px film band over three columns, a 264px style rail, a fluid stage, and a 424px customize panel, divided by hairlines. The stage centres the hero print (416px avatar in a 12px white border), then the toolbar and actions, then the locked line; the film-strip history is pinned to the stage bottom. Grid view replaces the hero with three film strips of four 136px frames each.

Phone (390): the band shrinks to 52px; the rail becomes a horizontal row of style chips; Single/Grid become icon-only segments; the hero is 240px; Randomize spans full width over a row of six equal icon buttons; the history strip shows seven 44px frames; customize becomes a bottom sheet with part tabs and one row of tiles.

Spacing runs on a 4px base with 8px as the working module (4, 8, 12, 16, 20, 24, 28). Option tiles are 56px (wide crops 88x40) in a 6-column grid with 8px gaps; swatches are 24px with 8px gaps; history frames are 64px with 12px gaps. Padding inside columns is 20px (rail 12px horizontal); the band uses 24px.

**The Everything Visible Rule.** At 1440x900, every part of the current style fits the customize panel without scrolling. Tighten section padding before introducing a scroll.

## Elevation & Depth

Depth is physical paper: white prints rest on photo paper under soft, ambient, two-layer shadows. There are no hard offset shadows and no glows. Film bands are flat on paper. Hairlines, not shadows, separate the columns. Dark keeps the same structure with deeper black shadows, and gives film one edge so it separates from a ground that is itself nearly film.

### Shadow Vocabulary

- **Print** (`box-shadow: 0 1px 3px rgb(20 21 22/.12), 0 18px 40px -12px rgb(20 21 22/.24)`): the hero print only.
- **Small print** (`box-shadow: 0 1px 2px rgb(20 21 22/.14), 0 3px 8px -2px rgb(20 21 22/.12)`): thumbnail prints, the current style row or chip, the active segment.
- **Ink button** (`box-shadow: 0 1px 2px rgb(20 21 22/.3), 0 8px 20px -8px rgb(20 21 22/.45)`): the primary Randomize button.
- **Sheet** (`box-shadow: 0 -1px 0 var(--rule), 0 -12px 32px -12px rgb(20 21 22/.25)`): the phone customize sheet.
- **Dark print / small print / ink button** (`0 1px 3px rgb(0 0 0/.5), 0 22px 44px -14px rgb(0 0 0/.7)`; `0 1px 2px rgb(0 0 0/.5), 0 3px 8px -2px rgb(0 0 0/.45)`; `0 1px 2px rgb(0 0 0/.5), 0 8px 20px -8px rgb(0 0 0/.6)`): the same three roles in dark.
- **Strip edge** (`--strip-shadow`; none in light, `inset 0 0 0 1px #3a3d42, 0 12px 28px -14px rgb(0 0 0/.85)` in dark): the history strip in dark only, a sprocket-tone inset edge and a low drop so the strip reads as film laid on the darkroom table. The dark band takes a 1px band edge underneath instead of a shadow.

### Named Rules

**The Paper Lifts, Film Lies Flat Rule.** Shadows belong to paper objects (prints, the selected row, the active segment, the ink button, the sheet). Film bands and their contents never take a shadow; the one exception is the strip edge in dark, which separates the strip from the dark ground and never lands on anything inside the strip.

## Shapes

Small, honest radii on one scale: 3, 4, 6, 7, 10, 16 and pill; earlier one-offs (8px small buttons, 9px band buttons, 5px key caps) were normalized onto it. Prints are nearly square-cornered (3px thumbnails, 4px hero and the image inside a tile) like real photographic prints; key caps are 4px; tiles, film strips, band segments and frame-shape segments are 6px; inner segments, mini, ghost and small buttons 7px; main controls, rows, band buttons and the toast 10px; the phone sheet top 16px; swatches and tab pills are full pills. Key caps carry a 2px bottom border to read as keys. Film strips repeat 9x6 sprocket holes (1.5px radius) along both edges. Avatars carry their own frame shape (circle, squircle or square, per style), clipped inside the print; the chrome does not round them.

The grease-pencil marks are the one non-geometric shape: a wobbly ellipse that overshoots its start, a two-pass underline, and L-shaped crop corners, all with round caps and a shared turbulence "wax" filter. Every mark path is normalized to a path length of 1, so any mark can be drawn on in its own stroke direction.

## Components

### Buttons

Bordered, quiet and standard; the ink button is the only filled one.

- **Shape:** gently rounded (10px), 48px tall for actions, 40px square for toolbar icons, 32px for small buttons, 28px for mini buttons.
- **Primary:** ink fill, paper text, Title type, a Lucide dice icon and a `Space` key cap. One per view (Randomize; "Roll new sheet" in Grid).
- **Secondary:** print white (dark surface in dark), control-edge border, ink text (PNG with a chevron, Copy SVG, Keep frame).
- **Mini / lock toggle:** 28px control-edge squares in each part header (roll and lock). The pressed lock is ink filled with a paper icon (in dark: light ink fill, dark icon).
- **On film:** film-raised fill, band-control-edge border, band text (GitHub, theme). On the phone, GitHub and the theme button collapse to 36px icon squares.
- **Hover:** bordered buttons (secondary, small, toolbar icon, mini) fill to the tray and their border darkens to control-edge-hover (#737875, 3.6:1 on the tray, so hover keeps the 3:1 edge; dark keeps control-edge, 3.8:1 on the dark tray); the ink button keeps its fill and gains a 3px ring of its own colour at 22% around its shadow; a pressed lock keeps its ink fill. Option tiles hover by darkening their border to the control edge; history and grid frames hover by brightening the shot (108%). Transitions are 120ms on background, border and shadow.
- **Pressed:** secondary, small and toolbar buttons (and the ink button) translate down 1px while held.
- **Focus:** 2px ink outline, 2px offset, on every control. On the film band and the film strip the ring uses band text instead, so it shows against film in both themes.

- **Key caps:** print-white fill, a 1px rule-2 border with a 2px bottom edge (the key's depth, neutral grey, never an accent), 4px radius, Label type at 0.04em. Inside the ink button they take the primary key cap colours.

### Segmented controls

- **Style:** tray track with hairline border and 3px padding; segments are text-on-transparent in graphite.
- **State:** the pressed segment is the pressed surface, ink text, small print shadow. The band version uses a film-raised track with a band-control-edge border; its pressed segment is the sprocket tone (film-on-dark in dark) with an inset band-control-edge ring and band text.
- **Theme toggle:** on desktop a band segmented control of two icon segments (sun, moon); the pressed segment is the current theme.

### Option tiles and swatches

- **Tiles:** 56px print-white squares (dark surface in dark), hairline border at rest, control edge on hover, 6px radius, showing the visitor's own avatar cropped to the part. Radio-group semantics.
- **Swatches:** 24px circles with a 1px inset swatch ring.
- **Selected:** a red grease-pencil loop drawn around the tile or swatch; no fill or border change.

### Navigation

- **Style rail:** rows of a 56px print thumbnail, style name (Title), part list (Body Small), and a key cap with the shortcut number. The current row is print white with the small print shadow and a red loop on its thumbnail (`aria-current`).
- **Phone:** the rail becomes chips (36px print plus first word of the name); the customize sections become pill tabs with control-edge borders, active tab ink filled, locked tabs carrying a lock icon and yellow underline. In dark the pressed tab is not filled with ink: it takes the pressed-surface fill with an ink border and ink text, so a yellow underline on it survives (8.3:1 against that fill).

### Film strip (signature)

A film-black band, 6px radius, with sprocket rows top and bottom. Frames are avatar shots with edge-print numbers beneath, newest at the right; the current frame is circled in red and its number turns paper. In Grid view the strip becomes the contact sheet itself: three strips of four large frames, numbered on from the current frame. Clicking a frame circles it; Keep frame stays disabled until one is circled, then adopts it under its number and returns to Single view.

### Hero print and crop marks

The current avatar on a white print with the print shadow; four red grease-pencil crop corners sit outside it, marking the export frame.

### Lock annotation

A locked part shows the ink pressed lock toggle in its header and a yellow grease-pencil underline under its section title; the "Randomize keeps" line lists each locked part as a lock icon plus name, underlined in yellow.

### Motion

Motion tells the contact-sheet story and nothing else. Two easings and four durations (see the sidecar): ease-out `cubic-bezier(.16,1,.3,1)` for movement and drawing, ease-develop `cubic-bezier(.33,0,.2,1)` for the print developing; fast 120ms, base 240ms, slow 360ms, develop 560ms. Marks draw on along their own stroke (path length 1, dash offset 1 to 0).

- **Roll (the focal moment):** the strip shifts one frame to the left by FLIP over 360ms on ease-out; the new frame lands from the right (28px, fading in) over 360ms with its red loop drawing on in 240ms; the hero print develops from overexposure (bright, low contrast, desaturated, settling to the true image) over 560ms on ease-develop; the four crop marks redraw in 240ms. The strip keeps the last nine frames.
- **Pick:** the old loop lifts (a 120ms fade, then removed), the new loop draws on in 240ms, and the hero print swaps with a 120ms fade-up.
- **Lock:** the yellow underline draws on left to right in 240ms under the section title and under the new chip in the "Randomize keeps" line. Unlocking removes it.
- **Grid:** the three strips of the contact sheet enter staggered at 0, 40 and 80ms, each rising 10px and fading in over 300ms.
- **Restore from history:** the loop lifts from the current frame and draws on around the chosen one; the print swaps.
- **Copy SVG / Copy share link:** an ink toast ("SVG copied", "Link copied", `role=status`) fades in over 120ms and rises 8px over 240ms at the bottom centre, then hides after 1.6s. It hugs its text and carries a 1px band-control-edge hairline, so it stays distinct where it overlaps the film strip (ink on film in light). A bad share link gets the same toast for 4s: "That link didn’t work, so here’s a fresh avatar."
- **No queue:** every roll restarts the motion (classes are replayed), so rapid rolls never pile up. Space rolls only when no control has focus (so Space still activates a focused button) and never on key repeat.
- **Reduced motion:** no slide and no draw. The strip does not shift; loop, underline, develop, frame landing and grid entrance all become 120ms fades; the crop marks do not redraw; the toast fades without moving.
- **Static renders:** the PNGs show the settled state; motion is live only in `../docs/avatar/motion-demo.html`.

**The One Focal Moment Rule.** The roll is the only sequence; every other change is a single short gesture (a lift, a draw, a swap). Nothing animates on load except the grid entrance, and nothing loops.

## Do's and Don'ts

### Do:

- **Do** keep chrome to paper, ink, film and graphite so the avatars carry all colour.
- **Do** use red grease pencil (pencil-red) only for the current pick: loops on the selected item and crop marks on the export frame.
- **Do** use yellow grease pencil (pencil-yellow) only for locks, always beside the ink pressed lock toggle.
- **Do** keep marks `aria-hidden` and carry state in semantics (`aria-checked`, `aria-current`, `aria-pressed`).
- **Do** set edge-print labels and frame numbers in Barlow Condensed 600, uppercase and tracked, with tabular numerals.
- **Do** preview options on the visitor's own avatar, cropped to the part.
- **Do** size tiles, frames, swatches and gaps on the 8px module.
- **Do** border every control with the control edge (on paper) or band control edge (on film), holding 3:1 in both themes.
- **Do** swap the pencils to their brightened dark values in dark, keeping one job each.
- **Do** keep prints paper in dark; only the chrome and ground go to film.

### Don't:

- **Don't** use red or yellow for errors, emphasis, links, hover or decoration.
- **Don't** let a grease-pencil mark replace a standard control or be the only signal of state.
- **Don't** add colour to the chrome (no accent tints, coloured buttons or gradients).
- **Don't** put shadows on film bands or their contents (the dark strip edge is the one exception), and don't use hard offset shadows.
- **Don't** border a control with the hairline; it does not reach 3:1.
- **Don't** use generic part icons in place of avatar previews.
- **Don't** set a condensed uppercase line above a headline as a decorative kicker.
