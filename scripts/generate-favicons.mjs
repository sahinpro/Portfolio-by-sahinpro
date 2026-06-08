import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import toIco from "to-ico";

const SOURCE = resolve("public/sahin.jpg");
const ICONS_DIR = resolve("public/icons");

const PNG_SIZES = [
  { file: "favicon-48x48.png", size: 48 },
  { file: "favicon-192x192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
];

async function main() {
  mkdirSync(ICONS_DIR, { recursive: true });

  const icoBuffers = [];

  for (const { file, size } of PNG_SIZES) {
    const buffer = await sharp(SOURCE)
      .resize(size, size, { fit: "cover", position: "centre" })
      .png({ compressionLevel: 9 })
      .toBuffer();

    writeFileSync(resolve(ICONS_DIR, file), buffer);
    if (size <= 192) icoBuffers.push(buffer);
  }

  const appleBuffer = await sharp(SOURCE)
    .resize(180, 180, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(resolve("public/apple-touch-icon.png"), appleBuffer);

  const ico = await toIco(icoBuffers);
  writeFileSync(resolve("public/favicon.ico"), ico);

  console.log("Generated favicon.ico, apple-touch-icon.png, and public/icons/*.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
