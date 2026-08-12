// One-off script: crop the source logo to icon-only and make its opaque
// white background transparent. Run with: node scripts/process-logo.mjs
import sharp from "sharp";

const SRC = "public/images/Kifaru-logo.png";
const OUT = "public/images/kifaru-icon.png";

// Measured bounding box of the rhino icon (excludes the "KIFARU INC" text
// band below it) plus 15px padding, in the original 500x500 source.
const CROP = { left: 40, top: 32, width: 388, height: 317 };

const { data, info } = await sharp(SRC)
  .extract(CROP)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

for (let i = 0; i < width * height; i++) {
  const idx = i * channels;
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  const whiteness = Math.min(r, g, b);

  let alpha = 255;
  if (whiteness >= 250) {
    alpha = 0;
  } else if (whiteness >= 200) {
    alpha = Math.round(255 * (250 - whiteness) / (250 - 200));
  }
  data[idx + 3] = alpha;
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(OUT);

console.log(`Wrote ${OUT} (${width}x${height})`);
