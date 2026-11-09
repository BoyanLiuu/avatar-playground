// Avatar style explorer: draws 10 common avatar styles as SVG parts + random picks,
// then renders PNG sheets with headless Chrome.
// usage: node generate.mjs <outDir> [--seed=7]
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(process.argv[2] ?? join(HERE, 'out'));
const SEED = Number((process.argv.find((a) => a.startsWith('--seed=')) ?? '--seed=7').split('=')[1]);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ---------------------------------------------------------------- helpers
const f = (v) => Math.round(v * 10) / 10;

export function makeRng(seed) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const decks = new Map();
  const r = {
    next,
    range: (a, b) => a + next() * (b - a),
    int: (a, b) => Math.floor(a + next() * (b - a + 1)),
    chance: (p) => next() < p,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    // draw without repeats until the deck is empty, so one sheet shows every option
    deck: (key, arr) => {
      let d = decks.get(key);
      if (!d || !d.length) {
        d = r.shuffle(arr);
        decks.set(key, d);
      }
      return d.pop();
    },
  };
  return r;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const ch = (c) => Math.round((t - c) * p + c);
  const [rr, gg, bb] = [ch(n >> 16), ch((n >> 8) & 255), ch(n & 255)];
  return `#${((1 << 24) | (rr << 16) | (gg << 8) | bb).toString(16).slice(1)}`;
}

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const c = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return `#${[c(0), c(8), c(4)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const circleD = (cx, cy, rr) =>
  `M${f(cx - rr)},${f(cy)}a${f(rr)},${f(rr)} 0 1,0 ${f(2 * rr)},0a${f(rr)},${f(rr)} 0 1,0 ${f(-2 * rr)},0Z`;

function closedSpline(pts) {
  const n = pts.length;
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return `${d}Z`;
}

function blobPath(cx, cy, rx, ry, n, jitter, r) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + (k / n) * Math.PI * 2;
    const j = 1 + (r.next() * 2 - 1) * jitter;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return closedSpline(pts);
}

const heartD = (x, y, s) =>
  `M${f(x)} ${f(y + s * 0.9)} C${f(x - s * 1.7)} ${f(y - s * 0.1)} ${f(x - s * 0.7)} ${f(y - s * 1.4)} ${f(x)} ${f(y - s * 0.4)} C${f(x + s * 0.7)} ${f(y - s * 1.4)} ${f(x + s * 1.7)} ${f(y - s * 0.1)} ${f(x)} ${f(y + s * 0.9)} Z`;

function starD(cx, cy, R, r0, n = 5) {
  let d = '';
  for (let k = 0; k < n * 2; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / n;
    const rr = k % 2 ? r0 : R;
    d += `${k ? 'L' : 'M'}${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)} `;
  }
  return `${d}Z`;
}

// ------------------------------------------------- shared human geometry
// canonical head: ellipse cx=100 cy=92 rx=38 ry=44; eyes y=99 at x=86/114; mouth y~120
const BODY = 'M24 206 C26 170 52 152 100 152 C148 152 174 170 176 206 Z';
const BEARD = 'M62 96 C60 138 80 154 100 154 C120 154 140 138 138 96 C136 112 128 124 118 128 C108 123 92 123 82 128 C72 124 64 112 62 96 Z';
const FULL_BEARD = 'M62 96 C60 138 80 154 100 154 C120 154 140 138 138 96 C134 108 128 114 118 114 C110 112 90 112 82 114 C72 114 66 108 62 96 Z';
const SHORT_FRONT = 'M61 96 C54 62 72 40 100 40 C128 40 146 62 139 96 L136 96 C135 84 132 76 128 70 C112 64 88 64 72 70 C68 76 65 84 64 96 Z';
const HAIR = {
  short: () => ({ back: [], front: [SHORT_FRONT] }),
  side: () => ({ back: [], front: ['M60 100 C52 58 74 38 104 38 C134 38 150 60 140 100 L137 100 C136 86 133 74 124 66 C108 78 86 82 66 80 C64 86 63 92 63 100 Z'] }),
  long: () => ({
    back: ['M57 92 C52 44 148 44 143 92 L150 162 C138 168 124 164 120 154 L80 154 C76 164 62 168 50 162 Z'],
    front: ['M58 108 C50 54 74 40 100 40 C126 40 150 54 142 108 L138 108 C137 88 128 70 100 60 C72 70 63 88 62 108 Z'],
  }),
  bob: () => ({
    back: ['M55 98 C49 44 151 44 145 98 L147 132 C147 140 139 142 133 138 L67 138 C61 142 53 140 53 132 Z'],
    front: ['M58 106 C50 52 74 40 100 40 C126 40 150 52 142 106 L136 106 C136 92 135 84 134 76 Q100 82 66 76 C65 84 64 92 64 106 Z'],
  }),
  bun: () => ({
    back: [circleD(100, 38, 17)],
    front: ['M61 92 C56 60 74 44 100 44 C126 44 144 60 139 92 L136 92 C134 80 130 72 124 68 C110 62 90 62 76 68 C70 72 66 80 64 92 Z'],
  }),
  curly: () => {
    const front = [SHORT_FRONT];
    for (let k = 0; k <= 12; k++) {
      const a = ((160 + k * (220 / 12)) * Math.PI) / 180;
      front.push(circleD(100 + 44 * Math.cos(a), 88 + 46 * Math.sin(a), 13));
    }
    return { back: [], front };
  },
  spiky: () => ({ back: [], front: ['M61 96 C58 80 60 66 66 58 L60 44 L76 49 L78 32 L92 43 L100 26 L108 43 L122 32 L124 49 L140 44 L134 58 C140 66 142 80 139 96 L136 96 C134 84 131 77 126 72 C110 66 90 66 74 72 C69 77 66 84 64 96 Z'] }),
};
const SKIN = ['#FAD7C4', '#F2C1A6', '#DDA586', '#B97A5A', '#8C5A43'];

// ------------------------------------------------------------ 1. flat
const flat = {
  name: 'Flat Cartoon',
  slug: 'flat-cartoon',
  frame: 'squircle',
  blurb: 'Half-body flat illustration, no outlines. The Avataaars / color-avatar family.',
  // fixed: override any pick (used by the playground to preview one part change)
  draw(r, id, fixed = {}) {
    const c = {
      bg: r.deck('bg', ['#FFD9DE', '#D4EEFF', '#E6E0FF', '#FFF0C2', '#D5F5E3', '#FFE2CC', '#F3E0F7', '#DDF3F5']),
      skin: r.deck('skin', SKIN),
      hairC: r.deck('hairC', ['#2B2B3A', '#5A3825', '#C8743B', '#E9C46A', '#7B6CF6', '#E5637F', '#3E7CB1', '#3B2A20']),
      shirt: r.deck('shirt', ['#5B8DEF', '#F28B82', '#43B883', '#F6B04B', '#9B7BEA', '#2F3A56', '#F06C9B', '#4FC3C8']),
      hair: r.deck('hair', ['short', 'long', 'bun', 'curly', 'side', 'bob', 'beanie', 'spiky']),
      eyes: r.deck('eyes', ['dot', 'oval', 'happy', 'wink', 'oval', 'dot', 'oval', 'happy']),
      mouth: r.deck('mouth', ['smile', 'open', 'smirk', 'o', 'smile', 'open']),
      glasses: r.deck('glasses', ['none', 'none', 'round', 'none', 'square', 'none', 'none', 'round']),
      collar: r.deck('collar', ['v', 'crew', 'shirt']),
      beardRoll: r.chance(0.45),
      earRoll: r.chance(0.35),
      hatRoll: r.next(),
      ...fixed,
    };
    const { bg, skin, hairC, shirt, hair, eyes, mouth, glasses, collar } = c;
    const beard = ['short', 'spiky', 'side', 'beanie'].includes(hair) && c.beardRoll;
    const ink = '#2B2B3A';
    const H = hair === 'beanie' ? { back: [], front: [] } : HAIR[hair](r);
    const paths = (ds, c) => ds.map((d) => `<path d="${d}" fill="${c}"/>`).join('');
    const neck = shade(skin, -0.1);
    const o = [
      `<rect width="200" height="200" fill="${bg}"/>`,
      `<circle cx="100" cy="108" r="80" fill="#fff" opacity=".45"/>`,
      paths(H.back, hairC),
      `<rect x="87" y="112" width="26" height="48" rx="12" fill="${neck}"/>`,
      `<path d="${BODY}" fill="${shirt}"/>`,
    ];
    if (collar === 'v') o.push(`<path d="M85 152 L100 172 L115 152 Z" fill="${neck}"/>`);
    if (collar === 'crew') o.push(`<path d="M84 153 Q100 166 116 153" fill="none" stroke="${shade(shirt, -0.18)}" stroke-width="5" stroke-linecap="round"/>`);
    if (collar === 'shirt') o.push(`<path d="M86 151 L100 166 L92 176 L80 156 Z M114 151 L100 166 L108 176 L120 156 Z" fill="#fff"/>`);
    o.push(`<circle cx="63" cy="97" r="9" fill="${skin}"/><circle cx="137" cy="97" r="9" fill="${skin}"/>`);
    o.push(`<ellipse cx="100" cy="92" rx="38" ry="44" fill="${skin}"/>`);
    if (beard) o.push(`<path d="${BEARD}" fill="${hairC}"/>`);
    o.push(`<path d="M79 86 Q86 81 93 85 M107 85 Q114 81 121 86" fill="none" stroke="${shade(hairC, -0.15)}" stroke-width="3.5" stroke-linecap="round"/>`);
    o.push(paths(H.front, hairC));
    if (hair === 'beanie') {
      const hats = ['#E5637F', '#3E7CB1', '#F6B04B', '#43B883'].filter((h) => h !== shirt);
      const hat = hats[Math.floor(c.hatRoll * hats.length)];
      o.push(`<path d="M58 86 C56 34 144 34 142 86 Z" fill="${hat}"/><rect x="54" y="72" width="92" height="18" rx="9" fill="${shade(hat, -0.15)}"/><circle cx="100" cy="38" r="9" fill="${shade(hat, 0.35)}"/>`);
    }
    const dot = (x) => `<circle cx="${x}" cy="99" r="4.5" fill="${ink}"/>`;
    const oval = (x) => `<ellipse cx="${x}" cy="99" rx="4.6" ry="6" fill="${ink}"/><circle cx="${x + 1.6}" cy="96.6" r="1.7" fill="#fff"/>`;
    const arc = (x) => `<path d="M${x - 6} 101 Q${x} 93 ${x + 6} 101" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`;
    const E = { dot: [dot, dot], oval: [oval, oval], happy: [arc, arc], wink: [oval, arc] }[eyes];
    o.push(E[0](86), E[1](114));
    o.push(`<path d="M100 102 Q95 110 101 112" fill="none" stroke="${shade(skin, -0.3)}" stroke-width="2.6" stroke-linecap="round"/>`);
    o.push(
      {
        smile: `<path d="M90 119 Q100 128 110 119" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`,
        open: `<path d="M88 117 Q100 136 112 117 Z" fill="${ink}"/><path d="M93 122.5 Q100 117 107 122.5 Q100 128 93 122.5 Z" fill="#FF7A8A"/>`,
        smirk: `<path d="M91 121 Q103 125 111 115" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`,
        o: `<ellipse cx="100" cy="121" rx="4.5" ry="5.5" fill="${ink}"/>`,
      }[mouth],
    );
    o.push(`<ellipse cx="76" cy="111" rx="7" ry="4.5" fill="#FF6B81" opacity=".28"/><ellipse cx="124" cy="111" rx="7" ry="4.5" fill="#FF6B81" opacity=".28"/>`);
    if (glasses === 'round') o.push(`<g fill="#fff" fill-opacity=".18" stroke="${ink}" stroke-width="3"><circle cx="86" cy="99" r="11"/><circle cx="114" cy="99" r="11"/></g><path d="M97 98 Q100 95 103 98 M75 97 L64 94 M125 97 L136 94" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`);
    if (glasses === 'square') o.push(`<g fill="#fff" fill-opacity=".18" stroke="${ink}" stroke-width="3"><rect x="74" y="90" width="24" height="18" rx="5"/><rect x="102" y="90" width="24" height="18" rx="5"/></g><path d="M98 97 L102 97 M74 96 L64 94 M126 96 L136 94" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`);
    if (!['long', 'curly', 'bob'].includes(hair) && c.earRoll) o.push(`<circle cx="63" cy="108" r="3.2" fill="#F6C343"/><circle cx="137" cy="108" r="3.2" fill="#F6C343"/>`);
    return o.join('');
  },
};

// ------------------------------------------------------------ 2. doodle
const INK = '#1D1D1F';
const doodle = {
  name: 'Line Doodle',
  slug: 'line-doodle',
  frame: 'circle',
  blurb: 'Hand-drawn monoline, solid black hair, one accent colour. Notion / Open Peeps family.',
  draw(r, id, fixed = {}) {
    const cfg = {
      accent: r.deck('accent', ['#FFB4A2', '#A0C4FF', '#FDE68A', '#B9F3C8', '#F5B8FF', '#9BF6FF', '#FFD6A5', '#C7B8FF']),
      hair: r.deck('hair', ['short', 'bob', 'bun', 'curly', 'long', 'side', 'spiky', 'beanie']),
      eyes: r.deck('eyes', ['dot', 'line', 'closed', 'dot', 'line']),
      brow: r.deck('brow', ['flat', 'raised', 'angry', 'raised']),
      nose: r.deck('nose', ['M100 97 L95 110 L102 111', 'M99 99 C94 108 97 113 104 111', 'M96 108 Q100 112 104 108']),
      shirt: r.deck('shirt', ['plain', 'stripes', 'collar', 'pocket']),
      beardRoll: r.chance(0.45),
      mouth: r.deck('mouth', ['smile', 'flat', 'open', 'smirk']),
      glasses: r.chance(0.3),
      ax: f(r.range(112, 124)),
      ay: f(r.range(82, 96)),
      headD: blobPath(100, 92, 38, 44, 12, 0.02, r),
      blush: r.chance(0.5),
      ...fixed,
    };
    const accent = cfg.accent;
    const hair = cfg.hair;
    const eyes = cfg.eyes;
    const brow = cfg.brow;
    const nose = cfg.nose;
    const shirt = cfg.shirt;
    const beard = ['short', 'side', 'spiky'].includes(hair) && cfg.beardRoll;
    const mouth = beard ? 'smile' : cfg.mouth;
    const glasses = cfg.glasses;
    const S = (w = 3.2) => `stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
    const H = hair === 'beanie' ? { back: [], front: [] } : HAIR[hair](r);
    const inked = (ds) => ds.map((d) => `<path d="${d}" fill="${INK}" ${S()}/>`).join('');
    const o = [
      `<rect width="200" height="200" fill="#F7F4EE"/>`,
      `<circle cx="${cfg.ax}" cy="${cfg.ay}" r="62" fill="${accent}"/>`,
      inked(H.back),
      `<path d="M90 124 L89 158 M110 124 L111 158" fill="none" ${S()}/>`,
      `<defs><clipPath id="${id}-body"><path d="${BODY}"/></clipPath></defs><path d="${BODY}" fill="#fff"/>`,
    ];
    if (shirt === 'stripes') o.push(`<g clip-path="url(#${id}-body)" ${S(5)}>${[170, 182, 194].map((y) => `<path d="M20 ${y} L180 ${y}"/>`).join('')}</g>`);
    o.push(`<path d="${BODY}" fill="none" ${S()}/>`);
    if (shirt === 'collar') o.push(`<path d="M86 153 L100 168 L114 153" fill="none" ${S()}/>`);
    else o.push(`<path d="M86 154 Q100 163 114 154" fill="none" ${S()}/>`);
    if (shirt === 'pocket') o.push(`<path d="M124 176 L142 176 L142 190 Q133 195 124 190 Z" fill="none" ${S()}/>`);
    o.push(`<circle cx="63" cy="98" r="8.5" fill="#fff" ${S()}/><circle cx="137" cy="98" r="8.5" fill="#fff" ${S()}/>`);
    o.push(`<path d="${cfg.headD}" fill="#fff" ${S()}/>`);
    if (beard) o.push(`<path d="${FULL_BEARD}" fill="${INK}" ${S()}/>`);
    o.push(`<path d="${{ flat: 'M80 85 L92 84 M108 84 L120 85', raised: 'M80 87 Q86 80 92 84 M108 84 Q114 80 120 87', angry: 'M80 82 L92 87 M108 87 L120 82' }[brow]}" fill="none" ${S(4.2)}/>`);
    o.push(inked(H.front));
    if (hair === 'beanie') o.push(`<path d="M58 86 C56 34 144 34 142 86 Z" fill="${accent}" ${S()}/><rect x="54" y="72" width="92" height="18" rx="9" fill="#fff" ${S()}/><circle cx="100" cy="38" r="9" fill="#fff" ${S()}/>`);
    if (eyes === 'dot') o.push(`<circle cx="86" cy="99" r="3.6" fill="${INK}"/><circle cx="114" cy="99" r="3.6" fill="${INK}"/>`);
    if (eyes === 'line') o.push(`<path d="M86 95 L86 102 M114 95 L114 102" fill="none" ${S(4.2)}/>`);
    if (eyes === 'closed') o.push(`<path d="M80 99 Q86 104 92 99 M108 99 Q114 104 120 99" fill="none" ${S()}/>`);
    o.push(`<path d="${nose}" fill="none" ${S()}/>`);
    const mc = beard ? '#fff' : INK;
    const MS = `stroke="${mc}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"`;
    o.push(
      {
        smile: `<path d="M90 121 Q100 129 110 121" fill="none" ${MS}/>`,
        flat: `<path d="M93 123 L107 123" fill="none" ${MS}/>`,
        open: `<path d="M90 119 Q100 134 110 119 Z" fill="${mc}" ${MS}/>`,
        smirk: `<path d="M92 123 Q103 126 110 117" fill="none" ${MS}/>`,
      }[mouth],
    );
    if (cfg.blush) o.push(`<path d="M70 116 L74 110 M75 116 L79 110 M121 116 L125 110 M126 116 L130 110" stroke="${shade(accent, -0.35)}" stroke-width="2.5" stroke-linecap="round"/>`);
    if (glasses) o.push(`<circle cx="86" cy="99" r="11.5" fill="${accent}" fill-opacity=".45" ${S()}/><circle cx="114" cy="99" r="11.5" fill="${accent}" fill-opacity=".45" ${S()}/><path d="M97.5 97 Q100 94 102.5 97 M74.5 97 L64 94 M125.5 97 L136 94" fill="none" ${S()}/>`);
    return o.join('');
  },
};

