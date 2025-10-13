# Installing Flock Native

Flock Native is the desktop application for migrating Instagram data to Bluesky. Choose your platform below for installation instructions.

## 📥 Downloads

Visit the [latest release](https://github.com/CommunityStream-io/flock/releases/latest) to download for your platform.

---

## 🪟 Windows

### System Requirements
- Windows 10 or Windows 11 (64-bit)
- 4 GB RAM (8 GB recommended)
- 500 MB free disk space

### Recommended: NSIS Installer

1. Download `Flock-Native-Setup-{version}.exe`
2. Double-click the installer
3. **Windows SmartScreen Warning**: Click "More info" → "Run anyway"
   - Flock Native is not yet code-signed, so Windows will show this warning
   - The app is open source and safe to use
4. Follow the installation wizard:
   - Choose installation directory
   - Select "Create desktop shortcut" (optional)
   - Click "Install"
5. Launch Flock Native from the Start Menu or desktop shortcut

### Alternative: Portable Version

No installation required:

1. Download `Flock-Native-{version}.exe`
2. Double-click to run
3. **Windows SmartScreen Warning**: Click "More info" → "Run anyway"
4. The app runs directly without installation

### Alternative: ZIP Archive

1. Download `Flock-Native-{version}-win.zip`
2. Extract to a folder
3. Run `Flock Native.exe` from the extracted folder

### Verification

To verify the download integrity:

```powershell
# Download checksums-windows.txt
# Then run:
Get-FileHash -Algorithm SHA256 Flock-Native-Setup-{version}.exe
# Compare with checksum in checksums-windows.txt
```

---

## 🍎 macOS

### System Requirements
- macOS 10.15 (Catalina) or later
- 4 GB RAM (8 GB recommended)
- 500 MB free disk space
- Intel or Apple Silicon (M1/M2/M3)

### Recommended: DMG Installer

1. Download `Flock-Native-{version}-universal.dmg`
2. Open the DMG file
3. Drag "Flock Native" to the Applications folder
4. **First Launch**:
   - Right-click "Flock Native" in Applications
   - Select "Open"
   - Click "Open" in the dialog
   - (Subsequent launches work normally)
5. Grant file system permissions if prompted

### Why "Open" is needed

macOS Gatekeeper blocks unsigned apps. Since Flock Native is not yet notarized by Apple, you need to explicitly allow it on first launch.

### Alternative: ZIP Archive

1. Download `Flock-Native-{version}-mac.zip`
2. Extract the ZIP file
3. Move "Flock Native.app" to Applications
4. Follow the "First Launch" steps above

### Verification

To verify the download integrity:

```bash
# Download checksums-macos.txt
# Then run:
shasum -a 256 Flock-Native-{version}-universal.dmg
# Compare with checksum in checksums-macos.txt
```

---

## 🐧 Linux

### System Requirements
- Ubuntu 20.04+ / Fedora 35+ / equivalent distribution
- 4 GB RAM (8 GB recommended)
- 500 MB free disk space

### Recommended: AppImage (Universal)

Works on any Linux distribution without installation:

1. Download `Flock-Native-{version}.AppImage`
2. Make it executable:
   ```bash
   chmod +x Flock-Native-{version}.AppImage
   ```
3. Run it:
   ```bash
   ./Flock-Native-{version}.AppImage
   ```

**Optional**: Integrate with your desktop environment:
```bash
# Move to /opt
sudo mv Flock-Native-{version}.AppImage /opt/flock-native
# Create desktop entry (manual or use AppImageLauncher)
```

### Debian/Ubuntu: DEB Package

```bash
# Download the DEB file
wget https://github.com/CommunityStream-io/flock/releases/download/v{version}/flock-native_{version}_amd64.deb

# Install
sudo dpkg -i flock-native_{version}_amd64.deb

# If dependencies are missing:
sudo apt-get install -f

# Launch
flock-native
```

### Fedora/RHEL: RPM Package

```bash
# Download the RPM file
wget https://github.com/CommunityStream-io/flock/releases/download/v{version}/flock-native-{version}.x86_64.rpm

# Install
sudo dnf install flock-native-{version}.x86_64.rpm
# or
sudo rpm -i flock-native-{version}.x86_64.rpm

# Launch
flock-native
```

### Verification

To verify the download integrity:

```bash
# Download checksums-linux.txt
# Then run:
sha256sum Flock-Native-{version}.AppImage
# Compare with checksum in checksums-linux.txt
```

---

## 🔧 Troubleshooting

### Windows: "Windows protected your PC"

This is Windows SmartScreen. Flock Native is not yet code-signed ($300/year cost).

**Solution**: Click "More info" → "Run anyway"

The app is open source and safe. Code signing will be added in a future release.

### macOS: "Cannot open because it is from an unidentified developer"

Flock Native is not yet notarized by Apple ($99/year Apple Developer Program).

**Solution**:
1. Right-click the app → "Open"
2. Click "Open" in the dialog

Or disable Gatekeeper temporarily:
```bash
sudo spctl --master-disable  # Disable Gatekeeper
# Install the app
sudo spctl --master-enable   # Re-enable Gatekeeper
```

### macOS: "App is damaged and can't be opened"

This happens due to Gatekeeper translocation.

**Solution**:
```bash
xattr -cr "/Applications/Flock Native.app"
```

### Linux: AppImage won't run

**Issue**: No FUSE
```bash
# Ubuntu/Debian
sudo apt-get install libfuse2

# Fedora
sudo dnf install fuse
```

**Issue**: Permissions
```bash
chmod +x Flock-Native-{version}.AppImage
```

### App won't start / crashes immediately

1. Check system requirements (OS version, RAM)
2. Try deleting app data:
   - Windows: `%APPDATA%\flock-native`
   - macOS: `~/Library/Application Support/flock-native`
   - Linux: `~/.config/flock-native`
3. Check for errors in the console (Ctrl+Shift+I or Cmd+Option+I)

---

## 🔄 Updating

### Manual Update

1. Download the latest version
2. Install over the existing installation
3. Your settings and data are preserved

### Auto-Update (Coming in v1.1)

Future versions will include automatic update checks and one-click updates.

---

## ❓ Need Help?

- **Issues**: [GitHub Issues](https://github.com/CommunityStream-io/flock/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CommunityStream-io/flock/discussions)
- **Security**: [Security Policy](https://github.com/CommunityStream-io/flock/security/policy)

---

## 🗑️ Uninstalling

### Windows
- **Installer version**: Use "Add or Remove Programs" in Windows Settings
- **Portable version**: Just delete the `.exe` file
- **Data**: Manually delete `%APPDATA%\flock-native` if desired

### macOS
- Drag "Flock Native.app" from Applications to Trash
- **Data**: Manually delete `~/Library/Application Support/flock-native` if desired

### Linux
- **AppImage**: Delete the `.AppImage` file
- **DEB**: `sudo apt-get remove flock-native`
- **RPM**: `sudo dnf remove flock-native`
- **Data**: Manually delete `~/.config/flock-native` if desired

