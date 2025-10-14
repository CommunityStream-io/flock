# Environment Variables Template

Copy the content below to a `.env` file in the project root and fill in your values.

**Note**: The `.env` file is gitignored and will not be committed to the repository.

## Template Content

```bash
# Flock Environment Variables Template
# Copy this file to .env and fill in your values
# Note: .env is gitignored and will not be committed

# =============================================================================
# SENTRY ERROR TRACKING
# =============================================================================
# Get your DSNs from https://sentry.io after creating projects

# Flock Native - Renderer Process (Angular app in Electron)
# Project: flock-native-renderer
# Leave empty to use development DSN from code
NATIVE_SENTRY_DSN=

# Flock Native - Main Process (Electron main process)
# Project: flock-native-main
# Leave empty to use development DSN from code
NATIVE_SENTRY_DSN_MAIN=

# Flock Mirage - Web App
# Project: flock-mirage
# Leave empty to use development DSN from code
MIRAGE_SENTRY_DSN=

# Sentry Organization Slug
# Get from: https://sentry.io/organizations/YOUR-ORG/
# Only needed for source map uploads
SENTRY_ORG=

# Sentry Auth Token
# Get from: Sentry → Settings → Auth Tokens → Create New Token
# Permissions needed: project:releases, project:write
# Only needed for source map uploads
SENTRY_AUTH_TOKEN=

# =============================================================================
# BLUESKY CREDENTIALS (for testing migration)
# =============================================================================
# WARNING: These are filtered from Sentry reports for privacy

BLUESKY_USERNAME=
BLUESKY_PASSWORD=

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================

# Override Electron dev server URL (default: http://localhost:4201)
# ELECTRON_START_URL=http://localhost:4201

# Force Electron to run in packaged mode (for testing)
# ELECTRON_IS_PACKAGED=1

# =============================================================================
# CI/CD SETTINGS (GitHub Actions)
# =============================================================================
# These are set in GitHub Secrets, not in .env file
# Listed here for reference only:
#
# Required GitHub Secrets:
# - NATIVE_SENTRY_DSN (for production builds)
# - NATIVE_SENTRY_DSN_MAIN (for production builds)
# - MIRAGE_SENTRY_DSN (for production builds)
# - SENTRY_AUTH_TOKEN (for source map uploads)
# - SENTRY_ORG (for source map uploads)
# - PACKAGE_TOKEN (for private npm packages)
```

## Setup Instructions

### 1. Create .env File

```bash
# Windows CMD
copy ENV_TEMPLATE.md .env

# Windows PowerShell
Copy-Item ENV_TEMPLATE.md .env

# Linux/Mac
cp ENV_TEMPLATE.md .env
```

Then edit the `.env` file and fill in your values.

### 2. Get Sentry DSNs

1. Sign up at [https://sentry.io](https://sentry.io)
2. Create three projects:
   - `flock-native-renderer` (Platform: Angular)
   - `flock-native-main` (Platform: Electron)
   - `flock-mirage` (Platform: Angular)
3. Copy each project's DSN

### 3. Optional: Get Sentry Auth Token

Only needed if you want to upload source maps locally:

1. Go to Sentry → Settings → Auth Tokens
2. Create new token
3. Grant permissions: `project:releases`, `project:write`
4. Copy the token

### 4. Verify Setup

```bash
node scripts/verify-sentry-setup.js
```

## Notes

### Development DSNs

- Dev DSNs are already included in the code and are safe to commit
- You only need to set these environment variables if you want to:
  - Override the default dev DSNs
  - Test with production Sentry projects locally
  - Upload source maps from your local machine

### Production DSNs

- Production builds use environment variables from GitHub Secrets
- DSN placeholders like `${NATIVE_SENTRY_DSN}` are replaced at build time
- See `docs/SENTRY_SETUP.md` for complete CI/CD setup instructions

### Privacy

The following environment variables are automatically filtered from Sentry reports:

- `BLUESKY_PASSWORD`
- `BLUESKY_USERNAME`
- `SENTRY_DSN`
- `NATIVE_SENTRY_DSN`
- `NATIVE_SENTRY_DSN_MAIN`
- `MIRAGE_SENTRY_DSN`

## Quick Start Examples

### Minimal .env (Development Only)

```bash
# Empty .env - uses dev DSNs from code
# This works out of the box!
```

### With Custom Sentry Projects

```bash
NATIVE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/987654
NATIVE_SENTRY_DSN_MAIN=https://def456@o123456.ingest.sentry.io/987655
MIRAGE_SENTRY_DSN=https://ghi789@o123456.ingest.sentry.io/987656
```

### With Source Map Upload Support

```bash
NATIVE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/987654
NATIVE_SENTRY_DSN_MAIN=https://def456@o123456.ingest.sentry.io/987655
MIRAGE_SENTRY_DSN=https://ghi789@o123456.ingest.sentry.io/987656
SENTRY_ORG=your-org-name
SENTRY_AUTH_TOKEN=sntrys_abc123...
```

## Troubleshooting

### "Module not found" errors

Make sure you've run `npm install` after cloning the repository.

### Sentry not initializing

1. Check that your DSN format is correct: `https://KEY@ORG.ingest.sentry.io/PROJECT`
2. Verify there are no extra spaces or quotes in your `.env` file
3. Restart your development server after changing `.env`

### Environment variables not loading

1. Make sure the file is named `.env` (not `.env.txt`)
2. The file should be in the project root directory
3. Check that `dotenv` is installed: `npm list dotenv`

## More Information

- Complete Sentry setup guide: `docs/SENTRY_SETUP.md`
- Implementation details: `SENTRY_CI_CD_COMPLETE.md`
- Verification script: `scripts/verify-sentry-setup.js`