// ------------------------------------------------------------- 3. pixel
const pixel = {
  name: 'Pixel Art',
  slug: 'pixel-art',
  frame: 'square',
  blurb: '20x20 sprite with an auto-generated outline. Retro game look.',
  draw(r, id, fixed = {}) {
    const N = 20, C = 10, g = new Array(N * N).fill(null);
    const set = (x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < N) g[y * N + x] = c; };
    const box = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
    const cfg = {
      bg: r.deck('bg', ['#8EC5FF', '#FFB3C7', '#B8F2C2', '#FFE08A', '#C9B6FF', '#FFC59E', '#9FE7E0', '#F4B8E4']),
      skin: r.deck('skin', ['#FFD8B8', '#F1B48C', '#D1916A', '#A86B4C', '#7A4A33']),
      hc: r.deck('hc', ['#3B2A20', '#1E1E2E', '#E6B655', '#D9573B', '#6C4AB6', '#3E9C8C', '#F2F2F2', '#E85D9A']),
      shirt: r.deck('shirt', ['#3D7BF7', '#E84A5F', '#2EB872', '#F5A623', '#8E44AD', '#22313F', '#FF7F50']),
      hair: r.deck('hair', ['flat', 'spiky', 'long', 'cap', 'bun', 'mohawk', 'bald', 'long']),
      eyes: r.deck('eyes', ['normal', 'big', 'shades', 'happy', 'big', 'normal']),
      mouth: r.deck('mouth', ['smile', 'flat', 'open', 'smile']),
      stripe: r.chance(0.5),
      capRoll: r.next(),
      blush: r.chance(0.6),
      sp1: r.int(2, 4),
      sp2: r.int(10, 12),
      ...fixed,
    };
    const bg = cfg.bg;
    const skin = cfg.skin;
    const hc = cfg.hc;
    const shirt = cfg.shirt;
    const hair = cfg.hair;
    const eyes = cfg.eyes;
    const mouth = cfg.mouth;
    const dark = '#1B1B2F', skinS = shade(skin, -0.12);
    box(5, 16, 14, 16, shirt); box(3, 17, 16, 19, shirt);
    if (cfg.stripe) box(3, 18, 16, 18, shade(shirt, 0.3));
    box(8, 14, 11, 15, skinS); box(9, 16, 10, 16, skinS);
    box(5, 4, 14, 13, skin);
    [[5, 4], [14, 4], [5, 13], [14, 13]].forEach(([x, y]) => set(x, y, null));
    for (let y = 5; y <= 12; y++) set(14, y, skinS);
    box(4, 8, 4, 9, skin); box(15, 8, 15, 9, skinS);
    const flatTop = () => { box(6, 2, 13, 2, hc); box(5, 3, 14, 4, hc); box(5, 5, 7, 5, hc); box(11, 5, 14, 5, hc); set(5, 6, hc); set(14, 6, hc); };
    if (hair === 'flat') flatTop();
    if (hair === 'spiky') { [6, 9, 12].forEach((x) => { set(x, 1, hc); box(x, 2, x + 1, 2, hc); }); set(9, 0, hc); box(5, 3, 14, 4, hc); box(5, 5, 6, 5, hc); box(13, 5, 14, 5, hc); }
    if (hair === 'long') { flatTop(); box(4, 5, 5, 15, hc); box(14, 5, 15, 15, hc); }
    if (hair === 'cap') {
      const caps = ['#E84A5F', '#3D7BF7', '#2EB872', '#F5A623'].filter((x) => x !== shirt);
      const cap = caps[Math.floor(cfg.capRoll * caps.length)];
      box(6, 2, 13, 2, cap); box(5, 3, 14, 4, cap); box(5, 5, 17, 5, shade(cap, -0.25)); box(9, 3, 10, 3, '#FFFFFF'); set(5, 6, hc); set(14, 6, hc);
    }
    if (hair === 'bun') { flatTop(); box(8, 0, 11, 1, hc); }
    if (hair === 'mohawk') { box(9, 0, 10, 4, hc); box(8, 2, 11, 3, hc); }
    if (hair === 'bald') { set(7, 5, shade(skin, 0.4)); set(8, 5, shade(skin, 0.4)); set(7, 6, shade(skin, 0.4)); }
    if (eyes === 'normal') { box(7, 8, 7, 9, dark); box(12, 8, 12, 9, dark); }
    if (eyes === 'big') { box(7, 8, 8, 9, dark); set(7, 8, '#fff'); box(11, 8, 12, 9, dark); set(11, 8, '#fff'); }
    if (eyes === 'shades') { box(6, 8, 13, 8, '#111'); box(6, 9, 8, 9, '#111'); box(11, 9, 13, 9, '#111'); set(7, 8, '#5AC8FA'); set(12, 8, '#5AC8FA'); }
    if (eyes === 'happy') { set(6, 9, dark); set(7, 8, dark); set(8, 9, dark); set(11, 9, dark); set(12, 8, dark); set(13, 9, dark); }
    if (mouth === 'smile') { set(8, 11, dark); set(11, 11, dark); box(9, 12, 10, 12, dark); }
    if (mouth === 'flat') box(9, 12, 10, 12, dark);
    if (mouth === 'open') { box(9, 11, 10, 11, dark); box(9, 12, 10, 12, '#FF6B81'); }
    if (cfg.blush) { set(6, 10, '#FF8FA3'); set(13, 10, '#FF8FA3'); }
    const out = g.slice();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (g[y * N + x]) continue;
      const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const X = x + dx, Y = y + dy;
        return X >= 0 && X < N && Y >= 0 && Y < N && g[Y * N + X];
      });
      if (near) out[y * N + x] = dark;
    }
    let s = `<rect width="200" height="200" fill="${bg}"/>`;
    const spark = (cx, cy) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => `<rect x="${(cx + dx) * C}" y="${(cy + dy) * C}" width="${C}" height="${C}"/>`).join('');
    s += `<g fill="#fff" opacity=".65" shape-rendering="crispEdges">${spark(2, cfg.sp1)}${spark(18, cfg.sp2)}</g>`;
    s += '<g shape-rendering="crispEdges">';
    for (let y = 0; y < N; y++) {
      let x = 0;
      while (x < N) {
        const c = out[y * N + x];
        if (!c) { x++; continue; }
        let x2 = x;
        while (x2 + 1 < N && out[y * N + x2 + 1] === c) x2++;
        s += `<rect x="${x * C}" y="${y * C}" width="${(x2 - x + 1) * C}" height="${C}" fill="${c}"/>`;
        x = x2 + 1;
      }
    }
    return `${s}</g>`;
  },
};

