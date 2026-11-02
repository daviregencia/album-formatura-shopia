'use strict';

/* ================= Configurações ================= */

const PAGE_W = 800, PAGE_H = 600;

const PALETTES = {
  ceu:      { name: 'Céu Azul',      bg: '#fbf8ef', c1: '#2f5fb3', c2: '#9cc9ec', c3: '#7b9fd1', c4: '#f2c94c', ink: '#3b5a8a' },
  arcoiris: { name: 'Arco-íris',     bg: '#fffaf0', c1: '#e8413c', c2: '#ffcf33', c3: '#3aa0e8', c4: '#6cc04a', ink: '#3a3266' },
  rosa:     { name: 'Rosa Encantado', bg: '#fff5f8', c1: '#e75a8d', c2: '#ffc2d6', c3: '#b78bdb', c4: '#ffb86b', ink: '#5a2a48' },
  oceano:   { name: 'Oceano',        bg: '#f2fbff', c1: '#1f6fb2', c2: '#7fd3f0', c3: '#2bb5a8', c4: '#ffd166', ink: '#173a5e' },
  floresta: { name: 'Floresta',      bg: '#f7fbef', c1: '#3c8d40', c2: '#a8d672', c3: '#e0a63a', c4: '#8a5a3c', ink: '#2e4223' },
  porDoSol: { name: 'Pôr do Sol',    bg: '#fff6ee', c1: '#f26b38', c2: '#ffb347', c3: '#c0397b', c4: '#6a4c93', ink: '#4a2340' },
};

// rot: se a moldura fica levemente inclinada
const FRAMES = [
  { id: 'impressa',    name: 'Borda branca', rot: true },
  { id: 'fita',       name: 'Fita adesiva', rot: true },
  { id: 'polaroid',    name: 'Polaroid',     rot: true },
  { id: 'classica',    name: 'Clássica',     rot: false },
  { id: 'arredondada', name: 'Arredondada',  rot: false },
  { id: 'pontilhada',  name: 'Pontilhada',   rot: true },
];

// posição de cada foto na página de 800x600
const LAYOUTS = {
  cover: [{ x: 60, y: 120, w: 330, h: 400, r: -3 }],
  1: [{ x: 60, y: 115, w: 390, h: 420, r: -2 }],
  '1v': [{ x: 110, y: 110, w: 330, h: 425, r: -2 }],
  '2h': [{ x: 150, y: 108, w: 500, h: 205, r: -1.5 }, { x: 150, y: 328, w: 500, h: 205, r: 1.5 }],
  2: [{ x: 60, y: 125, w: 325, h: 385, r: -2.5 }, { x: 415, y: 125, w: 325, h: 385, r: 2.5 }],
  3: [{ x: 50, y: 118, w: 380, h: 410, r: -1.5 }, { x: 465, y: 118, w: 285, h: 190, r: 2.5 }, { x: 465, y: 335, w: 285, h: 190, r: -2 }],
  4: [{ x: 75, y: 112, w: 305, h: 198, r: -2 }, { x: 420, y: 112, w: 305, h: 198, r: 2 }, { x: 75, y: 330, w: 305, h: 198, r: 1.5 }, { x: 420, y: 330, w: 305, h: 198, r: -1.5 }],
};

// estilo "Minha Formatura": sem faixa no topo, fotos maiores e espaço à direita para o nome na vertical
const LAYOUTS_F = {
  1: [{ x: 60, y: 42, w: 620, h: 476, r: -1.2 }],
  '1v': [{ x: 200, y: 30, w: 380, h: 492, r: -1.2 }],
  '2h': [{ x: 95, y: 28, w: 560, h: 240, r: -1 }, { x: 115, y: 282, w: 560, h: 240, r: 1 }],
  2: [{ x: 45, y: 60, w: 318, h: 440, r: -2 }, { x: 385, y: 60, w: 318, h: 440, r: 1.5 }],
  3: [{ x: 42, y: 40, w: 372, h: 480, r: -1.5 }, { x: 436, y: 40, w: 272, h: 226, r: 2 }, { x: 436, y: 292, w: 272, h: 226, r: -1.5 }],
  4: [{ x: 45, y: 40, w: 322, h: 228, r: -1.5 }, { x: 387, y: 40, w: 322, h: 228, r: 1.5 }, { x: 45, y: 290, w: 322, h: 228, r: 1 }, { x: 387, y: 290, w: 322, h: 228, r: -1 }],
};

const THEMES = {
  formatura: 'Minha Formatura',
  colorido: 'Colorido',
};

const PHOTO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 8"/></svg>';

/* ================= Armazenamento (IndexedDB) ================= */

const store = (() => {
  let dbp;
  const open = () => dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open('album-virtual', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const tx = async (mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction('kv', mode);
      const req = fn(t.objectStore('kv'));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    });
  };
  return {
    get: k => tx('readonly', s => s.get(k)),
    set: (k, v) => tx('readwrite', s => s.put(v, k)),
    del: k => tx('readwrite', s => s.delete(k)),
    clear: () => tx('readwrite', s => s.clear()),
  };
})();

/* ================= Estado ================= */

let album;
let photos = {};        // id -> dataURL
let current = 0;        // página selecionada no editor

const uid = () => Math.random().toString(36).slice(2, 10);

function newPage(kind) {
  return {
    id: uid(),
    kind: kind === 'cover' ? 'cover' : 'page',
    layout: kind === 'cover' ? 1 : kind,
    frame: 'fita',
    title: kind === 'cover' ? 'Álbum Virtual' : 'Título da página',
    caption: kind === 'cover' ? 'Os momentos mais especiais' : 'Escreva uma legenda',
    slots: [0, 1, 2, 3].map(() => ({ photo: null, x: 50, y: 50, z: 1 })),
  };
}

// mesma sequência de páginas do álbum físico "Minha Formatura"
function modelPages() {
  const cover = newPage('cover');
  Object.assign(cover, { frame: 'impressa', title: '', caption: '' });
  const seq = [1, 1, 1, 1, 3, 1, 1, 2, 4, 1, 1, 1, 1, 2, 4, 1];
  return [cover, ...seq.map((n, i) => Object.assign(newPage(n), {
    frame: 'impressa',
    title: i === 1 ? 'Nome do Formando' : '',
    caption: [3, 7, 13].includes(i) ? 'Minha Formatura' : '',
  }))];
}

