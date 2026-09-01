'use strict';
/**
 * Gera assets/icon.ico e assets/icon.png para o Melhore Desktop.
 * Sem dependências externas — usa apenas Node.js built-ins (zlib, fs, path).
 */
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── Canvas em memória ───────────────────────────────────────────────────────
const SIZE = 256;
const px   = new Uint8Array(SIZE * SIZE * 4); // RGBA

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  px[i] = r; px[i+1] = g; px[i+2] = b; px[i+3] = a;
}

function fillRect(x, y, w, h, r, g, b, a = 255) {
  for (let py = y; py < y + h; py++)
    for (let _x = x; _x < x + w; _x++)
      setPixel(_x, py, r, g, b, a);
}

function fillCircle(cx, cy, rad, r, g, b, a = 255) {
  for (let py = cy - rad; py <= cy + rad; py++)
    for (let _x = cx - rad; _x <= cx + rad; _x++)
      if ((_x - cx) ** 2 + (py - cy) ** 2 <= rad * rad)
        setPixel(_x, py, r, g, b, a);
}

function roundedRect(x, y, w, h, rad, r, g, b, a = 255) {
  fillRect(x + rad, y, w - rad * 2, h, r, g, b, a);
  fillRect(x, y + rad, w, h - rad * 2, r, g, b, a);
  fillCircle(x + rad,     y + rad,     rad, r, g, b, a);
  fillCircle(x + w - rad, y + rad,     rad, r, g, b, a);
  fillCircle(x + rad,     y + h - rad, rad, r, g, b, a);
  fillCircle(x + w - rad, y + h - rad, rad, r, g, b, a);
}

function thickLine(x0, y0, x1, y1, thick, r, g, b, a = 255) {
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.ceil(Math.sqrt(dx * dx + dy * dy));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    fillCircle(Math.round(x0 + dx * t), Math.round(y0 + dy * t), Math.ceil(thick / 2), r, g, b, a);
  }
}

// ─── Desenhar o ícone ────────────────────────────────────────────────────────

// Fundo escuro arredondado
roundedRect(0, 0, SIZE, SIZE, 48, 11, 10, 8);

// Gradiente sutil de violeta no fundo
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4;
    if (px[i + 3] === 0) continue; // fora do arredondamento
    // adiciona toque violeta na parte de cima
    const fade = Math.max(0, 1 - y / (SIZE * 0.7));
    px[i]   = Math.min(255, px[i]   + Math.round(60 * fade));  // R
    px[i+1] = Math.min(255, px[i+1] + Math.round(20 * fade));  // G
    px[i+2] = Math.min(255, px[i+2] + Math.round(100 * fade)); // B
  }
}

// Letra M — cor branca/lavanda
const [tR, tG, tB] = [232, 225, 255];
const sw = 24; // espessura do traço
const mLeft   = 38;
const mRight  = SIZE - 38;
const mTop    = 36;
const mBottom = SIZE - 40;
const mMid    = Math.round(SIZE / 2);

// Coluna esquerda
fillRect(mLeft, mTop, sw, mBottom - mTop, tR, tG, tB);
// Coluna direita
fillRect(mRight - sw, mTop, sw, mBottom - mTop, tR, tG, tB);
// Diagonal esquerda (topo-esq → centro-baixo)
thickLine(mLeft + sw, mTop, mMid, mTop + 88, sw, tR, tG, tB);
// Diagonal direita (centro-baixo → topo-dir)
thickLine(mMid, mTop + 88, mRight, mTop, sw, tR, tG, tB);

// Ponto lime — referência ao "E" da marca
const [lR, lG, lB] = [184, 240, 58];
fillCircle(194, 194, 26, lR, lG, lB);          // halo externo
fillCircle(194, 194, 18, 210, 255, 80);        // brilho central

// ─── PNG encoder (puro Node.js) ──────────────────────────────────────────────

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const len   = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcB  = Buffer.alloc(4); crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcB]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  // scanlines: 1 byte filter + row data
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (width * 4 + 1) + 1 + x * 4;
      raw[dst]     = rgba[src];
      raw[dst + 1] = rgba[src + 1];
      raw[dst + 2] = rgba[src + 2];
      raw[dst + 3] = rgba[src + 3];
    }
  }

  const idat = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── ICO wrapper (suporta PNG embutido para 256×256) ─────────────────────────

function encodeICO(pngBuf, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: ICO
  header.writeUInt16LE(1, 4); // count: 1 image

  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size; // width  (0 = 256)
  entry[1] = size >= 256 ? 0 : size; // height (0 = 256)
  entry[2] = 0;  // color palette
  entry[3] = 0;  // reserved
  entry.writeUInt16LE(1,  4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(6 + 16, 12); // offset = header + 1 entry

  return Buffer.concat([header, entry, pngBuf]);
}

// ─── Salvar ───────────────────────────────────────────────────────────────────
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const pngBuf = encodePNG(SIZE, SIZE, px);
const icoBuf = encodeICO(pngBuf, SIZE);

fs.writeFileSync(path.join(assetsDir, 'icon.png'), pngBuf);
fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuf);

console.log('✓ assets/icon.png e assets/icon.ico gerados com sucesso!');
console.log(`  PNG: ${pngBuf.length} bytes`);
console.log(`  ICO: ${icoBuf.length} bytes`);
