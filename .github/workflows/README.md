# GitHub Actions Workflows

Automated workflows for the Flock Native Electron Desktop App.

## 📋 Available Workflows

### 1. CI Workflow (`ci.yml`)

Simple CI validation that runs on every push and PR.

**What It Does:**
1. **Tests** - `npm test` (Angular tests with CLI integration)
2. **Linting** - `npm run lint` (ESLint checks)
3. **Build** - `npm run build` (Angular compilation)
4. **Electron Build** - `npm run electron-build` (Desktop app compilation)

**When It Runs:**
- Push to `main` branch
- Pull requests targeting `main` branch

---

### 2. Release Workflow (`release.yml`)

Creates official production releases with full build artifacts.

**What It Does:**
- Creates a draft release on GitHub
- Builds installers for Windows, macOS (Intel + Apple Silicon), and Linux
- Uploads source maps to Sentry for error tracking
- Generates comprehensive release notes with download links

**When It Runs:**
- When a version tag is pushed (e.g., `v0.5.1`)
- Manual trigger via workflow_dispatch

**How to Use:**
```bash
# Create a new release
gh workflow run release.yml -f version=0.5.2

# Or push a tag
git tag v0.5.2
git push origin v0.5.2
```

**Artifacts Generated:**
- Windows: NSIS installer, portable EXE, ZIP
- macOS: DMG, ZIP (both Intel x64 and Apple Silicon arm64)
- Linux: AppImage, DEB, RPM

---

### 3. Snapshot Release Workflow (`snapshot-release.yml`) 🆕

**Purpose:** Generate dev snapshot builds for testing without building locally.

**What It Does:**
- Creates pre-release snapshot builds on any branch
- Uses smart version naming: `v0.5.1-snapshot-branch-commit-timestamp`
- Builds for all platforms (Windows, macOS, Linux)
- Auto-cleans up snapshots older than 30 days
- Marks releases as "pre-release" to distinguish from production

**When It Runs:**
- Automatically when you push to a `snapshot/**` branch
- Manual trigger for any branch via workflow_dispatch

**How to Use:**

**Option 1: Automatic (Push to snapshot branch)**
```bash
# Create and push to a snapshot branch
git checkout -b snapshot/my-feature
git push origin snapshot/my-feature

# Workflow automatically runs and builds artifacts
```

**Option 2: Manual Trigger (Any branch)**
```bash
# Trigger from current branch
gh workflow run snapshot-release.yml

# Trigger from specific branch
gh workflow run snapshot-release.yml -f branch=feature/my-branch
```

**Snapshot Version Format:**
```
v0.5.1-snapshot-main-a3f2b1c-20251015T1230Z
       └──┬──┘ └─┬─┘ └──┬──┘ └─────┬──────┘
     base ver  branch  commit   timestamp
```

**Benefits:**
- ✅ No need to build locally (saves time, especially on slow machines)
- ✅ Test on multiple platforms without cross-platform builds
- ✅ Share builds with QA/testers for PR validation
- ✅ Automatic cleanup prevents release clutter

**Important Notes:**
- Snapshots are marked as **pre-release** (not production)
- Snapshots auto-delete after **30 days**
- Source maps still uploaded to Sentry for debugging
- All builds run in parallel for speed

---

### 4. Publish Release Workflow (`publish-release.yml`)

Publishes a draft release to production.

**What It Does:**
- Validates the release exists and has artifacts
- Requires manual confirmation (`PUBLISH`)
- Requires approval from production-release environment
- Publishes the release (removes draft status)
- Adds publish metadata to release notes

**When It Runs:**
- Manual trigger only (for safety)

**How to Use:**
```bash
# Publish a draft release
gh workflow run publish-release.yml -f version=0.5.2 -f confirm=PUBLISH
```

---

## 🎯 Workflow Comparison

| Feature | CI | Release | Snapshot | Publish |
|---------|-------|---------|----------|---------|
| **Trigger** | Auto (push/PR) | Tag/Manual | Auto (`snapshot/**`) or Manual | Manual only |
| **Platform Builds** | ❌ | ✅ All | ✅ All | N/A |
| **Artifacts** | ❌ | Production installers | Pre-release installers | N/A |
| **Draft Release** | ❌ | ✅ Yes | ❌ Published (pre-release) | Publishes existing |
| **Auto-Cleanup** | N/A | ❌ | ✅ 30 days | N/A |
| **Use Case** | Validate code | Official releases | Dev testing | Release approval |

---

## 🚀 Quick Start Guide

### For Development Testing (Snapshot)
```bash
# Quick: Push to snapshot branch
git checkout -b snapshot/test-feature
git push origin snapshot/test-feature

# Downloads ready in ~15-20 minutes
```

### For Official Release
```bash
# 1. Trigger release build
gh workflow run release.yml -f version=0.5.2

# 2. Wait for builds to complete (~20-30 minutes)

# 3. Test the draft release artifacts

# 4. Publish when ready
gh workflow run publish-release.yml -f version=0.5.2 -f confirm=PUBLISH
```

---

## 📝 Best Practices

1. **Use Snapshots for Testing**: Don't build locally if you need to test on multiple platforms
2. **Use snapshot/** prefix**: Makes it clear these are test branches
3. **Clean Up Old Snapshots**: Automatic, but you can manually delete if needed
4. **Test Before Publishing**: Always test draft releases before publishing
5. **Semantic Versioning**: Follow semver for official releases (v0.5.1, v1.0.0, etc.)

---

## 🔧 Maintenance

### Monitoring Snapshot Cleanup
Snapshot cleanup runs automatically after each successful snapshot build. Check the workflow logs to see what was cleaned up.

### Manual Snapshot Deletion
```bash
# List all snapshot releases
gh release list --limit 100 | grep snapshot

# Delete a specific snapshot
gh release delete v0.5.1-snapshot-branch-abc123-20251015T1230Z --yes

# Delete the tag too
git push origin :refs/tags/v0.5.1-snapshot-branch-abc123-20251015T1230Z
```

---

## 💡 Tips

- **Snapshot builds are fast**: All platforms build in parallel (~15-20 min total)
- **No local setup needed**: Perfect for contributors without cross-platform build tools
- **Pre-release flag**: Snapshots won't show up as "latest release"
- **Sentry integration**: Snapshots include source maps for debugging
- **Auto-versioning**: No need to manually update package.json for snapshots
