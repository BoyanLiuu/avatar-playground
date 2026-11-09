---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Playground surface

Scope: the main playground screen (style list, stage, customize panel, history, Grid view), desktop 1440 and phone 390. Visitor mode: **Operate**. Design artifacts live outside the repo: `../docs/avatar/mockups/` renders PNGs to `../docs/avatar/` (light), `../docs/avatar/dark/` (dark) and the live `../docs/avatar/motion-demo.html`; the app route `src/app/page.tsx` implements it in M2.

Audience and job: a casual visitor makes a profile avatar in a short playful session: pick a style, roll, tweak parts on their own avatar, lock keepers, export or share. Primary action: Randomize. Proof: real avatars from the engine, never placeholders.

Memorable moment: frames piling onto the film strip as you roll, and the red grease-pencil loop jumping to whatever you just chose.

Decision: chosen unattended (owner delegated, reviews PNGs later). Alternates rendered for review: Departure Board (split-flap, competitive challenger) and Flip Book (Impeccable's pick).

Phone (390): the same controls as desktop, compacted: style chips, Single/Grid as icon toggles, the full toolbar, Randomize from, and every part (Frame included) as tabs in the customize sheet.

Unresolved: final product name. (Decided: light and dark, following the OS; English only, no language switch.)

## Direction contract

THESIS: The playground is a contact sheet. Every roll is a new frame on a numbered film strip, and the visitor edits like a photographer, circling keepers in grease pencil. It refuses the category default: a near-black editor with one neon accent and a properties panel of generic part icons.

OWN-WORLD: Photo-paper white work area, film-black bands for the top bar and the history strip, graphite greys for chrome. Avatars carry all the colour. Red grease pencil loops mark the current pick (style, option, swatch, history frame, crop marks on the export frame); yellow grease pencil underlines mark what is locked, beside a standard pressed lock toggle in ink. Barlow Condensed for edge-print labels and frame numbers, Barlow for interface text (one superfamily; Geist was dropped as an overused face), tabular numerals. Dark theme: the same sheet on a darkroom table: film-black chrome and ground, prints stay paper, pencils brightened; the theme follows the OS until the visitor picks one.

STORY: The visitor sees a large print of their avatar, hits Randomize, watches the strip advance and the new print develop from overexposure while the loop moves to the new frame, picks options previewed on their own face, locks what they like, and downloads or copies a link.

FIRST VIEWPORT: Top film band with the name and GitHub. Left rail: six styles with contact-print thumbnails. Centre: the avatar as a 400px print with red crop marks showing the export frame, the toolbar, then Randomize (ink, primary) beside PNG and Copy SVG. Bottom of the stage: the film-strip history, current frame circled. Right panel: every part of the style visible without scrolling.

FORM: Candidate 4 of 7 (photographer's contact sheet with grease pencil); seed:0c6210ce0bf299b2. Raises: from the lexicon plate, colour belongs to the avatars and chrome stays black, white and graphite. From the airport band, red does one job (current choice) and yellow one job (locked). From the high-density web, every part fits the panel at 1440x900 without scrolling. From the Crouwel grid, one 8px module sizes tiles, frames and swatches. From the cassette j-card, hand marks annotate standard controls and never replace them.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
