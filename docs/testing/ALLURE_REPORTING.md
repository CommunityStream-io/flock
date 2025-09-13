# Allure Reporting System

## Overview

The Flock project uses the official Allure GitHub Action (`simple-elf/allure-report-action`) to automatically generate and publish test reports for every CI run. This provides a standardized, reliable approach to Allure reporting with built-in history preservation and GitHub Pages integration.

## Features

- 📊 **Historical Tracking**: Complete test history with trend analysis
- 🌐 **GitHub Pages Integration**: Automatic publishing to GitHub Pages
- 📱 **Mobile-Friendly**: Responsive design for all devices
- 🔍 **Easy Navigation**: Clean, intuitive interface
- ⚡ **Official Support**: Uses the official Allure GitHub Action
- 🔄 **Automatic Updates**: Reports update automatically on every CI run

## Report Structure

The official Allure GitHub Action creates a standardized report structure:

```
https://communitystream-io.github.io/flock/
├── index.html                    # Main Allure dashboard
├── data/                        # Test execution data
├── widgets/                     # Report widgets and components
├── history/                     # Historical test data
└── static/                      # Static assets (CSS, JS, images)
```

The action automatically:
- **Preserves History**: Maintains test execution history across runs
- **Generates Trends**: Shows test trends and statistics over time
- **Creates Navigation**: Provides intuitive navigation between reports
- **Handles Updates**: Automatically updates reports on each CI run

## Accessing Reports

### Main Dashboard
- **URL**: `https://communitystream-io.github.io/flock/`
- **Shows**: Latest test results with historical trends
- **Features**: 
  - Test execution overview
  - Historical trends and statistics
  - Detailed test case information
  - Failure analysis and screenshots

### Report Features
- **Test History**: View test results over time
- **Trend Analysis**: See test stability and performance trends
- **Failure Details**: Detailed failure information with screenshots
- **Test Categories**: Organized by test suites and features
- **Search & Filter**: Find specific tests or failures quickly

## Local Development

### Generating Reports Locally

1. **Run your tests** and generate Allure reports:
   ```bash
   npm run test:e2e:headless
   # or
   allure generate allure-results/ --clean -o allure-report/
   ```

2. **View locally**:
   ```bash
   # Serve the reports directory
   npx serve ./allure-report
   # or
   python -m http.server 8000 --directory ./allure-report
   ```

### Local Allure Commands

```bash
# Generate report from results
npm run allure:generate

# Open report in browser
npm run allure:open

# Serve report with live updates
npm run allure:serve
```

## CI/CD Integration

The reporting system uses the official `simple-elf/allure-report-action` in the GitHub Actions CI pipeline:

### Workflow Configuration

```yaml
deploy-allure:
  name: Deploy Allure Report to GitHub Pages
  runs-on: ubuntu-latest
  needs: e2e-report
  if: always()
  permissions:
    contents: write
    pages: write
    id-token: write
  steps:
    - name: Checkout GitHub Pages branch
      uses: actions/checkout@v4
      with:
        ref: gh-pages
        path: gh-pages
        fetch-depth: 0

    - name: Download combined Allure results
      uses: actions/download-artifact@v4
      with:
        name: allure-results-combined
        path: allure-results/

    - name: Generate Allure Report with history
      uses: simple-elf/allure-report-action@v1.4.5
      with:
        allure_results: allure-results
        gh_pages: gh-pages
        allure_report: allure-report
        allure_history: allure-history

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_branch: gh-pages
        publish_dir: allure-history
```

### Key Benefits

- **Official Support**: Uses the official Allure GitHub Action
- **Automatic History**: Preserves test history across runs
- **Standardized**: Follows Allure best practices
- **Reliable**: Well-maintained and widely used action
- **Zero Configuration**: Works out of the box

## Troubleshooting

### Common Issues

1. **Reports not updating**: Check GitHub Pages is enabled and CI workflow is running
2. **Missing branches**: Ensure `branches.json` is being preserved
3. **Local generation fails**: Check Node.js installation and file paths

### Debug Mode

```bash
DEBUG=true node scripts/generate-allure-index.js
```