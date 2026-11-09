// Shared human geometry for Flat Cartoon and Line Doodle. The canonical head is the ellipse
// cx=100 cy=92 rx=38 ry=44; eyes sit at y=99 (x=86 and 114), the mouth near y=120.
import { circleD } from "../geometry";

export const BODY = "M24 206 C26 170 52 152 100 152 C148 152 174 170 176 206 Z";
export const BEARD =
  "M62 96 C60 138 80 154 100 154 C120 154 140 138 138 96 C136 112 128 124 118 128 C108 123 92 123 82 128 C72 124 64 112 62 96 Z";
export const FULL_BEARD =
  "M62 96 C60 138 80 154 100 154 C120 154 140 138 138 96 C134 108 128 114 118 114 C110 112 90 112 82 114 C72 114 66 108 62 96 Z";

const SHORT_FRONT =
  "M61 96 C54 62 72 40 100 40 C128 40 146 62 139 96 L136 96 C135 84 132 76 128 70 C112 64 88 64 72 70 C68 76 65 84 64 96 Z";

/** The haircuts both styles share: shapes behind the head and in front of it. */
export type Haircut =
  "short" | "long" | "bun" | "curly" | "side" | "bob" | "beanie" | "spiky";

type Hair = { back: readonly string[]; front: readonly string[] };

const curls = Array.from({ length: 13 }, (_, k) => {
  const a = ((160 + k * (220 / 12)) * Math.PI) / 180;
  return circleD(100 + 44 * Math.cos(a), 88 + 46 * Math.sin(a), 13);
});

export const HAIR: Record<Haircut, Hair> = {
  short: { back: [], front: [SHORT_FRONT] },
  side: {
    back: [],
    front: [
      "M60 100 C52 58 74 38 104 38 C134 38 150 60 140 100 L137 100 C136 86 133 74 124 66 C108 78 86 82 66 80 C64 86 63 92 63 100 Z",
    ],
  },
  long: {
    back: [
      "M57 92 C52 44 148 44 143 92 L150 162 C138 168 124 164 120 154 L80 154 C76 164 62 168 50 162 Z",
    ],
    front: [
      "M58 108 C50 54 74 40 100 40 C126 40 150 54 142 108 L138 108 C137 88 128 70 100 60 C72 70 63 88 62 108 Z",
    ],
  },
  bob: {
    back: [
      "M55 98 C49 44 151 44 145 98 L147 132 C147 140 139 142 133 138 L67 138 C61 142 53 140 53 132 Z",
    ],
    front: [
      "M58 106 C50 52 74 40 100 40 C126 40 150 52 142 106 L136 106 C136 92 135 84 134 76 Q100 82 66 76 C65 84 64 92 64 106 Z",
    ],
  },
  bun: {
    back: [circleD(100, 38, 17)],
    front: [
      "M61 92 C56 60 74 44 100 44 C126 44 144 60 139 92 L136 92 C134 80 130 72 124 68 C110 62 90 62 76 68 C70 72 66 80 64 92 Z",
    ],
  },
  curly: { back: [], front: [SHORT_FRONT, ...curls] },
  spiky: {
    back: [],
    front: [
      "M61 96 C58 80 60 66 66 58 L60 44 L76 49 L78 32 L92 43 L100 26 L108 43 L122 32 L124 49 L140 44 L134 58 C140 66 142 80 139 96 L136 96 C134 84 131 77 126 72 C110 66 90 66 74 72 C69 77 66 84 64 96 Z",
    ],
  },
  // The beanie is drawn by each style in its own colours.
  beanie: { back: [], front: [] },
};