// ------------------------------------------------------------- 4. emoji
const emoji = {
  name: 'Emoji',
  slug: 'emoji',
  frame: 'squircle',
  blurb: 'Round expressive faces with soft 3D shading. Reaction / fun-emoji style.',
  draw(r, id) {
    const bg = r.deck('bg', ['#E8F1FF', '#FFEFF3', '#EEFBF1', '#F4EEFF', '#FFF6E0', '#E9FAFB', '#FFEDE3', '#EEF0F6']);
    const Y = ['#FFE477', '#FFC83D', '#F29E1F'];
    const face = r.deck('face', [Y, Y, Y, Y, ['#FFB8CB', '#FF8FAE', '#E8648A'], ['#B8F0C8', '#7FD9A0', '#3FB370'], ['#C9D7FF', '#9FB4FF', '#6C84E8'], ['#FFC79A', '#FFA866', '#EB7A2E']]);
    const eyes = r.deck('eyes', ['dots', 'hearts', 'stars', 'happy', 'wink', 'cool', 'dots', 'happy']);
    const mouth = r.deck('mouth', ['grin', 'smile', 'tongue', 'o', 'smirk', 'grin', 'flat']);
    const extra = r.deck('extra', ['blush', 'none', 'sweat', 'blush', 'tear', 'blush']);
    const ink = '#5B3A1A';
    const o = [
      `<defs><radialGradient id="${id}-f" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${face[0]}"/><stop offset=".55" stop-color="${face[1]}"/><stop offset="1" stop-color="${face[2]}"/></radialGradient><clipPath id="${id}-m"><path d="M64 116 Q100 166 136 116 Z"/></clipPath></defs>`,
      `<rect width="200" height="200" fill="${bg}"/>`,
      `<ellipse cx="100" cy="178" rx="56" ry="8" fill="#000" opacity=".07"/>`,
      `<circle cx="100" cy="100" r="70" fill="url(#${id}-f)"/>`,
      `<ellipse cx="74" cy="60" rx="24" ry="12" transform="rotate(-32 74 60)" fill="#fff" opacity=".45"/>`,
    ];
    const ex = [76, 124], ey = 92;
    const dots = (x) => `<ellipse cx="${x}" cy="${ey}" rx="8" ry="11" fill="${ink}"/><circle cx="${x + 2.6}" cy="${ey - 4}" r="3" fill="#fff"/>`;
    const happy = (x) => `<path d="M${x - 11} ${ey + 4} Q${x} ${ey - 10} ${x + 11} ${ey + 4}" fill="none" stroke="${ink}" stroke-width="5.5" stroke-linecap="round"/>`;
    const E = {
      dots: [dots, dots],
      happy: [happy, happy],
      wink: [dots, happy],
      hearts: [(x) => `<path d="${heartD(x, ey, 12)}" fill="#F0304F"/><ellipse cx="${x - 6}" cy="${ey - 6}" rx="3" ry="2" fill="#fff" opacity=".7"/>`],
      stars: [(x) => `<path d="${starD(x, ey, 15, 6.5)}" fill="#FF4D6D" stroke="#C9184A" stroke-width="2.5" stroke-linejoin="round"/>`],
    }[eyes];
    if (eyes === 'cool') {
      o.push(`<path d="M50 80 H150 V86 Q148 108 126 110 Q108 110 104 90 H96 Q92 110 74 110 Q52 108 50 86 Z" fill="#1E1E24"/><path d="M60 88 L70 88 M110 88 L120 88" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`);
    } else {
      o.push(E[0](ex[0]), (E[1] ?? E[0])(ex[1]));
    }
    const S6 = `fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"`;
    o.push(
      {
        grin: `<path d="M64 116 Q100 166 136 116 Z" fill="${ink}"/><g clip-path="url(#${id}-m)"><rect x="60" y="112" width="80" height="11" fill="#fff"/><ellipse cx="100" cy="146" rx="20" ry="11" fill="#F0627E"/></g>`,
        smile: `<path d="M72 124 Q100 148 128 124" ${S6}/>`,
        tongue: `<path d="M96 134.7 C96 160 120 158 118 129.7 Z" fill="#F0627E"/><path d="M107 138 L108 150" stroke="#C94461" stroke-width="2.5" stroke-linecap="round"/><path d="M74 124 Q100 146 126 124" ${S6}/>`,
        o: `<ellipse cx="100" cy="134" rx="11" ry="14" fill="${ink}"/>`,
        smirk: `<path d="M82 134 Q108 138 124 120" ${S6}/>`,
        flat: `<path d="M78 132 L122 132" ${S6}/>`,
      }[mouth],
    );
    if (extra === 'blush') o.push(`<ellipse cx="60" cy="116" rx="12" ry="7" fill="#FF5C7A" opacity=".32"/><ellipse cx="140" cy="116" rx="12" ry="7" fill="#FF5C7A" opacity=".32"/>`);
    if (extra === 'sweat') o.push(`<path d="M146 44 Q158 62 146 70 Q134 62 146 44 Z" fill="#7FD3FF"/><ellipse cx="143" cy="62" rx="2" ry="3.5" fill="#fff" opacity=".8"/>`);
    if (extra === 'tear') o.push(`<path d="M70 106 Q80 122 70 128 Q60 122 70 106 Z" fill="#7FD3FF"/>`);
    return o.join('');
  },
};

