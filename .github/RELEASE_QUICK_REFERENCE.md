# 🚀 Release Quick Reference

## TL;DR - Release in 3 Steps

### 1️⃣ Create Release (Auto-builds)

```bash
npm version patch  # or minor/major
git push origin <branch> v$(node -p "require('./package.json').version")
```

### 2️⃣ Review Draft Release

- Go to [Releases](https://github.com/CommunityStream-io/flock/releases)
- Check auto-generated notes
- Edit if needed

### 3️⃣ Publish Release

```bash
gh workflow run publish-release.yml \
  -f version=0.1.3 \
  -f confirm=PUBLISH
```

Or manually: **Actions** → **Publish Release** → Enter version → Type `PUBLISH` → Run

---

## One-Liners

### Create and Tag
```bash
npm version patch && git push origin $(git branch --show-current) v$(node -p "require('./package.json').version")
```

### Publish Latest Draft
```bash
gh workflow run publish-release.yml -f version=$(gh release list --limit 1 | awk '{print $1}' | sed 's/v//') -f confirm=PUBLISH
```

### View Latest Release
```bash
gh release view $(gh release list --limit 1 | awk '{print $1}')
```

---

## Environment Setup (One-Time)

### Enable Manual Approval

1. Go to **Settings** → **Environments**
2. Create environment: `production-release`
3. Enable **Required reviewers**
4. Add reviewers
5. Save

---

## Release Types

| Type | Command | When |
|------|---------|------|
| **Patch** | `npm version patch` | Bug fixes, security patches |
| **Minor** | `npm version minor` | New features, improvements |
| **Major** | `npm version major` | Breaking changes |

---

## Common Commands

### Status
```bash
# List releases
gh release list

# List workflow runs
gh run list --workflow=release.yml

# Watch current run
gh run watch $(gh run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

### Publishing
```bash
# Publish v0.1.3
gh workflow run publish-release.yml -f version=0.1.3 -f confirm=PUBLISH

# Or edit and publish manually
gh release edit v0.1.3 --draft=false
```

### Troubleshooting
```bash
# View release
gh release view v0.1.3

# View workflow logs
gh run view <run-id> --log

# Re-run failed jobs
gh run rerun <run-id> --failed
```

---

## Checklist

### Before Release
- [ ] Tests passing
- [ ] Version bumped
- [ ] Changes documented

### Before Publishing  
- [ ] All builds succeeded
- [ ] Release notes reviewed
- [ ] Critical bugs fixed

### After Publishing
- [ ] Downloads verified
- [ ] Announce release
- [ ] Update docs

---

## URLs

- **Releases**: https://github.com/CommunityStream-io/flock/releases
- **Actions**: https://github.com/CommunityStream-io/flock/actions
- **Full Docs**: [RELEASE_PROCESS.md](RELEASE_PROCESS.md)

