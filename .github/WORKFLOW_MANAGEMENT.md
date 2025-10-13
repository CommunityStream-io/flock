# 🔧 Workflow Management Guide

## Current Active Workflows

### ✅ Active Workflows (3)

1. **Feathering the Nest** (`ci.yml`)
   - Main CI/CD pipeline
   - Runs on: Push, Pull Request
   - Tests, builds, coverage

2. **Release Flock Native** (`release.yml`)
   - Creates draft releases
   - Runs on: Tag push (`v*.*.*`) or manual dispatch
   - Auto-generates release notes

3. **Publish Release** (`publish-release.yml`)
   - Publishes draft releases
   - Runs on: Manual dispatch only
   - Supports approval controls

### ❌ Disabled Workflows (6)

These were disabled on October 13, 2025:

1. Build E2E Docker Image
2. Docker E2E Tests
3. Deploy Jekyll Documentation Site
4. .github/workflows/node-setup.yml
5. .github/workflows/sauce-labs-e2e.yml
6. Sauce Labs Hosted E2E Tests

**Why disabled?** These were from old experimental branches and are no longer needed.

## How to Run Workflows

### Option 1: Via GitHub UI

**⚠️ Important**: The "Run workflow" button **only appears** for workflows on:
- Your **default branch** (usually `main`)
- The **currently selected branch** in the GitHub Actions UI

**To see the button:**

1. Go to **Actions** tab
2. Click on the workflow name (e.g., "Release Flock Native")
3. Look for **"Use workflow from"** dropdown
4. Select your branch (e.g., `43-distros`)
5. Now the **"Run workflow"** button appears
6. Fill in inputs and click **"Run workflow"**

### Option 2: Via GitHub CLI (Works from Any Branch)

```bash
# Release workflow (manual dispatch)
gh workflow run "Release Flock Native" --ref 43-distros -f version=0.1.3

# Publish workflow (manual dispatch)
gh workflow run "Publish Release" --ref 43-distros -f version=0.1.3 -f confirm=PUBLISH

# List all workflows
gh workflow list

# View workflow details
gh workflow view "Release Flock Native"

# List recent runs
gh run list --workflow=release.yml --limit 5

# Watch a workflow run
gh run watch <run-id>
```

### Option 3: Via Tag (Recommended for Releases)

```bash
# Create and push tag (auto-triggers release workflow)
git tag v0.1.3
git push origin <branch> v0.1.3

# Workflow runs automatically!
```

## Workflow Visibility Issue

### Problem: "I don't see the Run workflow button"

**Cause**: GitHub only shows the button for workflows on specific branches.

**Solution Options:**

1. **Switch branch in UI** → Select your branch in the "Use workflow from" dropdown
2. **Merge to main** → Once on default branch, button always shows
3. **Use CLI** → `gh workflow run` works from any branch
4. **Use tags** → Push tags to trigger automatically

## Managing Workflows

### Disable a Workflow

```bash
# Disable by name
gh workflow disable "Workflow Name"

# Disable by file
gh workflow disable -f .github/workflows/old-workflow.yml
```

### Enable a Workflow

```bash
# Enable by name
gh workflow enable "Workflow Name"
```

### Delete Workflow Runs (Clean Up)

```bash
# Delete all runs for a workflow
gh run list --workflow=old-workflow.yml --json databaseId --jq '.[].databaseId' | xargs -I {} gh run delete {}

# Delete failed runs only
gh run list --workflow=release.yml --status=failure --json databaseId --jq '.[].databaseId' | xargs -I {} gh run delete {}
```

### View Workflow YAML

```bash
# View workflow configuration
gh workflow view release.yml --yaml
```

## Workflow Files Location

```
.github/
├── workflows/
│   ├── ci.yml                  # Main CI/CD
│   ├── release.yml             # Release automation
│   ├── publish-release.yml     # Publish with approval
│   └── README.md               # Workflows documentation
├── RELEASE_PROCESS.md          # Release process guide
├── RELEASE_QUICK_REFERENCE.md  # Quick commands
├── RELEASE_WORKFLOW.md         # Visual diagrams
└── WORKFLOW_MANAGEMENT.md      # This file
```

## Common Issues & Solutions

### Issue: Workflow doesn't show in Actions tab

**Solution:**
- Check if workflow is on the current branch
- Look in "Use workflow from" dropdown
- Workflow may be disabled: `gh workflow enable "Workflow Name"`

### Issue: "Run workflow" button missing

**Solution:**
- Select your branch in "Use workflow from" dropdown
- Or use CLI: `gh workflow run "Workflow Name" --ref your-branch`

### Issue: Workflow runs but no release created

**Solution:**
- Check if tag exists: `git tag -l`
- For manual dispatch: Ensure version matches a tag or create one first
- View logs: `gh run view <run-id> --log`

### Issue: Old workflows still showing

**Solution:**
- Disable them: `gh workflow disable "Workflow Name"`
- They'll still appear in history but won't run

### Issue: Release created without tag

**Solution:**
- This happens with manual dispatch without a tag
- Delete untagged release: `gh release delete <tag> --yes`
- Create proper tag: `git tag vX.Y.Z && git push origin branch vX.Y.Z`

## Best Practices

### ✅ DO:
- Create tags for releases (triggers workflow automatically)
- Use manual dispatch for testing
- Disable unused workflows
- Keep workflow files in version control
- Document workflow purpose

### ❌ DON'T:
- Delete workflow files from all branches (breaks history)
- Manually create releases without using workflow
- Skip testing workflows before merging to main
- Hardcode secrets in workflow files

## Workflow Triggers Summary

| Workflow | Trigger | When to Use |
|----------|---------|-------------|
| **CI** | Push, PR | Automatic on every commit |
| **Release** | Tag push, Manual | When creating a new release |
| **Publish** | Manual only | When publishing a draft release |

## Quick Commands

```bash
# List workflows
gh workflow list

# Run release workflow
gh workflow run "Release Flock Native" --ref 43-distros -f version=0.1.3

# Run publish workflow
gh workflow run "Publish Release" --ref 43-distros -f version=0.1.3 -f confirm=PUBLISH

# Monitor running workflow
gh run watch $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')

# View latest release
gh release view $(gh release list --limit 1 | awk '{print $3}')

# Disable old workflow
gh workflow disable "Workflow Name"
```

## Cleanup Checklist

- [x] Disabled old Docker E2E workflows
- [x] Disabled old Sauce Labs workflows
- [x] Disabled old node-setup workflow
- [x] Disabled Jekyll documentation workflow
- [x] Kept essential workflows (CI, Release, Publish)
- [x] Documented workflow management
- [ ] Merge workflows to main branch (optional - for UI button visibility)

---

**Last Updated:** October 13, 2025  
**Status:** Workflows cleaned up and documented

