# 🚀 Release Process Documentation

## Overview

The Flock Native release process is fully automated with built-in approval controls to ensure quality releases.

## Workflows

### 1. **Release Workflow** (`release.yml`)

**Triggers:**
- Push tags matching `v*.*.*` (e.g., `v0.1.3`)
- Manual workflow dispatch

**What it does:**
1. ✅ Auto-generates release notes from commits and PRs
2. ✅ Builds installers for Windows, macOS, and Linux
3. ✅ Uploads all artifacts to GitHub Releases
4. ✅ Creates release as **DRAFT** (not published)
5. ✅ Adds build status and next steps to release notes

**Output:** Draft release ready for review

### 2. **Publish Release Workflow** (`publish-release.yml`)

**Triggers:**
- Manual workflow dispatch only

**What it does:**
1. ✅ Validates the version exists as a draft
2. ✅ Requires typing "PUBLISH" to confirm
3. ✅ **Waits for manual approval** (if environment protection is configured)
4. ✅ Publishes the release
5. ✅ Adds publish metadata to release notes

**Output:** Public release available for download

## Setting Up Environment Protection (Manual Approval)

To enable manual approval before publishing releases:

### Step 1: Create Environment

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Environments**
3. Click **New environment**
4. Name it: `production-release`
5. Click **Configure environment**

### Step 2: Configure Protection Rules

Under **Environment protection rules**:

1. ✅ **Check "Required reviewers"**
   - Add team members who can approve releases
   - Recommended: 1-2 reviewers minimum
   
2. ✅ **Check "Wait timer"** (optional)
   - Set to 0 minutes (no wait) or add a delay if needed
   
3. ✅ **Deployment branches** (optional)
   - Select "Selected branches"
   - Add `main` and `43-distros` (or your release branches)

4. Click **Save protection rules**

### Step 3: Test the Setup

1. Create a test release
2. Run the Publish workflow
3. You should see a **"Waiting for approval"** step
4. Approvers will get a notification
5. After approval, the release publishes automatically

## Release Process Step-by-Step

### Creating a New Release

#### Option A: Automated (Recommended)

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Commit the version change
git add package.json
git commit -m "chore: Bump version to $(node -p "require('./package.json').version")"

# 3. Create and push tag
VERSION=$(node -p "require('./package.json').version")
git tag v$VERSION
git push origin <branch> v$VERSION
```

This triggers the release workflow automatically!

#### Option B: Manual Dispatch

1. Go to **Actions** → **Release Flock Native**
2. Click **Run workflow**
3. Enter version (e.g., `0.1.3`)
4. Click **Run workflow**

### Publishing a Release

After the release workflow completes:

#### Option A: Using Publish Workflow (Recommended)

1. Go to **Actions** → **Publish Release**
2. Click **Run workflow**
3. Enter version (e.g., `0.1.3`)
4. Type **PUBLISH** in the confirm field
5. Click **Run workflow**
6. **Approve the deployment** when prompted (if environment protection is enabled)
7. Release is published!

#### Option B: Using CLI

```bash
# Publish immediately
gh release edit v0.1.3 --draft=false

# Or review first
gh release view v0.1.3
gh release edit v0.1.3 --draft=false
```

#### Option C: Using GitHub UI

1. Go to **Releases**
2. Find the draft release
3. Click **Edit**
4. Uncheck **"Set as a pre-release"** (if needed)
5. Click **Publish release**

## Release Checklist

### Before Tagging

- [ ] All tests passing
- [ ] Code reviewed and merged
- [ ] Version bumped in `package.json`
- [ ] Breaking changes documented
- [ ] Migration guide written (if needed)

### After Draft Release Created

- [ ] Verify all platform builds succeeded
- [ ] Check file sizes are reasonable
- [ ] Review auto-generated release notes
- [ ] Add custom release notes if needed
- [ ] Test installers on actual systems (optional for patches)

### Before Publishing

- [ ] Release notes are complete and accurate
- [ ] All assets are uploaded correctly
- [ ] Version number is correct
- [ ] No critical bugs reported

### After Publishing

- [ ] Verify download links work
- [ ] Update README/docs if needed
- [ ] Announce on GitHub Discussions
- [ ] Post on social media (optional)
- [ ] Close related issues/milestones

## Release Types

### Patch Release (0.0.X)

**When:**
- Bug fixes
- Security patches
- Documentation updates
- No new features

**Process:**
1. Create tag
2. Auto-draft release
3. Quick review
4. Publish same day

### Minor Release (0.X.0)

**When:**
- New features
- Non-breaking changes
- Performance improvements

**Process:**
1. Create tag
2. Auto-draft release
3. Review release notes
4. Test installers on 2-3 platforms
5. Publish within 1-2 days

### Major Release (X.0.0)

**When:**
- Breaking changes
- Major new features
- Architecture changes

**Process:**
1. Create tag
2. Auto-draft release
3. Comprehensive testing on all platforms
4. Update all documentation
5. Write migration guide
6. Beta test period (optional)
7. Publish with announcement

## Auto-Generated Release Notes

The release workflow automatically generates notes from:

### Commit Messages

Uses conventional commits format:
- `fix: ...` → Bug Fixes section
- `feat: ...` → New Features section
- `docs: ...` → Documentation section
- `chore: ...` → Maintenance section
- `BREAKING:` → Breaking Changes section

### Pull Requests

Includes merged PRs with:
- PR title
- PR number and link
- Author attribution

### Contributors

Lists all contributors to the release.

## Customizing Release Notes

### In Commit Messages

Use detailed commit messages:

```bash
# Good
git commit -m "feat: Add auto-update support for Windows