// ------------------------------------------------------------ 5. robots
const robots = {
  name: 'Robots',
  slug: 'robots',
  frame: 'squircle',
  blurb: 'Boxy bots with glowing screen faces. The RoboHash / Bottts family.',
  draw(r, id, fixed = {}) {
    const cfg = {
      bg: r.deck('bg', ['#1F2A44', '#E8ECF4', '#FFE8D6', '#D9F2EC', '#2B2D42', '#EFE5FF', '#FFF4CC', '#DDEBFF']),
      metal: r.deck('metal', ['#C9D1DC', '#F2C14E', '#F28F6B', '#7FC8C8', '#A99BF2', '#F25F5C', '#8E9AAF', '#9AD17D']),
      glow: r.deck('glow', ['#5CF2FF', '#7CFF6B', '#FF5CA8', '#FFD23F', '#B18CFF', '#FF8A3D']),
      w: r.deck('w', [100, 92, 112, 104]),
      h: r.deck('h', [84, 90, 78, 86]),
      rad: r.deck('rad', [14, 24, 36, 10, 30]),
      eyes: r.deck('eyes', ['round', 'pill', 'arc', 'cross', 'visor', 'ring', 'heart']),
      mouth: r.deck('mouth', ['eq', 'line', 'smile', 'dots']),
      ant: r.deck('ant', ['ball', 'double', 'dish', 'none', 'ball']),
      eqH: Array.from({ length: 7 }, () => f(r.range(3, 12))),
      ...fixed,
    };
    const bg = cfg.bg;
    const dark = ['#1F2A44', '#2B2D42'].includes(bg);
    const metal = cfg.metal;
    const glow = cfg.glow;
    const w = cfg.w;
    const h = cfg.h;
    const rad = cfg.rad;
    const eyes = cfg.eyes;
    const mouth = cfg.mouth;
    const ant = cfg.ant;
    const hx = 100 - w / 2, hy = 52, D = shade(metal, -0.3), D2 = shade(metal, -0.45);
    const G = `filter="url(#${id}-g)"`;
    const o = [
      `<defs><filter id="${id}-g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><pattern id="${id}-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${dark ? '#fff' : '#000'}" stroke-opacity=".07"/></pattern></defs>`,
      `<rect width="200" height="200" fill="${bg}"/><rect width="200" height="200" fill="url(#${id}-grid)"/>`,
    ];
    if (ant === 'ball') o.push(`<path d="M100 ${hy} V${hy - 22}" stroke="${D}" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="${hy - 28}" r="7" fill="${glow}" ${G}/>`);
    if (ant === 'double') o.push(`<path d="M84 ${hy} L74 ${hy - 22} M116 ${hy} L126 ${hy - 22}" stroke="${D}" stroke-width="4" stroke-linecap="round"/><circle cx="73" cy="${hy - 25}" r="5" fill="${glow}" ${G}/><circle cx="127" cy="${hy - 25}" r="5" fill="${glow}" ${G}/>`);
    if (ant === 'dish') o.push(`<path d="M100 ${hy} V${hy - 14}" stroke="${D}" stroke-width="5"/><path d="M84 ${hy - 26} A16 12 0 0 0 116 ${hy - 26} Z" fill="${shade(metal, 0.2)}" stroke="${D}" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="${hy - 26}" r="3" fill="${glow}" ${G}/>`);
    o.push(`<rect x="86" y="${hy + h - 6}" width="28" height="${170 - (hy + h - 6)}" fill="${D}"/><path d="M86 ${hy + h + 6} H114 M86 ${hy + h + 13} H114" stroke="${D2}" stroke-width="2"/>`);
    o.push(`<rect x="38" y="156" width="124" height="70" rx="24" fill="${metal}"/><rect x="74" y="170" width="52" height="22" rx="7" fill="#14161F"/>`);
    o.push([glow, '#FF5C5C', '#FFD23F'].map((c, i) => `<circle cx="${88 + i * 12}" cy="181" r="3.6" fill="${c}" ${G}/>`).join(''));
    o.push(`<circle cx="52" cy="170" r="4" fill="${D}"/><circle cx="148" cy="170" r="4" fill="${D}"/>`);
    o.push(`<rect x="${hx - 9}" y="${hy + h / 2 - 15}" width="12" height="30" rx="4" fill="${D}"/><rect x="${hx + w - 3}" y="${hy + h / 2 - 15}" width="12" height="30" rx="4" fill="${D}"/>`);
    o.push(`<rect x="${hx}" y="${hy}" width="${w}" height="${h}" rx="${rad}" fill="${metal}"/><rect x="${hx + 12}" y="${hy + 5}" width="${f(w * 0.3)}" height="5" rx="2.5" fill="#fff" opacity=".45"/>`);
    if (rad <= 16) o.push(`<circle cx="${hx + 7}" cy="${hy + h - 7}" r="2.6" fill="${D}"/><circle cx="${hx + w - 7}" cy="${hy + h - 7}" r="2.6" fill="${D}"/>`);
    const sx = hx + 12, sy = hy + 15, sw = w - 24, sh = h - 30;
    o.push(`<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="${Math.max(rad - 10, 6)}" fill="#14161F"/>`);
    const ey = sy + sh / 2 - 7, my = sy + sh / 2 + 12;
    const eye = {
      round: (x) => `<circle cx="${x}" cy="${ey}" r="7" fill="${glow}"/>`,
      pill: (x) => `<rect x="${x - 8}" y="${ey - 4.5}" width="16" height="9" rx="4.5" fill="${glow}"/>`,
      arc: (x) => `<path d="M${x - 8} ${ey + 3} Q${x} ${ey - 8} ${x + 8} ${ey + 3}" fill="none" stroke="${glow}" stroke-width="4" stroke-linecap="round"/>`,
      cross: (x) => `<path d="M${x - 6} ${ey - 6} L${x + 6} ${ey + 6} M${x + 6} ${ey - 6} L${x - 6} ${ey + 6}" stroke="${glow}" stroke-width="3.6" stroke-linecap="round"/>`,
      ring: (x) => `<circle cx="${x}" cy="${ey}" r="7" fill="none" stroke="${glow}" stroke-width="3.4"/><circle cx="${x}" cy="${ey}" r="2.2" fill="${glow}"/>`,
      heart: (x) => `<path d="${heartD(x, ey, 7)}" fill="${glow}"/>`,
    };
    o.push(`<g ${G}>`);
    if (eyes === 'visor') o.push(`<rect x="72" y="${ey - 5}" width="56" height="10" rx="5" fill="${glow}"/>`);
    else o.push(eye[eyes](82), eye[eyes](118));
    const LS = `fill="none" stroke="${glow}" stroke-width="3.6" stroke-linecap="round"`;
    if (mouth === 'eq') for (let i = 0; i < 7; i++) { const hh = cfg.eqH[i]; o.push(`<rect x="${100 - 23.5 + i * 7}" y="${f(my - hh / 2)}" width="4" height="${hh}" rx="2" fill="${glow}"/>`); }
    if (mouth === 'line') o.push(`<path d="M88 ${my} L112 ${my}" ${LS}/>`);
    if (mouth === 'smile') o.push(`<path d="M86 ${my - 4} Q100 ${my + 8} 114 ${my - 4}" ${LS}/>`);
    if (mouth === 'dots') for (let i = 0; i < 5; i++) o.push(`<circle cx="${88 + i * 6}" cy="${my}" r="2.2" fill="${glow}"/>`);
    o.push('</g>');
    return o.join('');
  },
};