// álbum completo do vídeo, com as fotos recortadas em fotos/
function albumFromVideo() {
  const m = window.MODELO_FORMATURA;
  const a = { title: m.title, theme: 'formatura', palette: 'ceu', photoOrder: [], pages: [] };
  const urls = {};
  if (m.paginas) {
    // álbum feito das páginas fotografadas, na ordem do álbum impresso
    a.pageSize = m.pageSize;
    a.pages = m.paginas.map(src => ({ id: uid(), kind: 'imagem', src, slots: [] }));
    return { album: a, urls };
  }
  const cover = newPage('cover');
  Object.assign(cover, { frame: 'impressa', title: '', caption: m.cover });
  a.pages.push(cover);
  for (const mp of m.pages) {
    const p = Object.assign(newPage(mp.layout), {
      frame: 'impressa', title: mp.title || '', caption: mp.caption || '',
      fundo: mp.fundo, rodape: mp.rodape, enfeites: mp.enfeites,
    });
    mp.photos.forEach((name, i) => {
      const id = 'v_' + name;
      urls[id] = (m.dir || 'fotos/') + name + '.jpg';
      if (!a.photoOrder.includes(id)) a.photoOrder.push(id);
      Object.assign(p.slots[i], { photo: id }, mp.pos && mp.pos[i]);
    });
    a.pages.push(p);
  }
  return { album: a, urls };
}

function loadVideoAlbum() {
  const { album: a, urls } = albumFromVideo();
  album = a;
  photos = urls;
  current = 0;
  store.clear()
    .then(() => Promise.all(Object.entries(urls).map(([id, u]) => store.set('photo:' + id, u))))
    .then(() => store.set('album', album))
    .catch(err => console.warn('Falha ao salvar', err));
  renderAll();
}

function newAlbum() {
  return { title: 'Minha Formatura', theme: 'formatura', palette: 'ceu', photoOrder: [], pages: modelPages() };
}

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => store.set('album', album).catch(err => console.warn('Falha ao salvar', err)), 300);
}

const page = () => album.pages[current];
const layoutSet = () => album.theme === 'formatura' ? LAYOUTS_F : LAYOUTS;
// álbuns feitos de páginas fotografadas usam o tamanho dessas páginas; os demais, 800x600
const pageSize = () => album.pageSize || [PAGE_W, PAGE_H];
function sizePage(root) {
  if (!album.pageSize) return root;
  root.style.width = album.pageSize[0] + 'px';
  root.style.height = album.pageSize[1] + 'px';
  return root;
}

const slotsGeo = p => p.kind === 'imagem' ? [] : p.kind === 'cover'
  ? (album.theme === 'formatura' ? [] : LAYOUTS.cover)
  : layoutSet()[p.layout];

/* ================= Renderização da página ================= */

function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function decorSVG(pal, seed) {
  const rand = rng(seed * 977 + 13);
  const cols = [pal.c1, pal.c2, pal.c3, pal.c4];
  let dots = '';
  for (let i = 0; i < 18; i++) {
    const x = 20 + rand() * 760, y = 20 + rand() * 560, r = 4 + rand() * 6;
    dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${cols[i % 4]}" opacity=".85"/>`;
  }
  return `<svg class="decor" viewBox="0 0 800 600" preserveAspectRatio="none">
    <path d="M0,0 H240 C205,60 130,62 95,125 C62,185 25,170 0,205 Z" fill="${pal.c2}"/>
    <path d="M800,0 V175 C742,155 722,92 652,72 C602,56 592,22 572,0 Z" fill="${pal.c3}"/>
    <path d="M0,600 V425 C52,447 82,518 162,538 C212,552 232,580 244,600 Z" fill="${pal.c4}"/>
    <path d="M800,600 H555 C598,560 660,562 702,510 C742,460 770,470 800,438 Z" fill="${pal.c1}"/>
    <path d="M30,250 q20,-25 40,0 t40,0" fill="none" stroke="${pal.ink}" stroke-width="3" stroke-linecap="round" opacity=".25"/>
    <path d="M690,300 q20,-25 40,0 t40,0" fill="none" stroke="${pal.ink}" stroke-width="3" stroke-linecap="round" opacity=".25"/>
    <g stroke="${pal.ink}" stroke-width="4" stroke-linecap="round" opacity=".7">
      <path d="M160,40 l-18,-10"/><path d="M158,56 h-22"/><path d="M160,72 l-18,10"/>
      <path d="M640,40 l18,-10"/><path d="M642,56 h22"/><path d="M640,72 l18,10"/>
    </g>
    ${dots}
  </svg>`;
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function editableText(cls, value, editable, onInput, placeholder = '') {
  const e = el('span', cls);
  e.textContent = value;
  if (editable) {
    e.contentEditable = 'true';
    e.spellcheck = false;
    e.dataset.ph = placeholder;
    e.addEventListener('input', () => {
      if (!e.textContent) e.innerHTML = '';
      onInput(e.textContent);
    });
    e.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); e.blur(); } });
  }
  return e;
}

function colorfulTitle(text, pal) {
  const cols = [pal.c1, pal.c2, pal.c3, pal.c4];
  let i = 0;
  return [...text].map(ch => ch === ' ' ? ' ' : `<span style="color:${cols[i++ % 4]}">${ch.replace(/[<>&]/g, '')}</span>`).join('');
}

function titleSize(text) {
  const n = text.length;
  return n <= 7 ? 76 : n <= 10 ? 62 : n <= 16 ? 50 : 40;
}

function applyPos(img, s) {
  img.style.objectPosition = `${s.x}% ${s.y}%`;
  img.style.transformOrigin = `${s.x}% ${s.y}%`;
  img.style.transform = `scale(${s.z})`;
}

/* ---------- Estilo "Minha Formatura" ---------- */

let svgId = 0;

