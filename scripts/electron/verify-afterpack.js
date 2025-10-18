// Electron-builder afterPack hook to verify unpacked modules ensuring the cli has all the dependencies it needs
// Docs: https://www.electron.build/configuration/configuration#afterpack

const fs = require('fs');
const path = require('path');

/**
 * @param {import('electron-builder').AfterPackContext} context
 */
module.exports = async function afterPack(context) {
  try {
    const resourcesDir = context.appOutDir && path.join(context.appOutDir, 'resources');
    if (!resourcesDir) return;

    // Check essential asarUnpack modules
    const unpackedDir = path.join(resourcesDir, 'app.asar.unpacked', 'node_modules');
    const essentialChecks = [
      ['@sentry', '@sentry unpacked'],
      ['electron-log', 'electron-log unpacked'],
      ['@ffprobe-installer', 'ffprobe unpacked'],
      ['sharp', 'sharp unpacked']
    ];

    const results = [];
    
    // Add essential unpacked modules
    for (const [folder, label] of essentialChecks) {
      const exists = fs.existsSync(path.join(unpackedDir, folder));
      results.push({ label, exists });
    }

    const summary = results.map(r => `${r.exists ? '✅' : '❌'} ${r.label}`).join(' | ');
    console.log(`🔍 [afterPack] Package verification: ${summary}`);
  } catch (e) {
    console.warn('⚠️ [afterPack] Verification failed:', e && e.message ? e.message : e);
  }
};


