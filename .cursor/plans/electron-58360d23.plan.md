<!-- 58360d23-c909-462a-a966-e7d471d2998f fedb44b5-1d8a-4449-8164-fd0d6a13313e -->
# Add native frameless splash window to Electron startup

### Files to modify

- `projects/flock-native/electron/main.js`

### New files to add

- `projects/flock-native/electron/splash.html` (simple HTML with PNG + text)
- `projects/flock-native/electron/splash.css` (minimal styles)
- Optional: `projects/flock-native/public/splash.png` (or reuse `public/icon.png`)

### Implementation steps

1. Create a `splashWindow` in `createWindow()`:

   - `BrowserWindow` options: `{ width: 420, height: 320, frame: false, transparent: true, resizable: false, alwaysOnTop: true, skipTaskbar: true, show: true }`
   - Load `splash.html` using `loadFile(path.join(__dirname, 'splash.html'))`.
   - Keep reference `let splashWindow` and ensure it’s destroyed when main shows.

2. Hide main window until ready:

   - Set `show: false` on `mainWindow` options.
   - Keep existing `ready-to-show` listener; on fire, `splashWindow?.destroy()` then `mainWindow.show()`.

3. Fallback safety:

   - If `ready-to-show` hasn’t fired within 10s, show the main window and destroy the splash.

4. Hook `did-finish-load` (optional improvement):

   - If you prefer tighter synchronization, swap to `did-finish-load` or add an IPC channel from renderer when Angular boot completes; the default plan uses `ready-to-show`.

5. Clean up on errors:

   - If main load fails (`did-fail-load`), destroy splash and show an error or the main window with devtools.

### Key snippets (non-exhaustive)

- Create splash (before main):
  ```js
  const splashWindow = new BrowserWindow({
    width: 420,
    height: 320,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: true,
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  ```

- Main hidden + swap on ready:
  ```js
  mainWindow = new BrowserWindow({ /* ... */ show: false, /* ... */ });
  mainWindow.once('ready-to-show', () => {
    splashWindow?.destroy();
    mainWindow.show();
  });
  setTimeout(() => { if (!mainWindow.isVisible()) { splashWindow?.destroy(); mainWindow.show(); } }, 10000);
  ```


### Notes

- Transparent + frameless gives the Adobe/IntelliJ vibe.
- We’ll reuse `public/icon.png` unless you provide a custom splash PNG.
- No Angular changes required for the default `ready-to-show` approach.

### To-dos

- [ ] Add splash.html, splash.css, optionally splash.png
- [ ] Create frameless splashWindow in main.js and load it
- [ ] Set main window show:false and show on ready
- [ ] Add 10s fallback to hide splash and show main
- [ ] On did-fail-load, destroy splash and show main or error