function cloudShape(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff">
    <circle cx="0" cy="0" r="30"/><circle cx="38" cy="-16" r="38"/><circle cx="80" cy="-2" r="30"/>
    <circle cx="110" cy="10" r="20"/><rect x="-28" y="0" width="156" height="30" rx="15"/></g>`;
}

function cloudDoodle(x, y, s, stroke) {
  return `<path transform="translate(${x} ${y}) scale(${s})" d="M0,0 a18,18 0 0 1 22,-22 a26,26 0 0 1 48,-6 a20,20 0 0 1 34,14 a16,16 0 0 1 22,14 Z"
    fill="#fff" fill-opacity=".75" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>`;
}

function abcBlocks(x, y) {
  const cols = ['#e8413c', '#3a8be8', '#6cc04a', '#f2b233', '#a05bd6', '#f26b38', '#2bb5a8'];
  const rows = [['A'], ['B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I', 'K']];
  const S = 58;
  let out = '', k = 0;
  rows.forEach((row, r) => {
    const by = y + r * S;
    const bx = x + (3 - r) * S / 2;
    row.forEach((L, i) => {
      const c = cols[k++ % cols.length];
      out += `<g transform="translate(${bx + i * S} ${by})">
        <rect width="${S - 4}" height="${S - 4}" rx="8" fill="${c}"/>
        <rect x="6" y="6" width="${S - 16}" height="${S - 16}" rx="6" fill="#fff" opacity=".9"/>
        <text x="${(S - 4) / 2}" y="${S - 17}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="32" fill="${c}">${L}</text></g>`;
    });
  });
  // capelo em cima do bloco A
  const cx = x + 3 * S / 2 + (S - 4) / 2;
  out += `<g transform="translate(${cx} ${y - 12})">
    <path d="M-34,-6 L0,-22 L34,-6 L0,10 Z" fill="#1d2b4f"/>
    <path d="M-18,0 v14 q18,10 36,0 v-14 L0,8 Z" fill="#26375f"/>
    <path d="M0,-6 L26,2 v22" stroke="#f2c94c" stroke-width="2.5" fill="none"/>
    <circle cx="26" cy="26" r="4" fill="#f2c94c"/></g>`;
  return out;
}

function rocket(x, y) {
  return `<g transform="translate(${x} ${y}) rotate(42)" fill="none" stroke="#6b7684" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M0,-95 C34,-62 36,22 24,62 H-24 C-36,22 -34,-62 0,-95 Z" fill="#fff" fill-opacity=".55"/>
    <circle cx="0" cy="-38" r="11"/><circle cx="0" cy="-6" r="11"/><circle cx="0" cy="26" r="9"/>
    <path d="M-28,24 L-52,72 L-24,62"/><path d="M28,24 L52,72 L24,62"/>
    <path d="M-10,64 q-14,18 -6,34 q10,-8 16,-18 q6,10 16,18 q8,-16 -6,-34"/>
    <circle cx="-22" cy="112" r="12"/><circle cx="4" cy="122" r="15"/><circle cx="30" cy="108" r="11"/></g>`;
}

function skySVG(pal, { full = true } = {}) {
  const id = 'sky' + (++svgId);
  return `<svg class="decor" viewBox="0 0 800 600" preserveAspectRatio="none">
    <defs>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${pal.c2}"/><stop offset="1" stop-color="#eef8fc"/>
      </linearGradient>
      <filter id="${id}b"><feGaussianBlur stdDeviation="22"/></filter>
      <filter id="${id}s"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#4a6b8a" flood-opacity=".18"/></filter>
    </defs>
    <rect width="800" height="600" fill="url(#${id}g)"/>
    <g filter="url(#${id}b)" fill="#fff" opacity=".55">
      <rect x="90" y="-40" width="70" height="680"/><rect x="300" y="-40" width="40" height="680"/>
      <rect x="520" y="-40" width="90" height="680"/><rect x="700" y="-40" width="40" height="680"/>
    </g>
    <g filter="url(#${id}s)">
      ${cloudShape(70, 90, .9)}${cloudShape(330, 70, 1.15)}${cloudShape(560, 120, .7)}${full ? '' : cloudShape(250, 470, 1) + cloudShape(560, 420, .8)}
    </g>
    ${full ? rocket(640, 230) + abcBlocks(60, 250) : ''}
  </svg>`;
}

function paperSVG(pal, seed, fundo) {
  const rand = rng(seed * 31 + 7);
  const id = 'wc' + (++svgId);
  const gutterX = seed % 2 === 0 ? 790 : 10; // páginas da esquerda têm a dobra à direita
  let stains = `<ellipse cx="${gutterX}" cy="300" rx="80" ry="340"/>`;
  for (let k = 0; k < 4; k++) {
    stains += `<ellipse cx="${(rand() * 800).toFixed(0)}" cy="${(rand() * 600).toFixed(0)}" rx="${(110 + rand() * 130).toFixed(0)}" ry="${(80 + rand() * 120).toFixed(0)}"/>`;
  }
  // fundo amarelo em aquarela (como a primeira página dupla do álbum impresso)
  const amarelo = fundo === 'amarelo'
    ? `<rect width="800" height="600" fill="#fbf1d2"/>
       <g filter="url(#${id})" opacity=".55">
         <ellipse cx="${gutterX}" cy="300" rx="120" ry="360" fill="#f4c35f"/>
         <ellipse cx="${(150 + rand() * 500).toFixed(0)}" cy="560" rx="260" ry="90" fill="#f2b04f"/>
         <ellipse cx="${(100 + rand() * 600).toFixed(0)}" cy="40" rx="220" ry="80" fill="#f6d27c"/>
         <ellipse cx="${(rand() * 800).toFixed(0)}" cy="${(rand() * 600).toFixed(0)}" rx="120" ry="90" fill="#8fd0dc"/>
       </g>`
    : '';
  let dots = '';
  for (let c = 0; c < 2; c++) {
    const cx = rand() * 800, cy = rand() < .5 ? 20 + rand() * 80 : 480 + rand() * 100;
    for (let k = 0; k < 14; k++) {
      dots += `<circle cx="${(cx + (rand() - .5) * 140).toFixed(0)}" cy="${(cy + (rand() - .5) * 90).toFixed(0)}" r="${(1 + rand() * 3.5).toFixed(1)}"/>`;
    }
  }
  const cx = 30 + rand() * 520;
  const rx = 220 + rand() * 300;
  return `<svg class="decor" viewBox="0 0 800 600" preserveAspectRatio="none">
    <defs>
      <filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="${seed}"/>
        <feDisplacementMap in="SourceGraphic" scale="70"/>
        <feGaussianBlur stdDeviation="7"/>
      </filter>
    </defs>
    ${amarelo || `<g filter="url(#${id})" fill="${pal.c2}" opacity=".5">${stains}</g>`}
    <g fill="${amarelo ? '#3a8fb8' : pal.c1}" opacity=".55">${dots}</g>
    <g fill="none" stroke="${pal.ink}" stroke-width="2" stroke-linecap="round" opacity=".28" transform="translate(${rx.toFixed(0)} 30)">
      <path d="M0,22 a40,40 0 0 1 80,0"/><path d="M9,22 a31,31 0 0 1 62,0"/><path d="M18,22 a22,22 0 0 1 44,0"/>
    </g>
    <path transform="translate(735 18) rotate(18)" d="M0,0 L44,16 L0,32 L9,16 Z M9,16 H44" fill="none" stroke="${pal.ink}" stroke-width="2" stroke-linejoin="round" opacity=".35"/>
    ${cloudDoodle(cx, 598, 1.1, pal.c3)}${cloudDoodle(cx + 120, 600, .8, pal.c3)}
  </svg>`;
}

