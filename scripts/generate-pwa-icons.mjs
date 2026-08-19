// One-off/regenerate-on-demand script - not part of the build pipeline.
// Run with: node scripts/generate-pwa-icons.mjs
//
// Source is the leaf/vine mark (src/imports/LaurelLogoOnly.png), composited
// onto a solid brand-navy square so it works as a home-screen icon on every
// platform - transparent PNGs render inconsistently as app icons (some
// launchers fill transparency with white, others black).
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src/imports/LaurelLogoOnly.png');
const outDir = path.join(root, 'public');

const BRAND_NAVY = { r: 0x1a, g: 0x1a, b: 0x40, alpha: 1 };

// `padPct` is how much of the canvas edge-to-edge is empty margin on each
// side. Maskable icons need a much bigger margin - Android crops to a
// circle/squircle and anything outside the center ~80% safe zone gets cut.
async function makeIcon(size, padPct, outName) {
  const contentSize = Math.round(size * (1 - padPct * 2));
  const logo = await sharp(source)
    .resize(contentSize, contentSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_NAVY },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, outName));

  console.log(`Wrote ${outName} (${size}x${size}, ${Math.round(padPct * 100)}% padding)`);
}

await makeIcon(192, 0.12, 'icon-192.png');
await makeIcon(512, 0.12, 'icon-512.png');
await makeIcon(512, 0.22, 'maskable-icon-512.png');
await makeIcon(180, 0.12, 'apple-touch-icon.png'); // iOS ignores transparency/maskable rules but also expects no padding surprises
await makeIcon(32, 0.08, 'favicon.png');

console.log('Done.');
