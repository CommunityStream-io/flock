# Docker Build Setup Guide

## Quick Setup

The Docker build requires a GitHub Personal Access Token to download the `@straiforos/instagramtobluesky` package from GitHub Packages.

### Step 1: Set the PACKAGE_TOKEN

**Option A: Export in your shell** (temporary - lasts for current session):
```bash
export PACKAGE_TOKEN=your_github_token_here
npm run pack:win:docker
```

**Option B: Pass inline** (one-time use):
```bash
PACKAGE_TOKEN=your_token npm run pack:win:docker
```

**Option C: Create .env file** (permanent):
```bash
# Create .env file
echo "PACKAGE_TOKEN=your_token_here" > .env

# Docker Compose will automatically load it
npm run pack:win:docker
```

### Step 2: Get Your GitHub Token

If you don't have a token yet:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Classic"
3. Give it a name: "Flock Package Access"
4. Select scopes:
   - ✅ `read:packages` (required)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### Step 3: Build

```bash
export PACKAGE_TOKEN=ghp_your_token_here
npm run pack:win:docker
```

---

## What the Token Is Used For

The `.npmrc` file contains:
```
@straiforos:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${PACKAGE_TOKEN}
```

This tells npm to:
1. Download `@straiforos/*` packages from GitHub Packages
2. Authenticate using the PACKAGE_TOKEN

---

## Troubleshooting

### "401 Unauthorized"
```
npm error 401 Unauthorized - GET https://npm.pkg.github.com/...
```

**Fix**: Make sure your token:
- Is set correctly: `echo $PACKAGE_TOKEN`
- Has `read:packages` permission
- Hasn't expired

### "PACKAGE_TOKEN not set"
```
❌ PACKAGE_TOKEN environment variable not set
```

**Fix**: Export the token before building:
```bash
export PACKAGE_TOKEN=your_token
```

### Token Not Found in Docker
If the build starts but fails with 401, the token isn't being passed to Docker.

**Fix**: Make sure you're using the updated files:
- `docker/Dockerfile.electron-build` (line 32-33)
- `docker/docker-compose.electron-build.yml` (line 10, 24)
- `scripts/docker-build-electron.sh` (line 29-39)

---

## Security Notes

⚠️ **Never commit tokens to git!**

The `.env` file is already in `.gitignore`, but double-check:
```bash
git status .env
# Should show: "nothing to commit"
```

Store tokens securely:
- Use environment variables
- Use secret managers (1Password, etc.)
- Don't share tokens in screenshots or logs

---

## Alternative: Use Local Build (Without Docker)

If you can't use Docker or don't want to set up tokens in Docker, you can build locally:

```bash
# Make sure token is in your shell environment
export PACKAGE_TOKEN=your_token

# Build locally (may have file locking issues)
npm run pack:win:dir
```

---

**Ready?** Run:
```bash
export PACKAGE_TOKEN=your_github_token
npm run pack:win:docker
```