/* ---------- Enfeites (adesivos) do álbum "Minha Formatura" ---------- */

const STICKERS = {
  // balão de ar quente listrado
  balao: id => `<svg viewBox="0 0 60 86">
    <defs><clipPath id="${id}"><path d="M30 2C14 2 3 14 3 29c0 14 12 24 20 34h14c8-10 20-20 20-34C57 14 46 2 30 2z"/></clipPath></defs>
    <g clip-path="url(#${id})">
      <rect width="12" height="70" fill="#e8413c"/><rect x="12" width="12" height="70" fill="#ffcf33"/>
      <rect x="24" width="12" height="70" fill="#3a8be8"/><rect x="36" width="12" height="70" fill="#6cc04a"/>
      <rect x="48" width="12" height="70" fill="#e8413c"/>
      <ellipse cx="20" cy="18" rx="9" ry="12" fill="#fff" opacity=".35"/>
    </g>
    <path d="M23 62 L25 73 M37 62 L35 73" stroke="#7a5230" stroke-width="1.6"/>
    <rect x="22" y="72" width="16" height="12" rx="2.5" fill="#d23a2f"/><rect x="22" y="72" width="16" height="3" fill="#a52a22"/>
  </svg>`,

  // foguete colorido
  foguete: () => `<svg viewBox="0 0 60 96">
    <path d="M30 4C43 16 45 44 41 66H19C15 44 17 16 30 4Z" fill="#fff" stroke="#c9d3df" stroke-width="2"/>
    <path d="M30 4C37 11 40 19 41.5 27H18.5C20 19 23 11 30 4Z" fill="#e8413c"/>
    <circle cx="30" cy="40" r="7.5" fill="#3a8be8" stroke="#e8413c" stroke-width="3"/>
    <path d="M19 50L7 72L19 66Z" fill="#e8413c"/><path d="M41 50L53 72L41 66Z" fill="#e8413c"/>
    <path d="M22 66Q30 98 38 66Z" fill="#f7a326"/><path d="M26 66Q30 84 34 66Z" fill="#ffe066"/>
  </svg>`,

  // selo ABC "Minha Formatura"
  abc: () => `<svg viewBox="0 0 150 96">
    <g font-family="Fredoka, sans-serif" font-weight="700" font-size="58" stroke="#fff" stroke-width="5" paint-order="stroke" stroke-linejoin="round">
      <text x="6" y="60" fill="#2bb5c8" transform="rotate(-6 26 40)">A</text>
      <text x="50" y="58" fill="#f2b233">B</text>
      <text x="96" y="60" fill="#3a8be8" transform="rotate(6 116 40)">C</text>
    </g>
    <g transform="translate(118 2) scale(.42)">
      <path d="M-34,-6 L0,-22 L34,-6 L0,10 Z" fill="#1d2b4f" transform="translate(0 30)"/>
      <path d="M-18,0 v14 q18,10 36,0 v-14 L0,8 Z" fill="#26375f" transform="translate(0 30)"/>
    </g>
    <path d="M6 66H144L136 78L144 90H6L14 78Z" fill="#e0a92e" stroke="#b07a14" stroke-width="1.5"/>
    <text x="75" y="83" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="13" fill="#fff">Minha Formatura</text>
  </svg>`,

  // capelo preto com diploma
  capelo: () => `<svg viewBox="0 0 90 70">
    <rect x="8" y="46" width="62" height="12" rx="6" fill="#f3ead2" stroke="#c9b98f"/><rect x="34" y="46" width="6" height="12" fill="#e8413c"/>
    <path d="M4 22L44 6L84 22L44 38Z" fill="#1f2430"/>
    <path d="M22 30v14q22 11 44 0V30L44 38Z" fill="#2c3240"/>
    <path d="M44 22L70 28v18" stroke="#f2c94c" stroke-width="2.5" fill="none"/><circle cx="70" cy="48" r="4" fill="#f2c94c"/>
  </svg>`,

  // bonequinho formando
  formando: () => `<svg viewBox="0 0 54 90">
    <path d="M12 52Q27 40 42 52L46 86H8Z" fill="#2f5fb3"/>
    <path d="M19 50Q27 58 35 50L33 62Q27 66 21 62Z" fill="#fff"/>
    <circle cx="27" cy="34" r="15" fill="#f6cfae"/>
    <path d="M12 32Q14 18 27 18Q40 18 42 32Q36 24 27 25Q18 24 12 32Z" fill="#6b3f22"/>
    <circle cx="21.5" cy="35" r="1.8" fill="#3a2a20"/><circle cx="32.5" cy="35" r="1.8" fill="#3a2a20"/>
    <path d="M23 41Q27 44 31 41" stroke="#c0574a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M6 16L27 7L48 16L27 25Z" fill="#1f2430"/><path d="M27 16L42 20v10" stroke="#f2c94c" stroke-width="1.8" fill="none"/>
    <rect x="36" y="62" width="16" height="7" rx="3.5" fill="#f3ead2" stroke="#c9b98f" transform="rotate(-20 44 65)"/>
  </svg>`,

  // nuvem branca fofinha
  nuvem: () => `<svg viewBox="0 0 120 70">
    <g fill="#fff" stroke="#d5e3ef" stroke-width="1.5" style="filter:drop-shadow(0 3px 3px rgba(60,90,120,.25))">
      <circle cx="30" cy="42" r="20"/><circle cx="58" cy="30" r="25"/><circle cx="88" cy="42" r="19"/><rect x="18" y="40" width="84" height="22" rx="11"/>
    </g>
  </svg>`,

  // "A" desenhado dentro de um círculo (traço)
  letraA: () => `<svg viewBox="0 0 80 80" fill="none" stroke="#e0a92e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="40" cy="40" r="32"/><path d="M26 58L40 20L54 58M31 45H49"/>
  </svg>`,

  // lua e estrelinhas (traço)
  lua: () => `<svg viewBox="0 0 90 70" fill="none" stroke="#5f7fae" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".75">
    <path d="M34 8a26 26 0 1 0 24 36a20 20 0 1 1-24-36z"/>
    <path d="M70 12v10M65 17h10M78 40v7M74.5 43.5h7"/>
  </svg>`,

  // aviãozinho de papel com trilha tracejada
  aviao: () => `<svg viewBox="0 0 120 60" fill="none" stroke="#5f7fae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".8">
    <path d="M4 50Q30 20 60 40T84 26" stroke-dasharray="4 5"/>
    <path d="M78 22L116 8L100 42L92 30Z M92 30L116 8"/>
  </svg>`,
};

