import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

const svgPath = path.join(publicDir, 'Gemini_Generated_Image_mtu7qwmtu7qwmtu7.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

const sizes = [192, 512];

for (const size of sizes) {
  const pngPath = path.join(publicDir, `pwa-icon-${size}x${size}.png`);
  await sharp(Buffer.from(svgContent))
    .resize(size, size, {
      fit: 'contain',
      background: { r: 253, g: 253, b: 253, alpha: 0 },
    })
    .png()
    .toFile(pngPath);
  console.log(`Generated ${pngPath}`);
}