// ---------------------------------------------------------- 6. monsters
const monsters = {
  name: 'Monsters',
  slug: 'monsters',
  frame: 'squircle',
  blurb: 'Wobbly blob creatures with 1-3 eyes, horns and teeth. Playful, no humans needed.',
  draw(r, id, fixed = {}) {
    const cfg = {
      bg: r.deck('bg', ['#FFF1E6', '#E8F7FF', '#F0EBFF', '#E9FBEF', '#FFF8D6', '#FFE9EF', '#E6FAF8', '#F7EDE2']),
      body: r.deck('body', ['#7C5CFF', '#FF6B8B', '#2EC4B6', '#FFB703', '#8AC926', '#FF8C42', '#4CC9F0', '#C77DFF']),
      top: r.deck('top', ['horns', 'antennae', 'sprout', 'ears', 'tuft', 'none', 'horns']),
      eyesN: r.deck('eyesN', [1, 2, 3, 2, 1, 2]),
      mouth: r.deck('mouth', ['grin', 'fang', 'o', 'w', 'tongue', 'grin']),
      pattern: r.deck('pat', ['spots', 'belly', 'none', 'spots', 'belly']),
      bodyD: blobPath(100, 120, 62, 58, 9, 0.07, r),
      spotR: Array.from({ length: 16 }, () => r.next()),
      dx: r.range(-3, 3),
      dy: r.range(0, 3),
      lid: r.chance(0.3),
      cheeks: r.chance(0.5),
      ...fixed,
    };
    const bg = cfg.bg;
    const body = cfg.body;
    const top = cfg.top;
    const eyesN = cfg.eyesN;
    const mouth = cfg.mouth;
    const pattern = cfg.pattern;
    const D = shade(body, -0.22), L = shade(body, 0.35), ink = '#2B1B3F';
    const bodyD = cfg.bodyD;
    const o = [
      `<defs><clipPath id="${id}-b"><path d="${bodyD}"/></clipPath><clipPath id="${id}-m"><path d="M70 126 Q100 158 130 126 Z"/></clipPath></defs>`,
      `<rect width="200" height="200" fill="${bg}"/>`,
      `<ellipse cx="100" cy="184" rx="54" ry="7" fill="${shade(bg, -0.1)}"/>`,
    ];
    o.push(
      {
        horns: `<path d="M72 74 Q58 52 62 32 Q74 52 88 64 Z M128 74 Q142 52 138 32 Q126 52 112 64 Z" fill="#FFF4D6" stroke="#E0CFA6" stroke-width="2" stroke-linejoin="round"/>`,
        antennae: `<path d="M86 68 Q80 46 72 32 M114 68 Q120 46 128 32" fill="none" stroke="${D}" stroke-width="4.5" stroke-linecap="round"/><circle cx="72" cy="30" r="7" fill="#FFE066"/><circle cx="128" cy="30" r="7" fill="#FFE066"/>`,
        sprout: `<path d="M100 66 Q98 50 100 40" fill="none" stroke="#3FA34D" stroke-width="4" stroke-linecap="round"/><ellipse cx="90" cy="40" rx="11" ry="6" transform="rotate(-25 90 40)" fill="#59C267"/><ellipse cx="111" cy="36" rx="11" ry="6" transform="rotate(25 111 36)" fill="#59C267"/>`,
        ears: `<path d="M56 92 L60 50 L90 70 Z M144 92 L140 50 L110 70 Z" fill="${body}" stroke="${body}" stroke-width="8" stroke-linejoin="round"/><path d="M64 82 L66 60 L82 72 Z M136 82 L134 60 L118 72 Z" fill="${L}"/>`,
        tuft: `<path d="M88 66 Q90 44 98 56 Q100 36 106 56 Q112 44 114 66 Z" fill="${D}"/>`,
        none: '',
      }[top],
    );
    o.push(`<ellipse cx="42" cy="134" rx="10" ry="17" transform="rotate(28 42 134)" fill="${D}"/><ellipse cx="158" cy="134" rx="10" ry="17" transform="rotate(-28 158 134)" fill="${D}"/>`);
    o.push(`<ellipse cx="80" cy="176" rx="14" ry="9" fill="${D}"/><ellipse cx="120" cy="176" rx="14" ry="9" fill="${D}"/>`);
    o.push(`<path d="${bodyD}" fill="${body}"/>`);
    if (pattern === 'spots') {
      const spots = Array.from({ length: 4 }, (_, k) => {
        const q = cfg.spotR.slice(k * 4, k * 4 + 4);
        const a = (k / 4) * Math.PI * 2 + (q[0] * 0.8 - 0.4);
        return `<circle cx="${f(100 + Math.cos(a) * (46 + q[1] * 12))}" cy="${f(122 + Math.sin(a) * (40 + q[2] * 12))}" r="${f(6 + q[3] * 5)}"/>`;
      }).join('');
      o.push(`<g clip-path="url(#${id}-b)" fill="${L}" opacity=".7">${spots}</g>`);
    }
    if (pattern === 'belly') o.push(`<ellipse cx="100" cy="160" rx="30" ry="18" fill="${L}" opacity=".6"/>`);
    const layouts = { 1: [[100, 96, 22]], 2: [[78, 100, 14], [122, 100, 14]], 3: [[72, 104, 11], [100, 86, 12], [128, 104, 11]] };
    const { dx, dy, lid } = cfg;
    for (const [x, y, R] of layouts[eyesN]) {
      const p = R * 0.48, px = x + (dx * R) / 14, py = y + (dy * R) / 14;
      o.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="#fff"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(p)}" fill="${ink}"/><circle cx="${f(px - p * 0.35)}" cy="${f(py - p * 0.4)}" r="${f(p * 0.38)}" fill="#fff"/>`);
      if (lid) o.push(`<path d="M${x - R - 1} ${y} A${R + 1} ${R + 1} 0 0 1 ${x + R + 1} ${y} Z" fill="${D}"/>`);
    }
    const LS = `fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"`;
    o.push(
      {
        grin: `<path d="M70 126 Q100 158 130 126 Z" fill="${ink}"/><g clip-path="url(#${id}-m)"><ellipse cx="100" cy="146" rx="16" ry="8" fill="#FF6B8B"/></g><path d="M80 126 L86 134 L92 126 Z M108 126 L114 134 L120 126 Z" fill="#fff"/>`,
        fang: `<path d="M82 128 Q100 142 118 128" ${LS}/><path d="M105 134.5 L112.5 131.8 L109.5 140.5 Z" fill="#fff"/>`,
        o: `<ellipse cx="100" cy="134" rx="8" ry="10" fill="${ink}"/><ellipse cx="100" cy="139" rx="5" ry="3.5" fill="#FF6B8B"/>`,
        w: `<path d="M86 128 Q93 138 100 128 Q107 138 114 128" ${LS}/>`,
        tongue: `<path d="M94 133.2 C94 150 108 150 108 132.5 Z" fill="#FF6B8B"/><path d="M84 128 Q100 140 116 128" ${LS}/>`,
      }[mouth],
    );
    if (cfg.cheeks) o.push(`<ellipse cx="60" cy="124" rx="9" ry="5.5" fill="#FF5C8A" opacity=".35"/><ellipse cx="140" cy="124" rx="9" ry="5.5" fill="#FF5C8A" opacity=".35"/>`);
    return o.join('');
  },
};

