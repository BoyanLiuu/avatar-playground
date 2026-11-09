// Words for screen readers: swatch colours by name instead of hex, and the avatar described by its
// parts ("bun hair, oval eyes, open mouth").
import { type Section, type StyleDef, optionLabel } from "@/content/styles";
import type { Config } from "@/engine/types";

const hsl = (hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === r
      ? ((g - b) / d + 6) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return { h: h * 60, s, l };
};

/** A plain colour name for a #rrggbb swatch: "light pink", "tan", "dark blue". */
export const colorName = (hex: string) => {
  const { h, s, l } = hsl(hex);
  if (s < 0.14 || l > 0.97 || l < 0.08) {
    if (l > 0.92) return "white";
    if (l < 0.16) return "black";
    return l > 0.65 ? "light grey" : l > 0.35 ? "grey" : "dark grey";
  }
  const tone = (light: string) =>
    l > 0.84 ? "pale " : l > 0.68 ? light : l < 0.3 ? "dark " : "";
  // Muted oranges are skin, hair and earth tones.
  if (h >= 12 && h < 40 && s < 0.65) {
    if (l > 0.78) return `${tone("light ")}peach`;
    if (l > 0.6) return "tan";
    if (l > 0.45) return "light brown";
    return `${tone("")}brown`;
  }
  const hue =
    h < 12 || h >= 345
      ? l > 0.66
        ? "pink"
        : "red"
      : h < 40
        ? l > 0.78
          ? "peach"
          : l < 0.45
            ? "brown"
            : "orange"
        : h < 65
          ? "yellow"
          : h < 160
            ? "green"
            : h < 195
              ? "teal"
              : h < 245
                ? "blue"
                : h < 290
                  ? "purple"
                  : "pink";
  return `${tone("light ")}${hue}`;
};

/** Names for a palette, numbered where two swatches share a name ("light blue 2"). */
export const colorNames = (colors: readonly string[]) => {
  const seen = new Map<string, number>();
  return colors.map((c) => {
    const name = colorName(c);
    const n = (seen.get(name) ?? 0) + 1;
    seen.set(name, n);
    return n > 1 ? `${name} ${n}` : name;
  });
};

const partWords = (section: Section, config: Config) => {
  const title = section.title.toLowerCase().replace(/ colour$/, "");
  if (section.kind === "tiles") {
    const k = section.options.indexOf(String(config[section.key]));
    if (k < 0) return "";
    if (section.options[k] === "none") return `no ${title}`;
    const label = optionLabel(section, k).toLowerCase();
    // "two eyes" and "horns" stand alone; "oval" becomes "oval eyes".
    const stem = title.replace(/s$/, "");
    const words =
      section.bare || label.includes(stem) ? label : `${label} ${title}`;
    return section.sub
      ? `${words} (${colorName(String(config[section.sub.key]))})`
      : words;
  }
  const colour = colorName(String(config[section.key]));
  return section.kind === "frame"
    ? `${colour} ${section.key === "accent" ? "accent" : "background"}`
    : `${colour} ${title}`;
};

/** "light purple background, tan skin, bun hair (dark navy), oval eyes, …" */
export const describeAvatar = (style: StyleDef, config: Config) =>
  style.sections
    .map((s) => partWords(s, config))
    .filter(Boolean)
    .join(", ");