function renderStickers(root, p) {
  for (const s of p.enfeites || []) {
    const make = STICKERS[s.t];
    if (!make) continue;
    const box = el('div', 'sticker', make('st' + (++svgId)));
    Object.assign(box.style, { left: s.x + 'px', top: s.y + 'px', width: s.w + 'px', transform: `rotate(${s.r || 0}deg)` });
    root.appendChild(box);
  }
}

function renderFormatura(root, p, pal, editable, index) {
  const txt = (key, ph) => editableText('', p[key], editable, v => { p[key] = v; changed(false); }, ph);
  root.classList.add('theme-formatura');

  if (p.kind === 'cover') {
    root.insertAdjacentHTML('beforeend', skySVG(pal));
    const t = el('div', 'f-cover-title');
    t.textContent = album.title;
    t.style.fontSize = (album.title.length <= 16 ? 74 : 56) + 'px';
    root.appendChild(t);
    const sub = el('div', 'f-cover-sub');
    sub.appendChild(txt('caption', 'Nome do formando'));
    root.appendChild(sub);
    return;
  }

  if (p.fundo) root.classList.add('fundo-' + p.fundo);
  root.insertAdjacentHTML('beforeend', paperSVG(pal, index, p.fundo));
  slotsGeo(p).forEach((geo, i) => root.appendChild(renderSlot(p, i, geo, editable)));
  const vn = el('div', 'vname');
  vn.appendChild(txt('title', 'Nome na vertical'));
  root.appendChild(vn);
  const fc = el('div', 'fcaption' + (p.rodape ? ' ' + p.rodape : ''));
  fc.appendChild(txt('caption', 'Texto do rodapé'));
  root.appendChild(fc);
  renderStickers(root, p);
}

function setVars(root, pal) {
  for (const k of ['bg', 'c1', 'c2', 'c3', 'c4', 'ink']) root.style.setProperty('--' + k, pal[k]);
}

function renderPage(p, { editable = false, index = 0 } = {}) {
  const pal = PALETTES[album.palette];
  const root = sizePage(el('div', 'page' + (editable ? ' editable' : '')));
  setVars(root, pal);
  if (p.kind === 'imagem') {
    // página inteira fotografada do álbum impresso
    const img = new Image();
    img.src = p.src;
    img.alt = '';
    img.draggable = false;
    img.className = 'page-img';
    root.appendChild(img);
    return root;
  }
  if (album.theme === 'formatura') {
    renderFormatura(root, p, pal, editable, index);
    return root;
  }
  root.insertAdjacentHTML('beforeend', decorSVG(pal, index + 1));

  const banner = el('div', 'banner');
  banner.appendChild(editableText('', p.title, editable, v => { p.title = v; changed(false); }));
  root.appendChild(banner);

  slotsGeo(p).forEach((geo, i) => root.appendChild(renderSlot(p, i, geo, editable)));

  if (p.kind === 'cover') {
    const t = el('div', 'big-title cover-title', colorfulTitle(album.title, pal));
    t.style.fontSize = titleSize(album.title) + 'px';
    root.appendChild(t);
    const sub = el('div', 'cover-sub');
    sub.appendChild(editableText('', p.caption, editable, v => { p.caption = v; changed(false); }));
    root.appendChild(sub);
  } else {
    const cap = el('div', 'caption ' + (p.layout == 1 || p.layout === '1v' ? 'side' : 'bottom'));
    cap.appendChild(editableText('txt', p.caption, editable, v => { p.caption = v; changed(false); }));
    root.appendChild(cap);
  }
  return root;
}

function renderEndPage() {
  const pal = PALETTES[album.palette];
  const root = sizePage(el('div', 'page'));
  setVars(root, pal);
  if (album.theme === 'formatura') {
    root.insertAdjacentHTML('beforeend', skySVG(pal, { full: false }));
    const t = el('div', 'f-cover-title f-end');
    t.textContent = album.title;
    root.appendChild(t);
    return root;
  }
  root.insertAdjacentHTML('beforeend', decorSVG(pal, 99));
  root.appendChild(el('div', 'big-title end-title', colorfulTitle('Fim', pal)));
  const sub = el('div', 'end-sub');
  sub.textContent = album.title + ' ♥';
  root.appendChild(sub);
  return root;
}