// ------------------------------------------------------- 7. kawaii animals
const kawaii = {
  name: 'Kawaii Animals',
  slug: 'kawaii-animals',
  frame: 'circle',
  blurb: 'Big-head cute animals with blush and tiny mouths. Sticker / chibi style.',
  draw(r) {
    const bg = r.deck('bg', ['#FFE4EC', '#E3F2FF', '#E8F8E8', '#FFF3D6', '#EFE6FF', '#DDF4F1', '#FFE9DC', '#E9E4FF']);
    const animal = r.deck('animal', ['cat', 'bear', 'bunny', 'fox', 'panda', 'frog', 'cat', 'bear']);
    const expr = r.deck('expr', ['dots', 'happy', 'sparkle', 'dots', 'sleepy', 'sparkle']);
    let acc = r.deck('acc', ['none', 'bow', 'flower', 'leaf', 'hat', 'none']);
    if (animal === 'bunny' && acc === 'hat') acc = 'bow';
    const ink = '#2B2233', pink = '#FFB3C1';
    const C = { cat: r.pick(['#F6A04D', '#B4BCC6', '#F5E6CF']), bear: r.pick(['#B07D56', '#D2A679', '#8A6244']), bunny: r.pick(['#FFFFFF', '#F3E6D8', '#E7DDF5']), fox: r.pick(['#F28C38', '#EE7B3A']), panda: '#FFFFFF', frog: r.pick(['#7BC67E', '#9ED37A']) }[animal];
    const D = shade(C, -0.25);
    const o = [`<rect width="200" height="200" fill="${bg}"/>`, `<ellipse cx="100" cy="206" rx="54" ry="38" fill="${animal === 'panda' ? '#2D2D33' : C}"/>`];
    if (animal === 'cat') o.push(`<path d="M50 100 L58 44 L94 72 Z M150 100 L142 44 L106 72 Z" fill="${C}" stroke="${C}" stroke-width="10" stroke-linejoin="round"/><path d="M62 88 L64 58 L84 74 Z M138 88 L136 58 L116 74 Z" fill="${pink}" stroke="${pink}" stroke-width="4" stroke-linejoin="round"/>`);
    if (animal === 'bear') o.push(`<circle cx="64" cy="72" r="19" fill="${C}"/><circle cx="136" cy="72" r="19" fill="${C}"/><circle cx="64" cy="72" r="10" fill="${shade(C, 0.3)}"/><circle cx="136" cy="72" r="10" fill="${shade(C, 0.3)}"/>`);
    if (animal === 'bunny') o.push(`<ellipse cx="80" cy="48" rx="13" ry="34" transform="rotate(-12 80 48)" fill="${C}"/><ellipse cx="120" cy="48" rx="13" ry="34" transform="rotate(12 120 48)" fill="${C}"/><ellipse cx="80" cy="50" rx="6.5" ry="24" transform="rotate(-12 80 50)" fill="${pink}"/><ellipse cx="120" cy="50" rx="6.5" ry="24" transform="rotate(12 120 50)" fill="${pink}"/>`);
    if (animal === 'fox') o.push(`<path d="M48 104 L54 38 L96 70 Z M152 104 L146 38 L104 70 Z" fill="${C}" stroke="${C}" stroke-width="8" stroke-linejoin="round"/><path d="M60 86 L58 54 L82 72 Z M140 86 L142 54 L118 72 Z" fill="#FFF1E0" stroke="#FFF1E0" stroke-width="3" stroke-linejoin="round"/>`);
    if (animal === 'panda') o.push(`<circle cx="62" cy="72" r="18" fill="#2D2D33"/><circle cx="138" cy="72" r="18" fill="#2D2D33"/>`);
    if (animal === 'frog') o.push(`<circle cx="74" cy="80" r="23" fill="${C}"/><circle cx="126" cy="80" r="23" fill="${C}"/>`);
    o.push(animal === 'frog' ? `<ellipse cx="100" cy="118" rx="60" ry="44" fill="${C}"/>` : `<ellipse cx="100" cy="112" rx="56" ry="48" fill="${C}"/>`);
    if (animal === 'fox') o.push(`<path d="M44 114 Q72 112 100 138 Q128 112 156 114 Q152 158 100 160 Q48 158 44 114 Z" fill="#FFF6EC"/>`);
    if (animal === 'cat' && C === '#F6A04D') o.push(`<path d="M100 68 V80 M88 70 L91 80 M112 70 L109 80" stroke="${D}" stroke-width="4" stroke-linecap="round"/>`);
    if (animal === 'bear') o.push(`<ellipse cx="100" cy="130" rx="22" ry="16" fill="${shade(C, 0.45)}"/>`);
    if (animal === 'panda') o.push(`<ellipse cx="79" cy="112" rx="14" ry="17" transform="rotate(30 79 112)" fill="#2D2D33"/><ellipse cx="121" cy="112" rx="14" ry="17" transform="rotate(-30 121 112)" fill="#2D2D33"/>`);
    // eyes
    const eye = (x, y, color, s = 1) => {
      if (expr === 'happy') return `<path d="M${x - 8 * s} ${y + 2} Q${x} ${y - 8 * s} ${x + 8 * s} ${y + 2}" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round"/>`;
      if (expr === 'sleepy') return `<path d="M${x - 8 * s} ${y - 1} Q${x} ${y + 6 * s} ${x + 8 * s} ${y - 1}" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round"/>`;
      const big = expr === 'sparkle' ? 1.2 : 1;
      if (color !== ink) return `<circle cx="${x}" cy="${y}" r="${6.5 * big}" fill="#fff"/><circle cx="${x}" cy="${y + 0.5}" r="${4.2 * big}" fill="${ink}"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.6" fill="#fff"/>`;
      return `<ellipse cx="${x}" cy="${y}" rx="${f(6.5 * big * s)}" ry="${f(8.5 * big * s)}" fill="${ink}"/><circle cx="${f(x - 2 * s)}" cy="${f(y - 3.5 * s)}" r="${f(2.6 * big * s)}" fill="#fff"/><circle cx="${f(x + 2.4 * s)}" cy="${f(y + 3 * s)}" r="${f(1.2 * big * s)}" fill="#fff"/>`;
    };
    if (animal === 'frog') {
      o.push(`<circle cx="74" cy="78" r="14" fill="#fff"/><circle cx="126" cy="78" r="14" fill="#fff"/>`, eye(74, 79, ink, 0.9), eye(126, 79, ink, 0.9));
    } else if (animal === 'panda') {
      o.push(eye(80, 112, '#fff'), eye(120, 112, '#fff'));
    } else {
      o.push(eye(78, 112, ink), eye(122, 112, ink));
    }
    const by = animal === 'frog' ? 132 : 128;
    o.push(`<ellipse cx="${animal === 'frog' ? 62 : 64}" cy="${by}" rx="9" ry="5.5" fill="#FF8FA3" opacity=".55"/><ellipse cx="${animal === 'frog' ? 138 : 136}" cy="${by}" rx="9" ry="5.5" fill="#FF8FA3" opacity=".55"/>`);
    const LS = `fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
    if (animal === 'cat') o.push(`<path d="M95 121 Q100 119 105 121 Q102 126 100 126 Q98 126 95 121 Z" fill="#FF8FA3"/><path d="M92 129 Q96 134 100 129 Q104 134 108 129" ${LS}/><path d="M60 120 L40 116 M60 127 L40 129 M140 120 L160 116 M140 127 L160 129" stroke="${D}" stroke-width="2" stroke-linecap="round"/>`);
    if (animal === 'bear') o.push(`<ellipse cx="100" cy="123" rx="7" ry="5" fill="${ink}"/><path d="M100 128 V132 M93 132 Q96.5 137 100 132 Q103.5 137 107 132" ${LS}/>`);
    if (animal === 'bunny') o.push(`<ellipse cx="100" cy="122" rx="4.5" ry="3.2" fill="#FF8FA3"/><path d="M100 125 V129 M94 130 Q97 134 100 129 Q103 134 106 130" ${LS}/>`);
    if (animal === 'fox') o.push(`<ellipse cx="100" cy="134" rx="5.5" ry="4" fill="${ink}"/><path d="M94 140 Q97 143.5 100 140 Q103 143.5 106 140" ${LS}/>`);
    if (animal === 'panda') o.push(`<ellipse cx="100" cy="126" rx="6.5" ry="4.5" fill="${ink}"/><path d="M100 130 V133 M93 133 Q96.5 138 100 133 Q103.5 138 107 133" ${LS}/>`);
    if (animal === 'frog') o.push(`<circle cx="94" cy="114" r="1.8" fill="${ink}"/><circle cx="106" cy="114" r="1.8" fill="${ink}"/><path d="M70 126 Q100 148 130 126" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`);
    if (acc === 'bow') o.push(`<g transform="rotate(18 138 70)"><path d="M138 70 L122 60 L122 80 Z M138 70 L154 60 L154 80 Z" fill="#FF5C8A" stroke="#FF5C8A" stroke-width="6" stroke-linejoin="round"/><circle cx="138" cy="70" r="5" fill="#E8457A"/></g>`);
    if (acc === 'flower') o.push(`<g fill="#FF9EC4">${[0, 1, 2, 3, 4].map((k) => `<circle cx="${f(138 + Math.cos((k * 2 * Math.PI) / 5) * 7.5)}" cy="${f(70 + Math.sin((k * 2 * Math.PI) / 5) * 7.5)}" r="6.5"/>`).join('')}</g><circle cx="138" cy="70" r="5" fill="#FFC93C"/>`);
    if (acc === 'leaf') o.push(`<path d="M100 66 Q99 56 101 50" stroke="#3FA34D" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M101 52 Q112 36 124 44 Q114 58 101 52 Z" fill="#59C267"/>`);
    if (acc === 'hat') o.push(`<g transform="rotate(-12 100 64)"><path d="M84 68 L100 26 L116 68 Z" fill="#FFD166"/><path d="M89 55 L111 55 M94 42 L106 42" stroke="#FF6B8B" stroke-width="4"/><circle cx="100" cy="25" r="5" fill="#FF6B8B"/></g>`);
    return o.join('');
  },
};

