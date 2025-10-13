const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const pngPath = path.join(__dirname, '../public/icon.png');
const icoPath = path.join(__dirname, '../public/favicon.ico');
const buildIcoPath = path.join(__dirname, '../build/icon.ico');

// Read SVG
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
  try {
    // Generate 512x512 PNG for Electron window icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(pngPath);
    console.log('✅ PNG icon created at:', pngPath);

    // Generate ICO with multiple sizes (16x16, 32x32, 48x48, 256x256)
    // ICO files contain multiple resolutions
    const sizes = [16, 32, 48, 256];
    const pngBuffers = await Promise.all(
      sizes.map(size =>
        sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );

    // Create ICO file by combining PNG buffers
    // ICO format: header + directory entries + image data
    const iconDir = Buffer.alloc(6 + sizes.length * 16);
    
    // ICO header
    iconDir.writeUInt16LE(0, 0); // Reserved, must be 0
    iconDir.writeUInt16LE(1, 2); // Type: 1 for ICO
    iconDir.writeUInt16LE(sizes.length, 4); // Number of images
    
    let offset = 6 + sizes.length * 16;
    const imageBuffers = [];
    
    sizes.forEach((size, i) => {
      const entryOffset = 6 + i * 16;
      const imageBuffer = pngBuffers[i];
      
      // Directory entry
      iconDir.writeUInt8(size === 256 ? 0 : size, entryOffset); // Width (0 means 256)
      iconDir.writeUInt8(size === 256 ? 0 : size, entryOffset + 1); // Height
      iconDir.writeUInt8(0, entryOffset + 2); // Color palette (0 = no palette)
      iconDir.writeUInt8(0, entryOffset + 3); // Reserved
      iconDir.writeUInt16LE(1, entryOffset + 4); // Color planes
      iconDir.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
      iconDir.writeUInt32LE(imageBuffer.length, entryOffset + 8); // Image size
      iconDir.writeUInt32LE(offset, entryOffset + 12); // Image offset
      
      imageBuffers.push(imageBuffer);
      offset += imageBuffer.length;
    });
    
    // Combine header and images
    const icoBuffer = Buffer.concat([iconDir, ...imageBuffers]);
    fs.writeFileSync(icoPath, icoBuffer);
    
    // Copy to build directory for electron-builder
    const buildDir = path.dirname(buildIcoPath);
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    fs.copyFileSync(icoPath, buildIcoPath);
    
    console.log('✅ ICO icon created at:', icoPath);
    console.log('✅ ICO icon copied to:', buildIcoPath);
    console.log(`   Contains ${sizes.length} sizes: ${sizes.join('x, ')}x`);
  } catch (err) {
    console.error('❌ Error creating icons:', err);
    process.exit(1);
  }
}

generateIcons();
