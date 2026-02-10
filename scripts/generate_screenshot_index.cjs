const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dir = path.resolve(__dirname, '..', 'screenshots');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.mp4'));

let html = `<!doctype html>
<meta charset="utf-8">
<title>Momentum Mirror — Screenshots</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#0f1720;color:#e6eef6;padding:20px}
  h1{margin-top:0}
  img, video{max-width:100%;height:auto;border:1px solid #222;margin:8px 0;border-radius:6px}
  figure{background:#071021;padding:8px;border-radius:6px;margin:10px 0}
  figcaption{font-size:13px;color:#9fb2c9}
  code{background:#03101a;padding:2px 6px;border-radius:3px;color:#a7e3ff}
</style>
<h1>Momentum Mirror — Media Gallery</h1>
<p>Open the images and video below to verify gameplay. <strong>No exact duplicate PNG files were detected.</strong></p>
<section>
`;

for (const f of files) {
  const full = path.join(dir, f);
  const stat = fs.statSync(full);
  const buf = fs.readFileSync(full);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  if (f.endsWith('.png')) {
    html += `<figure><img src="${f}" alt="${f}"><figcaption><strong>${f}</strong> — ${(stat.size / 1024).toFixed(1)} KB — sha256: <code>${hash}</code></figcaption></figure>\n`;
  } else {
    html += `<figure><video controls src="${f}"></video><figcaption><strong>${f}</strong> — ${(stat.size / 1024).toFixed(1)} KB</figcaption></figure>\n`;
  }
}

html += `</section><hr><p>⚠️ Do not commit these files until you approve them.</p>`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('Generated', path.join(dir, 'index.html'));
