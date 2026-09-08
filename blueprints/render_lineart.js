const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const src = path.join(__dirname, 'line-art');
const out = path.join(__dirname, 'line-art'); // write PNG alongside SVG
const files = fs.readdirSync(src).filter(f => f.endsWith('.svg')).sort();

for (const f of files) {
  const svg = fs.readFileSync(path.join(src, f), 'utf8');
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1600 } });
  const png = resvg.render().asPng();
  const name = f.replace(/\.svg$/, '.png');
  fs.writeFileSync(path.join(out, name), png);
  console.log('wrote', name, (png.length / 1024).toFixed(1) + ' KB');
}