function renderSlot(p, i, geo, editable) {
  const fr = FRAMES.find(f => f.id === p.frame) || FRAMES[0];
  const s = p.slots[i];
  const slot = el('div', 'slot frame-' + fr.id);
  Object.assign(slot.style, {
    left: geo.x + 'px', top: geo.y + 'px', width: geo.w + 'px', height: geo.h + 'px',
    transform: fr.rot ? `rotate(${geo.r}deg)` : 'none',
  });
  if (fr.id === 'fita') slot.insertAdjacentHTML('beforeend', '<span class="tape t1"></span><span class="tape t2"></span>');
  if (fr.id === 'polaroid') slot.insertAdjacentHTML('beforeend', '<span class="pin"></span>');

  const inner = el('div', 'slot-inner');
  slot.appendChild(inner);
  const url = s.photo && photos[s.photo];
  if (url) {
    const img = new Image();
    img.src = url;
    img.draggable = false;
    applyPos(img, s);
    inner.appendChild(img);
  } else {
    inner.innerHTML = editable
      ? `<div class="ph">${PHOTO_ICON}<span>Arraste uma foto aqui<br><small>ou clique para escolher</small></span></div>`
      : `<div class="ph ph-view">${PHOTO_ICON}</div>`;
  }
  if (editable) bindSlot(slot, inner, p, i);
  return slot;
}

/* ================= Interações nas molduras ================= */

function bindSlot(slot, inner, p, i) {
  const s = p.slots[i];

  slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); });
  slot.addEventListener('dragleave', () => slot.classList.remove('over'));
  slot.addEventListener('drop', async e => {
    e.preventDefault();
    slot.classList.remove('over');
    const id = e.dataTransfer.getData('text/photo-id');
    if (id) return placeIds(p, i, [id]);
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    if (files.length) placeIds(p, i, await importFiles(files));
  });

  const img = inner.querySelector('img');
  if (!img) {
    slot.addEventListener('click', () => pickFiles(ids => placeIds(p, i, ids)));
    return;
  }

  const x = el('button', 'slot-x', '✕');
  x.title = 'Remover foto da moldura';
  x.addEventListener('click', () => { Object.assign(s, { photo: null, x: 50, y: 50, z: 1 }); changed(); });
  slot.appendChild(x);

  // arrastar para enquadrar
  img.addEventListener('pointerdown', e => {
    e.preventDefault();
    img.setPointerCapture(e.pointerId);
    const rect = inner.getBoundingClientRect();
    const start = { cx: e.clientX, cy: e.clientY, x: s.x, y: s.y };
    const move = ev => {
      s.x = clamp(start.x - (ev.clientX - start.cx) / rect.width * 120, 0, 100);
      s.y = clamp(start.y - (ev.clientY - start.cy) / rect.height * 120, 0, 100);
      applyPos(img, s);
    };
    const up = () => {
      img.removeEventListener('pointermove', move);
      img.removeEventListener('pointerup', up);
      changed(false);
    };
    img.addEventListener('pointermove', move);
    img.addEventListener('pointerup', up);
  });

  // rodinha do mouse = zoom
  slot.addEventListener('wheel', e => {
    e.preventDefault();
    s.z = clamp(s.z - e.deltaY * 0.0015, 1, 3);
    applyPos(img, s);
    changed(false);
  }, { passive: false });
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function placeIds(p, start, ids) {
  if (!ids.length) return;
  const n = slotsGeo(p).length;
  const targets = [start];
  for (let k = 0; k < n && targets.length < ids.length; k++) {
    if (k !== start && !(p.slots[k].photo && photos[p.slots[k].photo])) targets.push(k);
  }
  targets.forEach((k, j) => Object.assign(p.slots[k], { photo: ids[j], x: 50, y: 50, z: 1 }));
  changed();
}

/* ================= Fotos ================= */

function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { res(img); URL.revokeObjectURL(url); };
    img.onerror = rej;
    img.src = url;
  });
}

async function importFiles(files) {
  const ids = [];
  for (const f of files) {
    try {
      const img = await loadImage(f);
      const max = 1600;
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const id = uid();
      photos[id] = c.toDataURL('image/jpeg', 0.86);
      album.photoOrder.push(id);
      ids.push(id);
      store.set('photo:' + id, photos[id]).catch(err => console.warn('Falha ao salvar foto', err));
    } catch (err) {
      console.warn('Não foi possível abrir', f.name, err);
    }
  }
  renderTray();
  save();
  return ids;
}

const fileInput = document.getElementById('fileInput');
let pickCallback = null;
function pickFiles(cb) {
  pickCallback = cb;
  fileInput.value = '';
  fileInput.click();
}
fileInput.addEventListener('change', async () => {
  const files = [...fileInput.files];
  if (!files.length) return;
  const ids = await importFiles(files);
  if (pickCallback) pickCallback(ids);
  pickCallback = null;
});

function usageCount() {
  const used = {};
  for (const p of album.pages) slotsGeo(p).forEach((_, i) => {
    const id = p.slots[i].photo;
    if (id) used[id] = (used[id] || 0) + 1;
  });
  return used;
}

function deletePhoto(id) {
  delete photos[id];
  album.photoOrder = album.photoOrder.filter(x => x !== id);
  for (const p of album.pages) for (const s of p.slots) if (s.photo === id) Object.assign(s, { photo: null, x: 50, y: 50, z: 1 });
  store.del('photo:' + id).catch(() => {});
  changed();
}

/* ================= Interface do editor ================= */

const $ = id => document.getElementById(id);

function fitInto(box, pageEl, availW, availH) {
  const s = Math.min(availW / PAGE_W, availH / PAGE_H);
  box.style.width = PAGE_W * s + 'px';
  box.style.height = PAGE_H * s + 'px';
  pageEl.style.transform = `scale(${s})`;
}

function renderEditor() {
  const stage = $('stage');
  stage.innerHTML = '';
  const box = el('div', 'scale-box');
  const pg = renderPage(page(), { editable: true, index: current });
  box.appendChild(pg);
  stage.appendChild(box);
  layoutEditor();
}

function layoutEditor() {
  const stage = $('stage');
  const box = stage.querySelector('.scale-box');
  if (!box) return;
  const cs = getComputedStyle(stage);
  const w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = Math.max(320, window.innerHeight - 330);
  fitInto(box, box.firstChild, w, h);
}

function renderStrip() {
  const strip = $('strip');
  strip.innerHTML = '';
  album.pages.forEach((p, i) => {
    const t = el('button', 'thumb' + (i === current ? ' active' : ''));
    const box = el('div', 'thumb-box');
    box.appendChild(renderPage(p, { index: i }));
    t.appendChild(box);
    t.appendChild(el('span', '', p.kind === 'cover' ? 'Capa' : 'Página ' + i));
    t.addEventListener('click', () => { current = i; renderAll(); });
    strip.appendChild(t);
  });
  const isCover = page().kind === 'cover';
  $('btnDel').disabled = isCover;
  $('btnLeft').disabled = isCover || current <= 1;
  $('btnRight').disabled = isCover || current >= album.pages.length - 1;
}

