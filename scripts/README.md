# Scripts Directory

This directory contains utility scripts for the Flock project.

## Available Scripts

### `generate-allure-index.js`

Generates a multi-branch, multi-run Allure report index for GitHub Pages deployment.

**Usage:**
```bash
# Basic usage (auto-detects branch, run ID, and SHA)
node scripts/generate-allure-index.js

# With explicit parameters
node scripts/generate-allure-index.js \
  --branch main \
  --run-id 1234567 \
  --sha abc1234 \
  --report-dir ./allure-report \
  --output-dir ./reports

# Local development
npm run allure:index:local
```

**Features:**
- 🌿 Multi-branch support
- 🏃 Run-specific directories
- 📊 Historical tracking
- 🌐 GitHub Pages integration
- 📱 Mobile-friendly interface

**Parameters:**
- `--branch`: Branch name (auto-detected from git)
- `--run-id`: CI run ID (auto-detected from GitHub Actions)
- `--sha`: Commit SHA (auto-detected from git)
- `--report-dir`: Source Allure report directory (default: `./allure-report`)
- `--output-dir`: Output directory for reports (default: `./reports`)

**Output:**
- `index.html`: Main navigation dashboard
- `branches.json`: Metadata for all branches and runs
- `{branch-name}/{run-id}-{sha}/`: Individual report directories

## Integration

The script is automatically used in the CI/CD pipeline (`.github/workflows/ci.yml`) to generate and deploy Allure reports to GitHub Pages.

## Local Development

For local development and testing:

```bash
# Generate a local report
npm run test:e2e:report

# Or manually
npm run test:e2e:headless
npm run allure:generate
npm run allure:index:local

# View the report
npx serve ./reports
```

## Documentation

For detailed information about the Allure reporting system, see [docs/testing/ALLURE_REPORTING.md](../docs/testing/ALLURE_REPORTING.md).