This adds electron-updater integration for Windows platform.
Includes background download and restart prompt.

Closes #42"

# Bad
git commit -m "update stuff"
```

### In Workflow

Edit `.github/workflows/release.yml`:

```yaml
- name: Generate Release Notes
  id: generate_notes
  uses: actions/github-script@v7
  with:
    script: |
      // Customize the release notes format here
      const customNotes = `
      ## 🎉 New in this release
      
      ${body}
      
      ## 🛠️ Custom section
      - Your custom content
      `;
```

### After Draft Created

Edit the draft release directly on GitHub:
1. Go to Releases → Edit draft
2. Modify the notes as needed
3. Save (keep as draft)
4. Publish when ready

## Troubleshooting

### Release workflow fails

**Check:**
- All dependencies installed correctly
- Angular build completes
- electron-builder configuration is valid
- GH_TOKEN has write permissions

### Publish workflow fails

**Common issues:**
- Version doesn't exist as draft → Create release first
- Didn't type "PUBLISH" exactly → Retry with correct confirmation
- No approval → Check environment protection settings
- Already published → Can't re-publish same version

### Missing assets

**Fix:**
- Re-run failed build jobs
- Check electron-builder logs
- Verify `publish: always` in electron-builder command

### Wrong release notes

**Fix:**
- Edit draft release before publishing
- Update commit messages for future releases
- Customize the generate_notes script

## Security Considerations

### Who Can Release?

**Tag pushing:**
- Anyone with write access to the repository
- Recommended: Maintainers only

**Publishing:**
- Anyone who can approve the `production-release` environment
- Recommended: Core team members only

### Best Practices

1. ✅ Use environment protection for production releases
2. ✅ Require 2FA for release approvers
3. ✅ Review all changes before tagging
4. ✅ Test draft releases before publishing
5. ✅ Use separate branches for releases
6. ✅ Sign commits and tags

### Secrets Required

- `GITHUB_TOKEN` - Auto-provided by GitHub Actions
- `PACKAGE_TOKEN` - For private npm packages (if used)

## Monitoring Releases

### View Release Status

```bash
# List recent releases
gh release list --limit 10

# View specific release
gh release view v0.1.3

# View release with assets
gh release view v0.1.3 --json assets

# List release workflow runs
gh run list --workflow=release.yml --limit 5

# Watch a specific run
gh run watch <run-id>
```

### Check Build Logs

```bash
# View workflow run
gh run view <run-id>

# Download logs
gh run view <run-id> --log > release.log
```

### Download Metrics

```bash
# View download stats (requires gh extension)
gh release view v0.1.3 --json assets | jq '.assets[] | {name: .name, downloads: .download_count}'
```

## Examples

### Create Patch Release

```bash
# Fix a bug
git checkout -b fix/critical-bug
# ... make changes ...
git commit -m "fix: Correct path resolution in packaged app"
git push origin fix/critical-bug

# Merge to main
gh pr create --title "Fix critical path bug" --body "Fixes #123"
gh pr merge --squash

# Create release
git checkout main
git pull
npm version patch
git push origin main v$(node -p "require('./package.json').version")

# Wait for build, then publish
gh workflow run publish-release.yml -f version=0.1.3 -f confirm=PUBLISH
```

### Create Feature Release

```bash
# Develop feature
git checkout -b feat/auto-update
# ... make changes ...
git commit -m "feat: Add auto-update functionality"
git push origin feat/auto-update

# Merge to main
gh pr create --title "Add auto-update support" --body "Implements #42"
gh pr merge --squash

# Create release
git checkout main
git pull
npm version minor
git push origin main v$(node -p "require('./package.json').version")

# Build and test
gh run list --workflow=release.yml
gh release view v0.2.0

# Test installers...

# Publish when ready
gh workflow run publish-release.yml -f version=0.2.0 -f confirm=PUBLISH
```

## Advanced: Beta Releases

To create beta/pre-releases:

1. Tag with beta suffix: `v0.2.0-beta.1`
2. Release workflow will create draft
3. Edit draft and check **"Set as a pre-release"**
4. Publish (no approval needed for pre-releases)

Or modify `publish-release.yml` to support beta channel.

## Questions?

- 📖 See [INSTALLATION.md](../INSTALLATION.md) for user installation
- 🐛 Report issues at https://github.com/CommunityStream-io/flock/issues
- 💬 Discuss in [GitHub Discussions](https://github.com/CommunityStream-io/flock/discussions)

---

**Last Updated:** October 13, 2025  
**Workflow Version:** 2.0 (with automated notes + manual approval)

