import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = path.resolve(process.cwd(), 'apps', 'frontend');
const pub = path.join(root, 'public');
const srcSvg = path.join(pub, 'favicon.svg');

const sizes = [16, 32, 48, 180, 192, 512];

async function ensurePngs(svgBuffer) {
  const outputs = [];
  for (const size of sizes) {
    const outPath = path.join(pub, `icon-${size}.png`);
    const png = await sharp(svgBuffer, { density: 384 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(outPath, png);
    outputs.push({ size, path: outPath });
  }
  // Apple touch (180x180) alias
  await writeFile(path.join(pub, 'apple-touch-icon.png'), await readFile(path.join(pub, 'icon-180.png')).catch(async () => readFile(path.join(pub, 'icon-192.png'))));
  return outputs;
}

async function buildIco() {
  const png16 = path.join(pub, 'icon-16.png');
  const png32 = path.join(pub, 'icon-32.png');
  const png48 = path.join(pub, 'icon-48.png');
  const icoBuf = await pngToIco([png16, png32, png48]);
  await writeFile(path.join(pub, 'favicon.ico'), icoBuf);
}

async function main() {
  const svg = await readFile(srcSvg);
  await ensurePngs(svg);
  await buildIco();
  console.log('Icons generated: PNGs (16,32,48,180,192,512) and favicon.ico');
}

main().catch(err => { console.error(err); process.exit(1); });