function renderPalettes() {
  const box = $('palettes');
  box.innerHTML = '';
  for (const [key, pal] of Object.entries(PALETTES)) {
    const b = el('button', 'palette' + (album.palette === key ? ' active' : ''));
    b.innerHTML = `<span class="swatches">${['c1', 'c2', 'c3', 'c4'].map(c => `<i style="background:${pal[c]}"></i>`).join('')}</span>${pal.name}`;
    b.addEventListener('click', () => { album.palette = key; changed(); renderFrames(); renderPalettes(); renderThemes(); });
    box.appendChild(b);
  }
}

function renderFrames() {
  const box = $('frames');
  box.innerHTML = '';
  for (const fr of FRAMES) {
    const b = el('button', 'frame-opt' + (page().frame === fr.id ? ' active' : ''));
    const prev = el('div', 'frame-preview');
    const demo = { ...newPage(1), frame: fr.id, title: '', caption: '' };
    prev.appendChild(renderPage(demo, { index: 7 }));
    b.appendChild(prev);
    b.appendChild(el('span', '', fr.name));
    b.addEventListener('click', () => { page().frame = fr.id; changed(); renderFrames(); });
    box.appendChild(b);
  }
}

function renderLayouts() {
  const box = $('layouts');
  box.innerHTML = '';
  const p = page();
  $('layoutPanel').classList.toggle('layout-panel-disabled', p.kind === 'cover');
  const labels = { 1: '1 deitada', '1v': '1 em pé', 2: '2 fotos', '2h': '2 deitadas', 3: '3 fotos', 4: '4 fotos' };
  for (const n of [1, '1v', 2, '2h', 3, 4]) {
    const b = el('button', 'layout-opt' + (p.kind !== 'cover' && String(p.layout) === String(n) ? ' active' : ''));
    const icon = el('div', 'layout-icon');
    for (const g of layoutSet()[n]) {
      icon.insertAdjacentHTML('beforeend',
        `<b style="left:${g.x / 8}%;top:${g.y / 6}%;width:${g.w / 8}%;height:${g.h / 6}%"></b>`);
    }
    b.appendChild(icon);
    b.appendChild(el('span', '', labels[n]));
    b.addEventListener('click', () => { p.layout = n; changed(); renderLayouts(); });
    box.appendChild(b);
  }
}

function renderTray() {
  const tray = $('tray');
  tray.innerHTML = '';
  const used = usageCount();
  for (const id of album.photoOrder) {
    if (!photos[id]) continue;
    const item = el('div', 'tray-item');
    item.draggable = true;
    item.innerHTML = `<img src="${photos[id]}" alt="">` + (used[id] ? `<span class="used">usada${used[id] > 1 ? ' ' + used[id] + 'x' : ''}</span>` : '');
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/photo-id', id);
      e.dataTransfer.effectAllowed = 'copy';
    });
    const del = el('button', 'del', '✕');
    del.title = 'Excluir foto';
    del.addEventListener('click', () => { if (confirm('Excluir esta foto do álbum?')) deletePhoto(id); });
    item.appendChild(del);
    tray.appendChild(item);
  }
}

function renderThemes() {
  const box = $('themes');
  box.innerHTML = '';
  const saved = album.theme;
  for (const [key, name] of Object.entries(THEMES)) {
    album.theme = key;
    const b = el('button', 'theme-opt' + (saved === key ? ' active' : ''));
    const prev = el('div', 'theme-preview');
    prev.appendChild(renderPage({ ...newPage('cover'), caption: '' }, { index: 0 }));
    b.appendChild(prev);
    b.appendChild(el('span', '', name));
    b.addEventListener('click', () => {
      album.theme = key;
      if (key === 'formatura' && album.palette === 'arcoiris') album.palette = 'ceu';
      save();
      renderAll();
    });
    box.appendChild(b);
  }
  album.theme = saved;
}

function renderAll() {
  $('albumTitle').value = album.title;
  renderThemes();
  renderPalettes();
  renderFrames();
  renderLayouts();
  renderTray();
  renderEditor();
  renderStrip();
}

// full=true redesenha o editor; false só atualiza miniaturas (para não perder o cursor ao digitar)
let stripTimer;
function changed(full = true) {
  save();
  if (full) {
    renderEditor();
    renderStrip();
    renderTray();
  } else {
    clearTimeout(stripTimer);
    stripTimer = setTimeout(renderStrip, 400);
  }
}

/* ---------- Botões ---------- */

$('albumTitle').addEventListener('input', e => {
  album.title = e.target.value || ' ';
  save();
  if (page().kind === 'cover') renderEditor();
  clearTimeout(stripTimer);
  stripTimer = setTimeout(renderStrip, 300);
});

$('btnUpload').addEventListener('click', () => pickFiles(() => {}));

$('btnAuto').addEventListener('click', () => {
  const used = usageCount();
  const free = album.photoOrder.filter(id => photos[id] && !used[id]);
  if (!free.length) return alert('Todas as fotos já estão no álbum. Adicione mais fotos primeiro.');
  for (const p of album.pages) {
    slotsGeo(p).forEach((_, i) => {
      const s = p.slots[i];
      if (free.length && !(s.photo && photos[s.photo])) Object.assign(s, { photo: free.shift(), x: 50, y: 50, z: 1 });
    });
  }
  changed();
});

$('btnVideo').addEventListener('click', () => {
  if (!confirm('Carregar o álbum "Minha Formatura" do vídeo, com as fotos? O álbum atual será substituído.')) return;
  loadVideoAlbum();
});

$('btnModelo').addEventListener('click', () => {
  if (!confirm('Montar as páginas iguais ao álbum "Minha Formatura"? As páginas atuais serão substituídas (as fotos continuam em "Minhas fotos").')) return;
  album.theme = 'formatura';
  album.pages = modelPages();
  current = 0;
  save();
  renderAll();
});

$('btnFrameAll').addEventListener('click', () => {
  const f = page().frame;
  album.pages.forEach(p => p.frame = f);
  changed();
});

