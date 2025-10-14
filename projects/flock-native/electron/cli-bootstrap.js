// Bootstrap for utility process to ensure module resolution works in packaged apps
// Adds unpacked and asar node_modules to NODE_PATH and re-initializes module paths.
try {
  const path = require('path');
  const fs = require('fs');
  const Module = require('module');

  const exeDir = path.dirname(process.execPath);
  const resourcesDir = path.join(exeDir, 'resources');

  const candidates = [
    // Unpacked top-level node_modules (preferred for native/binaries)
    path.join(resourcesDir, 'app.asar.unpacked', 'node_modules'),
    // Packed node_modules inside asar (Node can read from asar transparently)
    path.join(resourcesDir, 'app.asar', 'node_modules'),
    // Nested node_modules under the CLI package in unpacked tree
    path.join(resourcesDir, 'app.asar.unpacked', 'node_modules', '@straiforos', 'instagramtobluesky', 'node_modules'),
    // Nested node_modules under the CLI package in asar
    path.join(resourcesDir, 'app.asar', 'node_modules', '@straiforos', 'instagramtobluesky', 'node_modules')
  ];

  const existing = candidates.filter(p => {
    try { return fs.existsSync(p); } catch (_) { return false; }
  });

  if (existing.length > 0) {
    const sep = path.delimiter;
    const current = process.env.NODE_PATH ? process.env.NODE_PATH.split(sep) : [];
    const merged = [...existing, ...current];
    process.env.NODE_PATH = merged.join(sep);
    // Reinitialize Node's lookup paths to pick up NODE_PATH changes
    if (Module && typeof Module._initPaths === 'function') {
      Module._initPaths();
    }
  }

  // Optional diagnostics
  try {
    // eslint-disable-next-line no-console
    console.log('[cli-bootstrap] NODE_PATH set to:', process.env.NODE_PATH || '');
  } catch (_) {}
} catch (e) {
  try {
    // eslint-disable-next-line no-console
    console.error('[cli-bootstrap] Failed to initialize module paths:', e && e.message ? e.message : e);
  } catch (_) {}
}


