// Renders one playground UI mockup per style (HTML -> PNG) using the real avatar generator.
// usage: node mockup.mjs <outDir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLES, makeRng, RX, BH } from './generate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(process.argv[2] ?? join(HERE, 'out'));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CSS = readFileSync(join(HERE, 'mockup.css'), 'utf8');
const byslug = (s) => STYLES.find((x) => x.slug === s);
const seedOf = (slug) => 7000 + STYLES.findIndex((x) => x.slug === slug) + 1;

// ------------------------------------------------ per-style playground definitions
const W2 = '66 83 68 34'; // eyes crop for 200x200 human heads
const DEFS = [
  {
    slug: 'flat-cartoon', seed: '4f2a9c', parts: 'hair · eyes · mouth · glasses · clothes',
    main: { bg: '#E6E0FF', skin: '#DDA586', hairC: '#2B2B3A', shirt: '#F6B04B', hair: 'bun', eyes: 'oval', mouth: 'open', glasses: 'round', collar: 'crew', earRoll: true },
    sections: [
      { kind: 'frame', key: 'bg', list: ['#FFD9DE', '#D4EEFF', '#E6E0FF', '#FFF0C2', '#D5F5E3', '#FFE2CC', '#F3E0F7', '#DDF3F5', 'linear-gradient(135deg,#8EC5FC,#E0C3FC)', 'transparent'] },
      { title: 'Skin', key: 'skin', list: ['#FAD7C4', '#F2C1A6', '#DDA586', '#B97A5A', '#8C5A43'], locked: true },
      { title: 'Hair', key: 'hair', tiles: ['short', 'long', 'bun', 'curly', 'side', 'bob', 'beanie', 'spiky'], crop: '34 18 132 132', locked: true, sub: { label: 'Colour', key: 'hairC', list: ['#2B2B3A', '#5A3825', '#C8743B', '#E9C46A', '#7B6CF6', '#E5637F', '#3E7CB1', '#3B2A20'] } },
      { title: 'Eyes', key: 'eyes', tiles: ['dot', 'oval', 'happy', 'wink'], crop: W2, wide: true, extra: { glasses: 'none' } },
      { title: 'Mouth', key: 'mouth', tiles: ['smile', 'open', 'smirk', 'o'], crop: '74 108 52 26', wide: true, extra: { glasses: 'none' } },
      { title: 'Glasses', key: 'glasses', tiles: ['none', 'round', 'square'], crop: '58 80 84 42', wide: true },
    ],
  },
  {
    slug: 'pixel-art', seed: '91c0de', parts: 'hair · eyes · mouth · palette',
    main: { bg: '#8EC5FF', skin: '#D1916A', hc: '#3B2A20', shirt: '#E84A5F', hair: 'spiky', eyes: 'big', mouth: 'smile', stripe: true, blush: true, capRoll: 0.1, sp1: 3, sp2: 11 },
    sections: [
      { kind: 'frame', key: 'bg', list: ['#8EC5FF', '#FFB3C7', '#B8F2C2', '#FFE08A', '#C9B6FF', '#FFC59E', '#9FE7E0', '#F4B8E4'] },
      { title: 'Skin', key: 'skin', list: ['#FFD8B8', '#F1B48C', '#D1916A', '#A86B4C', '#7A4A33'], locked: true },
      { title: 'Hair', key: 'hair', tiles: ['flat', 'spiky', 'long', 'cap', 'bun', 'mohawk', 'bald'], crop: '20 0 160 160', sub: { label: 'Colour', key: 'hc', list: ['#3B2A20', '#1E1E2E', '#E6B655', '#D9573B', '#6C4AB6', '#3E9C8C', '#F2F2F2', '#E85D9A'] } },
      { title: 'Eyes', key: 'eyes', tiles: ['normal', 'big', 'shades', 'happy'], crop: '40 64 120 60', wide: true },
      { title: 'Mouth', key: 'mouth', tiles: ['smile', 'flat', 'open'], crop: '50 90 100 50', wide: true },
      { title: 'Shirt', key: 'shirt', list: ['#3D7BF7', '#E84A5F', '#2EB872', '#F5A623', '#8E44AD', '#22313F', '#FF7F50'] },
    ],
  },
  {
    slug: 'robots', seed: 'b07a11', parts: 'head · screen · antenna · glow',
    main: { bg: '#1F2A44', metal: '#F2C14E', glow: '#5CF2FF', w: 100, h: 84, rad: 24, eyes: 'round', mouth: 'eq', ant: 'ball', eqH: [6, 10, 4, 12, 7, 9, 5] },
    sections: [
      { kind: 'frame', key: 'bg', list: ['#1F2A44', '#E8ECF4', '#FFE8D6', '#D9F2EC', '#2B2D42', '#EFE5FF', '#FFF4CC', '#DDEBFF'] },
      { title: 'Body colour', key: 'metal', list: ['#C9D1DC', '#F2C14E', '#F28F6B', '#7FC8C8', '#A99BF2', '#F25F5C', '#8E9AAF', '#9AD17D'], locked: true },
      { title: 'Head shape', tiles: [{ w: 100, h: 84, rad: 10 }, { w: 100, h: 84, rad: 24 }, { w: 104, h: 86, rad: 38 }, { w: 112, h: 78, rad: 16 }], crop: '20 10 160 160' },
      { title: 'Eyes', key: 'eyes', tiles: ['round', 'pill', 'arc', 'cross', 'visor', 'ring', 'heart'], crop: '56 66 88 44', wide: true },
      { title: 'Mouth', key: 'mouth', tiles: ['eq', 'line', 'smile', 'dots'], crop: '56 84 88 44', wide: true },
      { title: 'Glow', key: 'glow', list: ['#5CF2FF', '#7CFF6B', '#FF5CA8', '#FFD23F', '#B18CFF', '#FF8A3D'] },
      { title: 'Antenna', key: 'ant', tiles: ['ball', 'double', 'dish', 'none'], crop: '40 4 120 60', wide: true },
    ],
  },
  {
    slug: 'line-doodle', seed: '3e8f02', parts: 'hair · brows · nose · shirt · accent',
    main: { accent: '#A0C4FF', hair: 'bob', eyes: 'dot', brow: 'raised', nose: 'M99 99 C94 108 97 113 104 111', shirt: 'stripes', beardRoll: false, mouth: 'smile', glasses: false, ax: 118, ay: 88, blush: true },
    sections: [
      { kind: 'frame', title: 'Frame & accent', key: 'accent', list: ['#FFB4A2', '#A0C4FF', '#FDE68A', '#B9F3C8', '#F5B8FF', '#9BF6FF', '#FFD6A5', '#C7B8FF'] },
      { title: 'Hair', key: 'hair', tiles: ['short', 'bob', 'bun', 'curly', 'long', 'side', 'spiky', 'beanie'], crop: '34 18 132 132', locked: true },
      { title: 'Eyes', key: 'eyes', tiles: ['dot', 'line', 'closed'], crop: W2, wide: true },
      { title: 'Brows', key: 'brow', tiles: ['flat', 'raised', 'angry'], crop: '68 70 64 32', wide: true },
      { title: 'Nose', key: 'nose', tiles: ['M100 97 L95 110 L102 111', 'M99 99 C94 108 97 113 104 111', 'M96 108 Q100 112 104 108'], crop: '76 92 48 24', wide: true },
      { title: 'Mouth', key: 'mouth', tiles: ['smile', 'flat', 'open', 'smirk'], crop: '74 108 52 26', wide: true },
      { title: 'Shirt', key: 'shirt', tiles: ['plain', 'stripes', 'collar', 'pocket'], crop: '20 130 160 80', wide: true },
    ],
  },
  {
    slug: 'monsters', seed: 'c4d915', parts: 'body · eyes · horns · mouth',
    main: { bg: '#E8F7FF', body: '#7C5CFF', top: 'horns', eyesN: 2, mouth: 'grin', pattern: 'spots', lid: false, cheeks: true },
    sections: [
      { kind: 'frame', key: 'bg', list: ['#FFF1E6', '#E8F7FF', '#F0EBFF', '#E9FBEF', '#FFF8D6', '#FFE9EF', '#E6FAF8', '#F7EDE2'] },
      { title: 'Body colour', key: 'body', list: ['#7C5CFF', '#FF6B8B', '#2EC4B6', '#FFB703', '#8AC926', '#FF8C42', '#4CC9F0', '#C77DFF'], locked: true },
      { title: 'Eyes', tiles: [{ eyesN: 1, lid: false }, { eyesN: 2, lid: false }, { eyesN: 3, lid: false }, { eyesN: 2, lid: true }], crop: '36 62 128 64', wide: true },
      { title: 'Top', key: 'top', tiles: ['horns', 'antennae', 'sprout', 'ears', 'tuft', 'none'], crop: '30 18 140 70', wide: true },
      { title: 'Mouth', key: 'mouth', tiles: ['grin', 'fang', 'o', 'w', 'tongue'], crop: '60 112 80 40', wide: true },
      { title: 'Pattern', key: 'pattern', tiles: ['spots', 'belly', 'none'], crop: '0 0 200 200' },
    ],
  },
  {
    slug: 'geometric', seed: '7a2e64', parts: 'head · hair · eyes · palette',
    main: { bg: BH.yellow, headC: BH.teal, bodyC: BH.black, hairC: BH.red, decoC: BH.blue, splitC: BH.pink, headS: 'circle', hair: 'cap', eyes: 'circle', nose: 'tri', mouth: 'semi', deco: 'quarter', bodyS: 'trap', split: false, pdx: 3, cheek: true },
    sections: [
      { kind: 'frame', key: 'bg', list: [BH.yellow, BH.blue, BH.red, BH.cream, BH.teal, BH.pink] },
      { title: 'Face colour', key: 'headC', list: [BH.cream, BH.yellow, BH.pink, BH.red, BH.teal], locked: true },
      { title: 'Head shape', key: 'headS', tiles: ['circle', 'arch', 'square', 'pill'], crop: '30 26 140 140', extra: { hair: 'none' } },
      { title: 'Hair', key: 'hair', tiles: ['cap', 'block', 'triangle', 'bun', 'stripe', 'arc', 'none'], crop: '30 12 140 140', sub: { label: 'Colour', key: 'hairC', list: [BH.black, BH.blue, BH.red] } },
      { title: 'Eyes', key: 'eyes', tiles: ['circle', 'half', 'square', 'line'], crop: W2, wide: true },
      { title: 'Mouth', key: 'mouth', tiles: ['semi', 'bar', 'circle', 'arc'], crop: '76 112 48 24', wide: true },
      { title: 'Nose', key: 'nose', tiles: ['tri', 'quarter', 'circle', 'none'], crop: '76 96 48 24', wide: true },
    ],
  },
];