// ---------------------------------------------------------- 8. geometric
const BH = { cream: '#F1E9DA', black: '#1E1E1E', red: '#D7263D', blue: '#1B4F9C', yellow: '#F4B400', teal: '#2E8B7A', pink: '#F29CA3' };
const geometric = {
  name: 'Geometric',
  slug: 'geometric',
  frame: 'square',
  blurb: 'Faces built from circles, arcs and triangles in a Bauhaus palette. Abstract, poster-like.',
  draw(r, id, fixed = {}) {
    const not = (...ex) => (c) => !ex.includes(c);
    const cfg = {
      bg: r.deck('bg', [BH.yellow, BH.blue, BH.red, BH.cream, BH.teal, BH.pink, BH.blue, BH.yellow]),
      headS: r.deck('head', ['circle', 'arch', 'square', 'pill']),
      hair: r.deck('hair', ['cap', 'block', 'triangle', 'bun', 'stripe', 'arc', 'none', 'cap']),
      eyes: r.deck('eyes', ['circle', 'half', 'square', 'line', 'circle']),
      nose: r.deck('nose', ['tri', 'quarter', 'circle', 'none']),
      mouth: r.deck('mouth', ['semi', 'bar', 'circle', 'arc']),
      deco: r.deck('deco', ['ring', 'quarter', 'stripes', 'dots']),
      bodyS: r.deck('body', ['semi', 'trap', 'tri']),
      rolls: Array.from({ length: 5 }, () => r.next()),
      split: r.chance(0.35),
      pdx: r.pick([-3, 0, 3]),
      cheek: r.chance(0.5),
      ...fixed,
    };
    const bg = cfg.bg;
    const rp = (list, k) => list[Math.floor(cfg.rolls[k] * list.length)];
    const headC = cfg.headC ?? rp([BH.cream, BH.yellow, BH.pink, BH.red, BH.teal].filter(not(bg)), 0);
    const bodyC = cfg.bodyC ?? rp(Object.values(BH).filter(not(bg, headC)), 1);
    const hairC = cfg.hairC ?? rp([BH.black, BH.blue, BH.red].filter(not(bg, headC, bodyC)), 2) ?? BH.black;
    const decoC = cfg.decoC ?? rp(Object.values(BH).filter(not(bg, headC, BH.black)), 3);
    const splitC = cfg.splitC ?? rp([BH.cream, BH.yellow, BH.pink].filter(not(headC, bg)), 4);
    const headS = cfg.headS;
    const hair = cfg.hair;
    const eyes = cfg.eyes;
    const nose = cfg.nose;
    const mouth = cfg.mouth;
    const deco = cfg.deco;
    const bodyS = cfg.bodyS;
    const headD = {
      circle: circleD(100, 92, 40),
      arch: 'M62 136 V92 A38 38 0 0 1 138 92 V136 Z',
      square: 'M62 52 H138 V136 H62 Z',
      pill: 'M100 48 A36 36 0 0 1 136 84 V100 A36 36 0 0 1 64 100 V84 A36 36 0 0 1 100 48 Z',
    }[headS];
    const o = [`<defs><clipPath id="${id}-h"><path d="${headD}"/></clipPath></defs>`, `<rect width="200" height="200" fill="${bg}"/>`];
    o.push(
      {
        ring: `<circle cx="158" cy="42" r="20" fill="none" stroke="${decoC}" stroke-width="10"/>`,
        quarter: `<path d="M200 0 V92 A92 92 0 0 1 108 0 Z" fill="${decoC}"/>`,
        stripes: `<g fill="${decoC}">${[0, 1, 2].map((k) => `<rect x="18" y="${22 + k * 12}" width="34" height="6"/>`).join('')}</g>`,
        dots: `<g fill="${decoC}">${[0, 1, 2].flatMap((k) => [0, 1, 2].map((m) => `<circle cx="${152 + k * 12}" cy="${24 + m * 12}" r="3.2"/>`)).join('')}</g>`,
      }[deco],
    );
    o.push(`<path d="${{ semi: 'M26 200 A74 74 0 0 1 174 200 Z', trap: 'M36 200 L58 150 L142 150 L164 200 Z', tri: 'M100 136 L178 200 L22 200 Z' }[bodyS]}" fill="${bodyC}"/>`);
    o.push(`<rect x="90" y="124" width="20" height="32" fill="${shade(headC, -0.15)}"/>`);
    if (hair === 'bun') o.push(`<circle cx="100" cy="40" r="15" fill="${hairC}"/>`);
    o.push(`<path d="${headD}" fill="${headC}"/>`);
    if (cfg.split) o.push(`<g clip-path="url(#${id}-h)"><rect x="100" y="0" width="100" height="200" fill="${splitC}"/></g>`);
    if (hair === 'cap' || hair === 'bun') o.push(`<path d="M58 82 A42 38 0 0 1 142 82 Z" fill="${hairC}"/>`);
    if (hair === 'block') o.push(`<rect x="58" y="40" width="84" height="32" fill="${hairC}"/>`);
    if (hair === 'triangle') o.push(`<path d="M54 80 L100 24 L146 80 Z" fill="${hairC}"/>`);
    if (hair === 'stripe') o.push(`<rect x="88" y="22" width="24" height="52" fill="${hairC}"/>`);
    if (hair === 'arc') o.push(`<path d="M56 96 A44 44 0 0 1 144 96" fill="none" stroke="${hairC}" stroke-width="14"/>`);
    const k = BH.black, wd = '#FBF7EF', pdx = cfg.pdx;
    for (const x of [84, 116]) {
      if (eyes === 'circle') o.push(`<circle cx="${x}" cy="98" r="9" fill="${k}"/><circle cx="${x + pdx}" cy="96" r="3.4" fill="${wd}"/>`);
      if (eyes === 'half') o.push(`<path d="M${x - 9} 96 A9 9 0 0 0 ${x + 9} 96 Z" fill="${k}"/>`);
      if (eyes === 'square') o.push(`<rect x="${x - 6}" y="92" width="12" height="12" fill="${k}"/>`);
      if (eyes === 'line') o.push(`<rect x="${x - 9}" y="96" width="18" height="5" fill="${k}"/>`);
    }
    const nc = decoC === headC ? bodyC : decoC;
    if (nose === 'tri') o.push(`<path d="M100 100 L91 118 L103 118 Z" fill="${nc}"/>`);
    if (nose === 'quarter') o.push(`<path d="M100 118 V104 A14 14 0 0 1 114 118 Z" fill="${nc}"/>`);
    if (nose === 'circle') o.push(`<circle cx="100" cy="110" r="5" fill="${nc}"/>`);
    const mc = headC === BH.red ? k : BH.red;
    if (mouth === 'semi') o.push(`<path d="M88 122 A12 12 0 0 0 112 122 Z" fill="${mc}"/>`);
    if (mouth === 'bar') o.push(`<rect x="86" y="123" width="28" height="6" fill="${mc}"/>`);
    if (mouth === 'circle') o.push(`<circle cx="100" cy="127" r="6.5" fill="${mc}"/>`);
    if (mouth === 'arc') o.push(`<path d="M86 122 A14 10 0 0 0 114 122" fill="none" stroke="${k}" stroke-width="5"/>`);
    if (cfg.cheek) o.push(`<circle cx="72" cy="117" r="7" fill="${headC === BH.pink ? BH.red : BH.pink}"/>`);
    return o.join('');
  },
};

