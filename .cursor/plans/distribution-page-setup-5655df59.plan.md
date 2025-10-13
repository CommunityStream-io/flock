<!-- 5655df59-35bb-4d29-a467-a79a021c5ff0 d945148d-e8c4-49a9-bb7f-c87c632f8e5c -->
# Flock Native Distribution Implementation Plan

## Overview

Set up Flock Native desktop app distribution with electron-builder, automated builds via GitHub Actions, and a distribution page. **Phased approach: Windows → macOS → Linux** to ship fast.

## Current State

- ✅ Electron app working in development (`npm run start:native`)
- ✅ Icon generation script exists (`projects/flock-native/scripts/create-icon.js`)
- ✅ Basic CI/CD for testing exists (`.github/workflows/ci.yml`)
- ❌ No electron-builder configuration
- ❌ No production build/packaging
- ❌ No distribution page

## Phase 1: Windows Distribution (Priority 1 - ASAP)

### 1.1 Configure electron-builder for Windows

**Files to modify:**

- `package.json` - Add electron-builder config and build scripts
- Create `projects/flock-native/build/` directory for build resources

**Configuration needed:**

```json
{
  "build": {
    "appId": "io.communitystream.flock.native",
    "productName": "Flock Native",
    "directories": {
      "buildResources": "projects/flock-native/build",
      "output": "dist/electron"
    },
    "files": [
      "dist/flock-native/**/*",
      "projects/flock-native/electron/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "extraMetadata": {
      "main": "projects/flock-native/electron/main.js"
    },
    "win": {
      "target": ["nsis", "portable", "zip"],
      "icon": "projects/flock-native/build/icon.ico"
    }
  }
}
```

**Scripts to add:**

- `pack:win` - Build Windows installers
- `pack:win:dir` - Build unpacked Windows directory for testing

### 1.2 Generate Windows icon assets

- ✅ Already have `icon.png` (512x512)
- ✅ Icon script (`create-icon.js`) already creates proper ICO with 16x16, 32x32, 48x48, 256x256 sizes
- **Action needed:** Update script to copy ICO to `projects/flock-native/build/icon.ico` (electron-builder looks for it there)
- Or symlink/copy from `public/favicon.ico` to `build/icon.ico` during build

### 1.3 Test local Windows build

- Run `npm run build:native` to build Angular app
- Run `npm run pack:win` to create Windows installers
- Test the installers on Windows 10/11
- Verify app launches and works correctly

### 1.4 Create GitHub Actions workflow for Windows builds

**New file:** `.github/workflows/release.yml`

Workflow should:

- Trigger on version tags (e.g., `v1.0.0`)
- Build Angular app for production
- Package Windows installers using electron-builder
- Create GitHub Release (draft)
- Upload Windows artifacts (.exe, portable, .zip)
- Generate SHA256 checksums

### 1.5 Create simple Windows distribution page

**Location:** Create as separate static site or GitHub Pages

**Required sections:**

- Hero with download button (auto-detect Windows)
- Windows download options (NSIS installer, portable, zip)
- System requirements table
- Installation instructions for Windows
- FAQ section

**Tech stack:** Plain HTML/CSS/JS (no framework needed) with Material Design 3 styling to match Flock theme

## Phase 2: macOS Distribution (Priority 2)

### 2.1 Configure electron-builder for macOS

**Update `package.json` build config:**

```json
"mac": {
  "target": ["dmg", "zip"],
  "icon": "projects/flock-native/build/icon.icns",
  "category": "public.app-category.utilities"
}
```

### 2.2 Generate macOS icon assets

- Convert `icon.png` to `.icns` format
- Use `iconutil` or create script with `sharp`/`png2icons` package
- Ensure icon works on Retina displays (512x512@2x)

### 2.3 Update GitHub Actions for macOS

- Add macOS build job (`runs-on: macos-latest`)
- Build DMG and ZIP for macOS
- Upload macOS artifacts to release

### 2.4 Update distribution page for macOS

- Add macOS download section
- Add macOS installation instructions
- Update platform detection to show macOS button

## Phase 3: Linux Distribution (Priority 3)

### 3.1 Configure electron-builder for Linux

**Update `package.json` build config:**

```json
"linux": {
  "target": ["AppImage", "deb", "rpm"],
  "icon": "projects/flock-native/build/icons",
  "category": "Utility"
}
```

### 3.2 Generate Linux icon assets

- Create PNG icon set: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512
- Place in `projects/flock-native/build/icons/` directory

### 3.3 Update GitHub Actions for Linux

- Add Linux build job (`runs-on: ubuntu-latest`)
- Build AppImage, DEB, RPM packages
- Upload Linux artifacts to release