// ------------------------------------------------------------- rendering helpers
let uid = 0;
function avatar(style, r, fixed = {}, { viewBox = '0 0 200 200', frame = true, size } = {}) {
  const id = `a${uid++}`;
  const inner = style.draw(r, id, fixed);
  const body = frame ? `<defs><clipPath id="${id}-c"><rect width="200" height="200" rx="${RX[style.frame]}"/></clipPath></defs><g clip-path="url(#${id}-c)">${inner}</g>` : inner;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size ? ` width="${size}" height="${size}"` : ''} preserveAspectRatio="xMidYMid slice">${body}</svg>`;
}

const I = {
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  flip: '<path d="m3 7 5 5-5 5V7"/><path d="m21 7-5 5 5 5V7"/><path d="M12 20v2M12 14v2M12 8v2M12 2v2"/>',
  dice: '<rect width="18" height="18" x="3" y="3" rx="4"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" stroke-width="3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  lock: '<rect width="16" height="10" x="4" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect width="16" height="10" x="4" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1.3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/>',
  single: '<rect width="16" height="16" x="4" y="4" rx="4"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-5-4"/>',
};
const icon = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function page(def) {
  const style = byslug(def.slug);
  const seed = seedOf(def.slug);
  const draw = (over = {}, opts) => avatar(style, makeRng(seed), { ...def.main, ...over }, opts);

  const cards = DEFS.map((d) => {
    const st = byslug(d.slug);
    const on = d.slug === def.slug;
    const thumb = avatar(st, makeRng(seedOf(d.slug)), d.main);
    return `<div class="style${on ? ' on' : ''}"><div class="thumb">${thumb}</div><div><div class="name">${st.name}</div><div class="parts">${d.parts}</div></div>${on ? `<span class="check">${icon('check')}</span>` : ''}</div>`;
  }).join('');

  const hr = makeRng(seed + 40);
  const history = [draw(), ...Array.from({ length: 11 }, () => avatar(style, hr))].map((s, i) => `<div class="h${i === 0 ? ' on' : ''}">${s}</div>`).join('');

  const swatches = (key, list) => list.map((c) => `<i class="${def.main[key] === c ? 'on' : ''}${c === 'transparent' ? ' tp' : ''}" style="background:${c === 'transparent' ? '' : c}"></i>`).join('');
  const tiles = (sec) => sec.tiles.map((t) => {
    const over = typeof t === 'object' ? t : { [sec.key]: t };
    const on = Object.entries(over).every(([k, v]) => same(def.main[k], v));
    return `<div class="opt${sec.wide ? ' wide' : ''}${on ? ' on' : ''}">${draw({ ...(sec.extra ?? {}), ...over }, { viewBox: sec.crop, frame: false })}</div>`;
  }).join('');
  const head = (title, count, locked, dice = true) => `<div class="sechead"><b>${title}</b><span class="count">${count}</span><span class="acts">${dice ? `<span class="mini">${icon('dice', 15)}</span>` : ''}<span class="mini${locked ? ' on' : ''}">${icon(locked ? 'lock' : 'unlock', 15)}</span></span></div>`;
  const shapes = ['circle', 'squircle', 'square'].map((f) => `<span class="shape${(style.frame === f || (f === 'squircle' && style.frame === 'soft')) ? ' on' : ''}"><i style="border-radius:${{ circle: '99px', squircle: '6px', square: '1px' }[f]}"></i></span>`).join('');
  const right = def.sections.map((sec) => {
    if (sec.kind === 'frame') return `<div class="sec">${head(sec.title ?? 'Frame & background', `3 · ${sec.list.length}`, false)}<div class="shapes">${shapes}</div><div class="sw">${swatches(sec.key, sec.list)}</div></div>`;
    if (sec.list) return `<div class="sec">${head(sec.title, sec.list.length, sec.locked)}<div class="sw">${swatches(sec.key, sec.list)}</div></div>`;
    const sub = sec.sub ? `<div class="sublabel">${sec.sub.label}</div><div class="sw">${swatches(sec.sub.key, sec.sub.list)}</div>` : '';
    return `<div class="sec">${head(sec.title, sec.tiles.length, sec.locked)}<div class="opts c4">${tiles(sec)}</div>${sub}</div>`;
  }).join('');
  const lockedChips = def.sections.filter((s) => s.locked).map((s) => `<span class="lockchip">${icon('lock', 13)}${s.title}</span>`).join('');
  const partCount = def.sections.filter((s) => s.kind !== 'frame').length;

  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="app">
<header>
  <div class="brand"><span class="logo"></span>Avatar Playground<span class="badge">6 styles</span></div>
  <div class="row"><span class="seg"><span class="on">EN</span><span>中文</span></span><span class="btn">${icon('github')}GitHub</span></div>
</header>
<main>
  <aside class="left">
    <div class="label"><span>Style</span><span>6</span></div>
    ${cards}
    <div class="scope"><div class="label" style="padding:0"><span>Randomize scope</span></div>
      <span class="seg"><span class="on">This style</span><span>Any style</span></span>
      <div class="hint"><span class="kbd d">1</span>–<span class="kbd d">6</span> switch style</div>
    </div>
  </aside>
  <section class="stage">
    <div class="stagebar">
      <span class="chip"><b style="color:#ECECF1">${style.name}</b><span class="mono">seed ${def.seed}</span>${icon('link', 15)}</span>
      <span class="seg"><span class="on">${icon('single', 14)}Single</span><span>${icon('grid', 14)}Grid</span></span>
    </div>
    <div class="hero">${draw({}, { size: 400 })}</div>
    <div class="tools"><span class="tool">${icon('undo')}</span><span class="tool">${icon('redo')}</span><span class="tool">${icon('flip')}</span><span class="sep"></span><span class="tool">${icon('reset')}</span></div>
    <div class="actions">
      <span class="btn big primary">${icon('dice', 20)}Randomize<span class="kbd">Space</span></span>
      <span class="btn big">${icon('download')}PNG${icon('chevron', 16)}</span>
      <span class="btn big">${icon('code')}Copy SVG</span>
    </div>
    <div class="locked">Randomize keeps locked parts ${lockedChips}</div>
    <div class="history"><div class="label"><span>History</span><span class="mono">click to restore · ⌘Z / ⇧⌘Z</span></div><div class="hrow">${history}</div></div>
  </section>
  <aside class="right">
    <div class="rhead"><div><h2>Customize</h2><div class="sub">${style.name} · ${partCount} parts</div></div><span class="btn">${icon('dice', 16)}Shuffle unlocked</span></div>
    <div class="rbody">${right}</div>
  </aside>
</main></div></body></html>`;
}

mkdirSync(OUT, { recursive: true });
DEFS.forEach((def, i) => {
  const htmlPath = join(HERE, `mockup-${def.slug}.html`);
  writeFileSync(htmlPath, page(def));
  const png = join(OUT, `playground-${i + 1}-${def.slug}.png`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${join(HERE, '.chrome')}`, '--window-size=1600,1000', '--force-device-scale-factor=2', `--screenshot=${png}`, `file://${htmlPath}`], { stdio: 'ignore' });
  console.log(png);
});