$('btnAdd').addEventListener('click', () => {
  const np = newPage(page().kind === 'cover' ? 1 : page().layout);
  np.frame = page().frame;
  album.pages.splice(current + 1, 0, np);
  current++;
  changed();
  renderFrames();
  renderLayouts();
});

$('btnDel').addEventListener('click', () => {
  if (page().kind === 'cover') return;
  if (!confirm('Excluir esta página?')) return;
  album.pages.splice(current, 1);
  current = Math.min(current, album.pages.length - 1);
  renderAll();
  save();
});

function movePage(d) {
  const j = current + d;
  if (page().kind === 'cover' || j < 1 || j >= album.pages.length) return;
  [album.pages[current], album.pages[j]] = [album.pages[j], album.pages[current]];
  current = j;
  changed();
}
$('btnLeft').addEventListener('click', () => movePage(-1));
$('btnRight').addEventListener('click', () => movePage(1));

$('btnNovo').addEventListener('click', async () => {
  if (!confirm('Começar um álbum novo? O álbum atual e as fotos serão apagados.')) return;
  album = newAlbum();
  photos = {};
  current = 0;
  try { await store.clear(); } catch (err) { console.warn(err); }
  save();
  renderAll();
});

window.addEventListener('resize', () => { layoutEditor(); if (!$('viewer').hidden) layoutBook(); });

/* ================= Visualizador (folhear) ================= */

let leaves = [];
let flipped = 0;
let bookInner;

function openViewer() {
  document.activeElement?.blur();
  const faces = album.pages.map((p, i) => renderPage(p, { index: i }));
  faces.push(renderEndPage());
  // a contracapa precisa cair no verso da última folha
  if (faces.length % 2) faces.splice(faces.length - 1, 0, renderBlankPage());

  const [pw, ph] = pageSize();
  const book = $('book');
  book.innerHTML = '';
  Object.assign(book.style, { width: pw * 2 + 'px', height: ph + 'px' });
  bookInner = el('div', 'book-inner');
  book.appendChild(bookInner);
  leaves = [];
  for (let i = 0; i < faces.length; i += 2) {
    const leaf = el('div', 'leaf');
    Object.assign(leaf.style, { left: pw + 'px', width: pw + 'px', height: ph + 'px' });
    const front = el('div', 'face front');
    const back = el('div', 'face back');
    front.appendChild(faces[i]);
    back.appendChild(faces[i + 1]);
    leaf.append(front, back);
    front.addEventListener('click', () => go(1));
    back.addEventListener('click', () => go(-1));
    bookInner.appendChild(leaf);
    leaves.push(leaf);
  }
  flipped = 0;
  $('viewer').hidden = false;
  updateBook(true);
  layoutBook();
}

function renderBlankPage() {
  const pal = PALETTES[album.palette];
  const root = sizePage(el('div', 'page'));
  root.style.setProperty('--bg', pal.bg);
  return root;
}

function layoutBook() {
  const [pw, ph] = pageSize();
  const holder = $('bookHolder');
  const s = Math.min(holder.clientWidth * 0.94 / (pw * 2), holder.clientHeight * 0.92 / ph);
  const scaler = $('bookScaler');
  scaler.style.width = pw * 2 * s + 'px';
  scaler.style.height = ph * s + 'px';
  $('book').style.transform = `scale(${s})`;
}

function updateBook(instant) {
  leaves.forEach((l, i) => {
    l.classList.toggle('flipped', i < flipped);
    if (instant) l.style.zIndex = i < flipped ? i + 1 : leaves.length - i;
  });
  // livro fechado (capa ou contracapa) fica centralizado
  const pw = pageSize()[0];
  const shift = flipped === 0 ? -pw / 2 : flipped === leaves.length ? pw / 2 : 0;
  bookInner.style.transform = `translateX(${shift}px)`;
  const total = leaves.length;
  $('vInfo').textContent = flipped === 0 ? 'Capa' : flipped === total ? 'Fim' : `${flipped} de ${total - 1}`;
  $('vPrev').disabled = flipped === 0;
  $('vNext').disabled = flipped === total;
}

let zTimer, zTop = 1000;
function go(d) {
  const target = flipped + d;
  if (target < 0 || target > leaves.length) return;
  const leaf = leaves[d > 0 ? flipped : flipped - 1];
  // a folha que está virando agora fica sempre por cima, mesmo com cliques rápidos
  leaf.style.zIndex = ++zTop;
  flipped = target;
  updateBook(false);
  clearTimeout(zTimer);
  zTimer = setTimeout(() => leaves.forEach((l, i) => l.style.zIndex = i < flipped ? i + 1 : leaves.length - i), 920);
}

$('btnVer').addEventListener('click', openViewer);
// página só de visualização (link compartilhado): o livro fica sempre aberto
const closeViewer = () => { if (!window.SOMENTE_VER) $('viewer').hidden = true; };
$('vClose').addEventListener('click', closeViewer);
$('vPrev').addEventListener('click', () => go(-1));
$('vNext').addEventListener('click', () => go(1));
document.addEventListener('keydown', e => {
  if ($('viewer').hidden) return;
  if (e.key === 'ArrowRight') go(1);
  if (e.key === 'ArrowLeft') go(-1);
  if (e.key === 'Escape') closeViewer();
});

/* ================= Início ================= */

(async function init() {
  if (window.SOMENTE_VER) {
    const { album: a, urls } = albumFromVideo();
    album = a;
    photos = urls;
    renderAll();
    openViewer();
    // redesenha com as fontes certas, se ninguém virou a página ainda
    if (document.fonts) document.fonts.ready.then(() => { if (!flipped) openViewer(); });
    return;
  }
  try {
    album = await store.get('album');
    if (album) {
      for (const id of album.photoOrder) {
        const url = await store.get('photo:' + id);
        if (url) photos[id] = url;
      }
    }
  } catch (err) {
    console.warn('Não foi possível carregar o álbum salvo', err);
  }
  if (!album || !album.pages || !PALETTES[album.palette]) {
    if (window.MODELO_FORMATURA) return loadVideoAlbum();
    album = newAlbum();
  }
  album.theme ||= 'colorido';
  renderAll();
  if (document.fonts) document.fonts.ready.then(() => { renderStrip(); renderFrames(); renderThemes(); });
})();
