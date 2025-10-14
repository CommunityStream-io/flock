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

    const unpackedDir = path.join(resourcesDir, 'app.asar.unpacked', 'node_modules');
    const checks = [
      ['@sentry', '@sentry unpacked'],
      ['electron-log', 'electron-log unpacked'],
      ['@ffprobe-installer', 'ffprobe unpacked'],
      ['@atproto', 'atproto unpacked'],
      ['byte-size', 'byte-size unpacked'],
      ['dotenv', 'dotenv unpacked'],
      ['fluent-ffmpeg', 'fluent-ffmpeg unpacked'],
      ['luxon', 'luxon unpacked'],
      ['multiformats', 'multiformats unpacked'],
      ['multihashes', 'multihashes unpacked'],
      ['pino', 'pino unpacked'],
      ['pino-pretty', 'pino-pretty unpacked'],
      ['process', 'process unpacked'],
      ['sharp', 'sharp unpacked']
    ];

    const results = [];
    for (const [folder, label] of checks) {
      results.push({ label, exists: fs.existsSync(path.join(unpackedDir, folder)) });
    }

    const summary = results.map(r => `${r.exists ? '✅' : '❌'} ${r.label}`).join(' | ');
    console.log(`🔍 [afterPack] Unpacked verification: ${summary}`);
  } catch (e) {
    console.warn('⚠️ [afterPack] Verification failed:', e && e.message ? e.message : e);
  }
};


