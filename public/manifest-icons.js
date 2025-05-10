// This script generates PWA icons from a base icon
// Run with: node manifest-icons.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Make sure the public directory exists
const publicDir = path.join(__dirname);

// Sizes for the PWA icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Source icon - you'll need to replace this with your actual icon
const sourceIcon = path.join(__dirname, 'bread-icon.png');

// Check if source icon exists
if (!fs.existsSync(sourceIcon)) {
  console.error(`Source icon not found: ${sourceIcon}`);
  console.log('Please create a bread-icon.png file in the public directory');
  process.exit(1);
}

// Generate icons for each size
async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `pwa-${size}x${size}.png`);
    
    try {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Created: pwa-${size}x${size}.png`);
    } catch (error) {
      console.error(`Error creating icon size ${size}:`, error);
    }
  }

  // Create maskable icon (with padding for safe zone)
  try {
    await sharp(sourceIcon)
      .resize(512, 512)
      .extend({
        top: 51,
        bottom: 51,
        left: 51,
        right: 51,
        background: { r: 255, g: 253, b: 250, alpha: 1 }
      })
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'pwa-512x512-maskable.png'));
    
    console.log('Created: pwa-512x512-maskable.png');
  } catch (error) {
    console.error('Error creating maskable icon:', error);
  }

  console.log('PWA icon generation complete!');
}

generateIcons().catch(console.error);
