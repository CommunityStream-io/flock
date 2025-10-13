const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const pngPath = path.join(__dirname, '../public/icon.png');
const icoPath = path.join(__dirname, '../public/favicon.ico');
const buildIcoPath = path.join(__dirname, '../build/icon.ico');
const buildIconsDir = path.join(__dirname, '../build/icons');
const buildIcnsPath = path.join(__dirname, '../build/icon.icns');

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

    // Generate Linux PNG icon set
    const linuxSizes = [16, 32, 48, 64, 128, 256, 512];
    if (!fs.existsSync(buildIconsDir)) {
      fs.mkdirSync(buildIconsDir, { recursive: true });
    }

    console.log('\n🐧 Generating Linux icon set...');
    await Promise.all(
      linuxSizes.map(async (size) => {
        const filename = `${size}x${size}.png`;
        const filepath = path.join(buildIconsDir, filename);
        await sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(filepath);
        return filename;
      })
    );
    console.log('✅ Linux PNG icons created in:', buildIconsDir);
    console.log(`   Sizes: ${linuxSizes.map(s => `${s}x${s}`).join(', ')}`);

    // Generate macOS ICNS
    // ICNS requires specific sizes for different retina displays
    const macSizes = [
      { size: 16, name: 'icon_16x16.png' },
      { size: 32, name: 'icon_16x16@2x.png' },
      { size: 32, name: 'icon_32x32.png' },
      { size: 64, name: 'icon_32x32@2x.png' },
      { size: 128, name: 'icon_128x128.png' },
      { size: 256, name: 'icon_128x128@2x.png' },
      { size: 256, name: 'icon_256x256.png' },
      { size: 512, name: 'icon_256x256@2x.png' },
      { size: 512, name: 'icon_512x512.png' },
      { size: 1024, name: 'icon_512x512@2x.png' },
    ];

    console.log('\n🍎 Generating macOS ICNS file...');
    const icnsDir = path.join(__dirname, '../build/icon.iconset');
    if (!fs.existsSync(icnsDir)) {
      fs.mkdirSync(icnsDir, { recursive: true });
    }

    // Generate all PNG files for iconset
    await Promise.all(
      macSizes.map(async ({ size, name }) => {
        const filepath = path.join(icnsDir, name);
        await sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(filepath);
      })
    );

    // Convert iconset to icns using iconutil (macOS only) or create a note for CI
    if (process.platform === 'darwin') {
      const { execSync } = require('child_process');
      try {
        execSync(`iconutil -c icns "${icnsDir}" -o "${buildIcnsPath}"`, { stdio: 'inherit' });
        console.log('✅ macOS ICNS created at:', buildIcnsPath);
        // Clean up iconset directory
        fs.rmSync(icnsDir, { recursive: true, force: true });
      } catch (err) {
        console.log('⚠️  Could not run iconutil (macOS only), keeping iconset directory');
        console.log('   The CI build on macOS will generate the ICNS file');
      }
    } else {
      // On non-macOS systems, we'll use electron-builder to handle ICNS generation
      // electron-builder can work with PNG files directly
      console.log('✅ macOS iconset created at:', icnsDir);
      console.log('   (ICNS conversion will happen during electron-builder on macOS)');
      
      // electron-builder can use a single high-res PNG for macOS
      const macIconPath = path.join(path.dirname(buildIcnsPath), 'icon.png');
      await sharp(svgBuffer)
        .resize(1024, 1024)
        .png()
        .toFile(macIconPath);
      console.log('✅ High-res macOS icon (1024x1024) created at:', macIconPath);
    }

  } catch (err) {
    console.error('❌ Error creating icons:', err);
    process.exit(1);
  }
}

generateIcons();