// ---------------------------------------------------------- 9. identicon
const identicon = {
  name: 'Identicon',
  slug: 'identicon',
  frame: 'soft',
  blurb: 'Mirrored 5x5 grid hashed from a username. GitHub-style, no drawing needed.',
  draw(r) {
    const variant = r.deck('v', ['square', 'square', 'round', 'dot']);
    const hue = r.deck('hue', [0, 25, 45, 140, 170, 200, 230, 280, 320]);
    const fg = hsl(hue + r.range(-8, 8), 62, 52);
    let cells;
    do {
      cells = Array.from({ length: 15 }, () => r.chance(0.5));
    } while (cells.filter(Boolean).length < 7);
    const S = 28, P = 30;
    let s = `<rect width="200" height="200" fill="#F0F0F2"/><g fill="${fg}">`;
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      if (!cells[y * 3 + (x < 3 ? x : 4 - x)]) continue;
      const X = P + x * S, Y = P + y * S;
      if (variant === 'square') s += `<rect x="${X}" y="${Y}" width="${S}" height="${S}"/>`;
      if (variant === 'round') s += `<rect x="${X + 2}" y="${Y + 2}" width="${S - 4}" height="${S - 4}" rx="7"/>`;
      if (variant === 'dot') s += `<circle cx="${X + S / 2}" cy="${Y + S / 2}" r="11"/>`;
    }
    return `${s}</g>`;
  },
};

// ---------------------------------------------------------- 10. initials
const initials = {
  name: 'Initials',
  slug: 'initials',
  frame: 'circle',
  blurb: 'Monogram on a mesh gradient. The Slack / Gmail / Vercel fallback avatar.',
  draw(r, id) {
    const name = r.deck('name', ['Ava Chen', 'Boyan Liu', 'Kai Moreno', 'Mia Park', 'Leo Silva', 'Noor Haddad', 'Sam Okafor', 'Yuki Tanaka']);
    const ini = name.split(' ').map((p) => p[0]).join('');
    const h = r.deck('h', [0, 30, 160, 200, 230, 260, 290, 330]);
    const solid = r.deck('style', ['mesh', 'mesh', 'mesh', 'solid']) === 'solid';
    const T = `x="100" y="102" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif" font-size="74" font-weight="700" letter-spacing="-2"`;
    if (solid) return `<rect width="200" height="200" fill="${hsl(h, 70, 90)}"/><text ${T} fill="${hsl(h, 55, 38)}">${ini}</text>`;
    const blobs = [hsl(h + 40, 90, 62), hsl(h - 50, 95, 70), hsl(h + 120, 70, 78)]
      .map((c) => `<circle cx="${f(r.range(20, 180))}" cy="${f(r.range(20, 180))}" r="${f(r.range(60, 90))}" fill="${c}"/>`)
      .join('');
    return `<defs><filter id="${id}-blur" filterUnits="userSpaceOnUse" x="-60" y="-60" width="320" height="320"><feGaussianBlur stdDeviation="28"/></filter></defs><rect width="200" height="200" fill="${hsl(h, 85, 60)}"/><g filter="url(#${id}-blur)">${blobs}</g><text ${T} fill="#000" opacity=".12" transform="translate(0 3)">${ini}</text><text ${T} fill="#fff">${ini}</text>`;
  },
};

export const STYLES = [flat, doodle, pixel, emoji, robots, monsters, kawaii, geometric, identicon, initials];

// ------------------------------------------------------------- layout
const FONT = `font-family="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"`;
const RX = { squircle: 46, circle: 100, square: 8, soft: 28 };

export function tile(style, r, id) {
  const rx = RX[style.frame];
  return `<defs><clipPath id="${id}-frame"><rect width="200" height="200" rx="${rx}"/></clipPath></defs><rect y="5" width="200" height="200" rx="${rx}" fill="#1b1b1f" opacity=".07"/><g clip-path="url(#${id}-frame)">${style.draw(r, id)}</g>`;
}

function sheet(style, n) {
  const r = makeRng(SEED * 1000 + n);
  const cols = 4, rows = 2, S = 200, gap = 28, pad = 48, top = 116;
  const W = pad * 2 + cols * S + (cols - 1) * gap, H = top + rows * S + (rows - 1) * gap + pad;
  let tiles = '';
  for (let i = 0; i < cols * rows; i++) {
    const x = pad + (i % cols) * (S + gap), y = top + Math.floor(i / cols) * (S + gap);
    tiles += `<g transform="translate(${x} ${y})">${tile(style, r, `t${i}`)}</g>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#F5F4F0"/><text x="${pad}" y="64" ${FONT} font-size="30" font-weight="700" fill="#18181B">${String(n).padStart(2, '0')} · ${style.name}</text><text x="${pad}" y="92" ${FONT} font-size="15" fill="#71717A">${style.blurb}</text>${tiles}</svg>`;
  return { W, H, svg };
}

function overview() {
  const per = 4, sc = 0.6, S = 200 * sc, g = 12, cp = 22, gap = 24, pad = 40, top = 110;
  const cw = cp * 2 + per * S + (per - 1) * g, ch = 52 + S + cp + 6;
  const W = pad * 2 + 2 * cw + gap, H = top + 5 * ch + 4 * gap + pad;
  let body = '';
  STYLES.forEach((st, i) => {
    const r = makeRng(SEED * 1000 + i + 1);
    const cx = pad + (i % 2) * (cw + gap), cy = top + Math.floor(i / 2) * (ch + gap);
    body += `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="22" fill="#fff"/><text x="${cx + cp}" y="${cy + 36}" ${FONT} font-size="19" font-weight="700" fill="#18181B">${String(i + 1).padStart(2, '0')} · ${st.name}</text>`;
    for (let k = 0; k < per; k++) body += `<g transform="translate(${cx + cp + k * (S + g)} ${cy + 50}) scale(${sc})">${tile(st, r, `o${i}-${k}`)}</g>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#F5F4F0"/><text x="${pad}" y="62" ${FONT} font-size="32" font-weight="700" fill="#18181B">Avatar styles · overview</text><text x="${pad}" y="88" ${FONT} font-size="15" fill="#71717A">10 common avatar styles, each built from swappable SVG parts plus random picks.</text>${body}</svg>`;
  return { W, H, svg };
}

// -------------------------------------------------------------- output
export { flat, RX, BH };
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const svgDir = join(HERE, 'svg');
mkdirSync(svgDir, { recursive: true });
mkdirSync(OUT, { recursive: true });
const jobs = [{ file: '00-overview', ...overview() }, ...STYLES.map((st, i) => ({ file: `${String(i + 1).padStart(2, '0')}-${st.slug}`, ...sheet(st, i + 1) }))];
for (const j of jobs) {
  const svgPath = join(svgDir, `${j.file}.svg`);
  for (const tag of j.svg.match(/<[a-zA-Z][^>]*>/g)) {
    const names = [...tag.matchAll(/\s([a-zA-Z:-]+)="/g)].map((m) => m[1]);
    if (new Set(names).size !== names.length) throw new Error(`duplicate attribute in ${j.file}: ${tag.slice(0, 160)}`);
  }
  writeFileSync(svgPath, j.svg);
  if (process.argv.includes('--svg-only')) continue;
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${join(HERE, '.chrome')}`, `--window-size=${j.W},${j.H}`, '--force-device-scale-factor=2', `--screenshot=${join(OUT, `${j.file}.png`)}`, `file://${svgPath}`], { stdio: 'ignore' });
  console.log(`${j.file}.png`);
}
}
