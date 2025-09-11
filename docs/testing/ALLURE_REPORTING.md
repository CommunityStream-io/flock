# Allure Reporting System

## Overview

The Flock project uses a comprehensive Allure reporting system that automatically generates and publishes test reports for every CI run. Reports are organized by branch and run, providing a complete history of test execution across all branches and commits.

## Features

- 🌿 **Multi-Branch Support**: Separate reports for each branch
- 🏃 **Run-Specific Reports**: Each CI run gets its own report directory
- 📊 **Historical Tracking**: Complete test history across all branches
- 🌐 **GitHub Pages Integration**: Automatic publishing to GitHub Pages
- 📱 **Mobile-Friendly**: Responsive design for all devices
- 🔍 **Easy Navigation**: Clean, intuitive interface

## Report Structure

```
https://communitystream-io.github.io/flock/
├── index.html                    # Main navigation dashboard
├── branches.json                 # Metadata for all branches and runs
├── main/                        # Main branch reports
│   ├── 1234567-abc1234/        # Run ID + Short SHA
│   │   └── index.html          # Allure report
│   └── 1234568-def5678/
├── feature-auth/                # Feature branch reports
│   ├── 1234569-ghi9012/
│   └── 1234570-jkl3456/
└── hotfix-bug/                  # Hotfix branch reports
    └── 1234571-mno7890/
```

## Accessing Reports

### Main Dashboard
- **URL**: `https://communitystream-io.github.io/flock/`
- **Shows**: All branches, latest runs, statistics
- **Features**: Search, filter, and navigate to specific reports

### Branch-Specific Reports
- **URL**: `https://communitystream-io.github.io/flock/{branch-name}/`
- **Shows**: All runs for a specific branch
- **Example**: `https://communitystream-io.github.io/flock/main/`

### Specific Run Reports
- **URL**: `https://communitystream-io.github.io/flock/{branch-name}/{run-id}-{sha}/`
- **Shows**: Full Allure report for that specific run
- **Example**: `https://communitystream-io.github.io/flock/main/1234567-abc1234/`

## Script Usage

The Allure reporting system uses a Node.js script (`scripts/generate-allure-index.js`) to generate the navigation structure and maintain historical data.

### Command Line Usage

```bash
# Basic usage (uses environment variables)
node scripts/generate-allure-index.js

# With explicit parameters
node scripts/generate-allure-index.js \
  --branch main \
  --run-id 1234567 \
  --sha abc1234 \
  --report-dir ./allure-report \
  --output-dir ./reports
```

### Parameters

| Parameter | Description | Default | Environment Variable |
|-----------|-------------|---------|---------------------|
| `--branch` | Branch name | Auto-detected | `GITHUB_HEAD_REF` or `GITHUB_REF` |
| `--run-id` | CI run ID | Current timestamp | `GITHUB_RUN_ID` |
| `--sha` | Commit SHA (short) | Auto-detected | `GITHUB_SHA` |
| `--report-dir` | Source Allure report directory | `./allure-report` | - |
| `--output-dir` | Output directory for reports | `./reports` | - |

## Local Development

### Generating Reports Locally

1. **Run your tests** and generate Allure reports:
   ```bash
   npm run test:e2e:headless
   # or
   allure generate allure-results/ --clean -o allure-report/
   ```

2. **Generate the index**:
   ```bash
   node scripts/generate-allure-index.js \
     --branch feature-my-feature \
     --run-id local-$(date +%s) \
     --sha $(git rev-parse --short HEAD) \
     --report-dir ./allure-report \
     --output-dir ./reports
   ```

3. **View locally**:
   ```bash
   # Serve the reports directory
   npx serve ./reports
   # or
   python -m http.server 8000 --directory ./reports
   ```

## CI/CD Integration

The reporting system is fully integrated into the GitHub Actions CI pipeline and automatically publishes reports to GitHub Pages.

## Troubleshooting

### Common Issues

1. **Reports not updating**: Check GitHub Pages is enabled and CI workflow is running
2. **Missing branches**: Ensure `branches.json` is being preserved
3. **Local generation fails**: Check Node.js installation and file paths

### Debug Mode

```bash
DEBUG=true node scripts/generate-allure-index.js
```