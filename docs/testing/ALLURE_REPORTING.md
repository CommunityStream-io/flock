# Allure Reporting System

## Overview

The Flock project uses the official Allure GitHub Action (`simple-elf/allure-report-action`) to automatically generate and publish test reports for every CI run. This provides a standardized, reliable approach to Allure reporting with built-in history preservation and GitHub Pages integration.

The system now includes **native deduplication**, **performance tracking**, and **optimized sharded execution** to handle large test suites efficiently.

## Features

- 📊 **Historical Tracking**: Complete test history with trend analysis
- 🌐 **GitHub Pages Integration**: Automatic publishing to GitHub Pages
- 📱 **Mobile-Friendly**: Responsive design for all devices
- 🔍 **Easy Navigation**: Clean, intuitive interface
- ⚡ **Official Support**: Uses the official Allure GitHub Action
- 🔄 **Automatic Updates**: Reports update automatically on every CI run
- 🚀 **Native Deduplication**: Prevents duplicate test results across shards using AllureId
- ⚡ **Performance Tracking**: Detailed timing analysis with and without Allure
- 🏷️ **Smart Labeling**: Automatic feature, story, and environment tagging
- 🎯 **Optimized Sharding**: Single directory approach for efficient result aggregation

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

## Sharded Test Execution

### Local Sharded Testing

The project includes an advanced sharded test execution system that mimics the CI pipeline locally:

```bash
# Run all 19 shards in parallel with Allure reporting
./run-sharded-tests.sh --serve-allure --track-performance

# Run without Allure for faster execution
./run-sharded-tests.sh --skip-allure --track-performance

# Run with performance tracking only
./run-sharded-tests.sh --track-performance
```

### Performance Comparison

The system tracks performance differences between Allure-enabled and disabled runs:

- **Without Allure**: ~184 seconds (3 minutes 4 seconds)
- **With Allure**: ~1,380 seconds (23 minutes)
- **Allure Overhead**: ~86.7% slower (but provides comprehensive reporting)

### Native Deduplication

The system uses Allure's native deduplication features:

- **AllureId Generation**: Unique identifiers based on feature + scenario names
- **Automatic Labeling**: Feature, story, suite, and environment tags
- **Duplicate Prevention**: Same tests across shards are merged by Allure

## Local Development

### Generating Reports Locally

1. **Run your tests** and generate Allure reports:
   ```bash
   # Using the sharded script (recommended)
   ./run-sharded-tests.sh --serve-allure
   
   # Traditional approach
   npm run test:e2e:headless
   allure generate allure-results/ --clean -o allure-report/
   ```

2. **View locally**:
   ```bash
   # The script automatically serves the report
   # Or manually serve the reports directory
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

## Technical Implementation

### Allure Deduplication System

The system implements native Allure deduplication in `features/step-definitions/steps.ts`:

```typescript
/**
 * Generate a consistent AllureId for test deduplication
 * This prevents duplicate test results across shards
 */
function generateAllureId(scenarioTitle: string, featurePath: string): string {
    const featureName = featurePath.split('/').pop()?.replace('.feature', '') || 'unknown';
    const scenarioHash = scenarioTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    return `${featureName}-${scenarioHash}`;
}

/**
 * Set AllureId and labels for current test
 */
Before(async function(scenario) {
    const allureId = generateAllureId(scenario.pickle.name, scenario.pickle.uri);
    const featureName = scenario.pickle.uri.split('/').pop()?.replace('.feature', '') || 'unknown';
    
    if (global.allure) {
        global.allure.id = allureId;
        global.allure.label('feature', featureName);
        global.allure.label('story', scenario.pickle.name);
        global.allure.label('suite', 'E2E Tests');
        
        // Add environment labels
        if (process.env.CI === 'true') {
            global.allure.label('tag', 'ci');
        } else {
            global.allure.label('tag', 'local');
        }
    }
});
```

### Single Directory Architecture

The system uses a simplified single-directory approach:

- **All Shards Write To**: `allure-results/` (single directory)
- **No Aggregation Needed**: Direct result collection
- **Automatic Deduplication**: Allure handles duplicate test merging
- **Performance Optimized**: Eliminates file copying overhead

### Performance Tracking

The `run-sharded-tests.sh` script includes comprehensive performance tracking:

- **Execution Timing**: Start/end times for each shard
- **File Generation**: Count of Allure files per shard
- **Baseline Comparison**: With/without Allure performance metrics
- **Detailed Logging**: Performance data saved to `logs/performance.log`

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
4. **Duplicate test results**: Ensure AllureId generation is working in step definitions
5. **Performance issues**: Use `--skip-allure` flag for faster test execution
6. **Shard failures**: Check individual shard logs in `logs/shards/` directory

### Debug Mode

```bash
# Enable debug mode for script execution
DEBUG=true ./run-sharded-tests.sh --track-performance

# Check performance logs
cat logs/performance.log

# Check individual shard logs
ls logs/shards/
tail -f logs/shards/shard-1.log
```

### Performance Optimization

For faster test execution during development:

```bash
# Run without Allure for maximum speed
./run-sharded-tests.sh --skip-allure

# Run with performance tracking to measure impact
./run-sharded-tests.sh --skip-allure --track-performance

# Run with Allure only when needed for reporting
./run-sharded-tests.sh --serve-allure --track-performance
```

### Allure Deduplication Verification

To verify deduplication is working:

1. **Check AllureId generation**:
   ```bash
   # Look for AllureId in test results
   grep -r "allureId" allure-results/
   ```

2. **Compare file counts**:
   ```bash
   # Count result files (should be reasonable, not 3000+)
   ls allure-results/*.json | wc -l
   ```

3. **Check report organization**:
   ```bash
   # Open report and verify tests are properly organized
   allure open allure-report-combined --port 8080
   ```