### 3.4 Complete distribution page

- Add Linux download section
- Add Linux installation instructions
- Platform detection for Linux
- Make page responsive for all devices

## Phase 4: Polish & Documentation

### 4.1 Release workflow refinement

- Add version extraction from git tags
- Auto-generate release notes from commits
- Add checksum generation for all artifacts
- Test full release workflow end-to-end

### 4.2 Documentation

- Update main README.md with download links
- Create `INSTALLATION.md` with platform-specific guides
- Document release process for maintainers
- Add troubleshooting guide

### 4.3 Distribution page enhancements

- Add app screenshots/demo
- Add feature comparison table
- Improve accessibility (WCAG 2.1 AA)
- Add analytics (privacy-respecting)
- SEO optimization

## Future Enhancements (Post-MVP)

### Code Signing (Recommended for v1.1)

- **Windows:** Obtain code signing certificate ($100-400/year)
- **macOS:** Apple Developer Program ($99/year) + notarization
- Update GitHub Actions with signing secrets

### Auto-Update System (v1.1)

- Integrate `electron-updater`
- Configure GitHub Releases as update server
- Add update check on app launch
- User notification for available updates

### Package Managers (v1.2+)

- **Windows:** Chocolatey, winget
- **macOS:** Homebrew cask
- **Linux:** Snap Store, Flathub, AUR

## Key Files to Create/Modify

### Create:

- `.github/workflows/release.yml` - Release automation
- `projects/flock-native/build/icon.ico` - Windows icon
- `projects/flock-native/build/icon.icns` - macOS icon
- `projects/flock-native/build/icons/*.png` - Linux icon set
- `dist-page/index.html` - Distribution page
- `dist-page/styles.css` - Distribution page styles
- `dist-page/platform-detect.js` - Platform detection script
- `INSTALLATION.md` - Installation guide

### Modify:

- `package.json` - Add electron-builder config and scripts
- `README.md` - Add download section
- `projects/flock-native/electron/main.js` - Update production path if needed

## Technical Decisions

### Why skip code signing initially?

- **Speed:** Certificates take 2-5 days to obtain and cost $211-511/year
- **MVP focus:** Users can still install (with warnings) to validate the app
- **Iterative:** Can add signing in v1.1 after validating distribution works

### Why GitHub Releases?

- **Free:** No hosting costs for public repos
- **Simple:** Built-in with GitHub, no extra infrastructure
- **Compatible:** Works perfectly with electron-builder and electron-updater

### Why plain HTML distribution page?

- **Fast:** No build tooling, works immediately
- **Simple:** Easy to maintain and deploy
- **Performance:** Loads in <1s, perfect Lighthouse score

## Success Criteria

### Phase 1 Complete:

- [ ] Windows users can download and install Flock Native
- [ ] Installer works on Windows 10 and 11
- [ ] GitHub Actions automatically builds on git tags
- [ ] Distribution page shows Windows download

### Phase 2 Complete:

- [ ] macOS users can download DMG
- [ ] App works on Intel and Apple Silicon Macs
- [ ] Distribution page shows macOS download

### Phase 3 Complete:

- [ ] Linux users can download AppImage/DEB/RPM
- [ ] AppImage works without installation
- [ ] Distribution page complete for all platforms

### Final Success:

- [ ] All three platforms have working installers
- [ ] First release (v1.0.0) published to GitHub
- [ ] Distribution page live and accessible
- [ ] Documentation complete

## Estimated Timeline

**With focused effort:**

- Phase 1 (Windows): 2-3 days
- Phase 2 (macOS): 1-2 days
- Phase 3 (Linux): 1-2 days
- Phase 4 (Polish): 1 day
- **Total: ~1 week**

**Quick MVP (Windows only):** 2-3 days

### To-dos

- [ ] Configure electron-builder in package.json with Windows target
- [ ] Generate proper Windows .ico icon with multiple sizes
- [ ] Add npm scripts for packaging Windows builds
- [ ] Test local Windows build and installer functionality
- [ ] Create GitHub Actions workflow for automated Windows releases
- [ ] Create distribution page with Windows download section
- [ ] Add macOS configuration to electron-builder
- [ ] Generate .icns icon file for macOS
- [ ] Add macOS build job to GitHub Actions workflow
- [ ] Add macOS section to distribution page
- [ ] Add Linux configuration to electron-builder
- [ ] Generate PNG icon set for Linux
- [ ] Add Linux build job to GitHub Actions workflow
- [ ] Add Linux section to distribution page
- [ ] Create installation documentation and update README
- [ ] Test complete release workflow end-to-end