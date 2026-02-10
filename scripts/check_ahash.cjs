const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

function aHashImage(img) {
  const size = 8;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const vals = [];
  for (let i = 0; i < data.length; i += 4) {
    // grayscale
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    vals.push(gray);
  }
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  let bits = '';
  for (const v of vals) bits += (v >= avg ? '1' : '0');
  return bits;
}

function hamming(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff;
}

(async () => {
  const dir = path.resolve(__dirname, '..', 'screenshots');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();
  const hashes = {};
  for (const f of files) {
    const img = await loadImage(path.join(dir, f));
    hashes[f] = aHashImage(img);
  }

  const pairs = [];
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const f1 = files[i];
      const f2 = files[j];
      const d = hamming(hashes[f1], hashes[f2]);
      if (d <= 6) pairs.push({ f1, f2, d });
    }
  }

  if (pairs.length === 0) {
    console.log('No near-duplicate images found (aHash Hamming distance > 6 for all pairs).');
  } else {
    console.log('Potential near-duplicates (Hamming ≤ 6):');
    for (const p of pairs) console.log(`  ${p.f1} <-> ${p.f2}  (dist=${p.d})`);
  }
})();
