const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo(filename) {
  const filePath = path.join(__dirname, '..', 'public', filename);
  if (!fs.existsSync(filePath)) return;

  const image = sharp(filePath);
  const metadata = await image.metadata();
  console.log(`Original ${filename}: width=${metadata.width}, height=${metadata.height}`);

  // Crop top 72% of image height to remove bottom phone number (9398534380)
  const cropHeight = Math.floor(metadata.height * 0.70);

  const croppedBuffer = await sharp(filePath)
    .extract({ left: 0, top: 0, width: metadata.width, height: cropHeight })
    .png()
    .toBuffer();

  // Now trim transparent padding from the cropped logo
  const trimmedBuffer = await sharp(croppedBuffer)
    .trim()
    .png()
    .toBuffer();

  const finalMeta = await sharp(trimmedBuffer).metadata();
  console.log(`Cleaned ${filename}: width=${finalMeta.width}, height=${finalMeta.height}`);

  fs.writeFileSync(filePath, trimmedBuffer);
  console.log(`Successfully updated ${filename}!`);
}

async function run() {
  const files = ['r2r-logo.png', 'r2r1-logo.png', 'r2r2-logo.png', 'r2r3-logo.png', 'r24-logo.png', 'r25-logo.png'];
  for (const f of files) {
    try {
      await processLogo(f);
    } catch (e) {
      console.error(`Error processing ${f}:`, e);
    }
  }
}

run();
