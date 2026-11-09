# Product

<!-- impeccable:product-schema 1 -->

> Facts marked **[inferred]** come from `docs/avatar/implementation-plan.md` and the planning conversation, not from an interview: the owner delegated these choices ("choose what fits the most") and will review later. Confirm or correct them.

## Platform

web

## Users

- **Primary [inferred]:** people who want a fun avatar for a profile (GitHub, Slack, social accounts, a personal site) and are willing to spend a few minutes playing for it. They arrive from a shared link or from the owner's site `boyanliu.me`, mostly on a desktop browser, sometimes on a phone.
- **Secondary [inferred]:** developers and designers who need generated avatars (placeholders, test users) and want an SVG/PNG quickly.
- **Owner:** Boyan Liu, who builds this as a personal fun project and shows it from `boyanliu.me`.

The job: get from nothing to "that's me / that's the one" in a handful of rolls and a few tweaks, then take the file with them.

## Product Purpose

A playground that generates avatars in six styles. The visitor picks a style, rolls random avatars within it, tweaks any part, locks what they like so further rolls keep it, then downloads PNG/SVG, copies the SVG, or shares a link that recreates the exact avatar.

Success [inferred]: a first-time visitor rolls within seconds without instructions, finds an avatar they want to keep within a minute or two, and exports or shares it.

## Positioning

- **Six distinct styles, one engine.** Flat Cartoon, Pixel Art, Robots, Line Doodle, Monsters, Geometric; each style declares its own parts, and the customize panel is generated from that list.
- **Every option is previewed on your own avatar.** Option tiles show the current avatar with that one part swapped, cropped to the part, instead of generic part icons.
- **Randomness with control.** Per-part locks survive Randomize; each part has its own roll; "Shuffle unlocked" re-rolls the rest.
- **The link is the avatar.** The share URL encodes the full configuration; no account, no server, no storage.

## Operating Context

- Short, playful sessions; many rapid rolls (keyboard: `Space` randomize, `1`–`6` switch style, `⌘Z` / `⇧⌘Z` undo/redo).
- Output goes into other products: profile-picture uploaders (square or circle crops), chat apps, READMEs, design files. Export sizes PNG 256/512/1024 (Pixel Art 200/400/800/1000), SVG.
- A history strip of recent results; a Single / Grid toggle where Grid shows 12 random candidates to choose from.
- Desktop first; responsive down to a 390 px phone (style list becomes chips, customize panel becomes a sheet).

## Capabilities and Constraints

- **v1 scope:** the six styles above; randomize within the style or across any style; customize panel with option tiles, colour swatches, lock and per-part roll; frame (circle / squircle / square) and background; undo / redo / flip / reset; history (last 12); export PNG / SVG / Copy SVG; share link; Grid view.
- **Language:** English only; no language switch (owner decision, 2026-11-09).
- **Later (not v1):** more styles (Emoji, Kawaii Animals, Identicon, Initials), React-component export, npm engine package.
- **Technical:** Next.js 16 + React 19 + shadcn/ui (Base UI), client-only and statically exportable; the avatar engine renders deterministic 200×200 SVG strings shown through `<img>` data URLs; configs from URLs are validated (zod enums) before rendering.
- **Terminology:** style, part, option, swatch, lock, roll / Randomize, Shuffle unlocked, seed, history, frame.
- **Undecided:** product name beyond the working title "Avatar Playground" (repository `avatar-playground`); whether it later mounts as a route inside `boyanliu.me`.

## Brand Commitments

- Working name **Avatar Playground**; the owner wants "avatar" emphasized in naming.
- A personal project by Boyan Liu; no logo or brand assets exist yet.

## Evidence on Hand

- Real avatar artwork: the six style generators in `prototype/generate.mjs` and rendered sheets in `../docs/avatar/01-…10-*.png`.
- Earlier UI mockups (layout reference only): `../docs/avatar/playground-*.png`.
- No users, testimonials, usage numbers, or press exist. Do not invent counts ("10k avatars made"), quotes, or logos.

## Product Principles

1. **The avatar is the hero.** Interface chrome recedes; the current avatar is the largest, clearest thing on screen.
2. **Show, don't name.** Choices are previewed on the visitor's own avatar, never as abstract labels or generic icons.
3. **Chance with a steering wheel.** Randomness is the fun; locks and per-part rolls keep the visitor in control.
4. **Instant and local.** No sign-up, no waiting, nothing leaves the browser except what the visitor exports or shares.
5. **Styles are first-class.** Each style brings its own parts and character; the playground adapts to it rather than forcing one schema.

## Accessibility & Inclusion

- [inferred] Fully keyboard operable: styles, option tiles (radio-group semantics, arrow keys), lock toggles (`aria-pressed`, labelled).
- [inferred] WCAG 2.2 AA contrast for text and controls; Lighthouse accessibility ≥ 95 (plan M6). Respect reduced motion.
- Skin-tone and hair options span a range; avatars must not depend on one default.
