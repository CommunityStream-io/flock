# E2E Sharded Test Runner Guide

## Overview

The `run-sharded-tests.sh` script has been updated to support the new tag hierarchy and multi-app architecture. It enables fast, parallel test execution with intelligent shard allocation.

## Quick Start

```bash
# Run smoke tests (fastest feedback, ~3 min with 2 shards)
./scripts/run-sharded-tests.sh --smoke

# Run core tests (~8 min with 3 shards)
./scripts/run-sharded-tests.sh --core

# Run config tests only
./scripts/run-sharded-tests.sh --config

# Run web platform tests with report
./scripts/run-sharded-tests.sh --web --serve-allure
```

## Tag-Based Execution

### Suite Level Tags

```bash
# Smoke tests - Critical path only (~3 min, 2 shards)
./scripts/run-sharded-tests.sh --smoke

# Core tests - Essential functionality (~8 min, 3 shards)
./scripts/run-sharded-tests.sh --core

# Full regression suite (~32 min, 4 shards)
./scripts/run-sharded-tests.sh --regression
```

### Feature-Based Tags

```bash
# Authentication tests only
./scripts/run-sharded-tests.sh --auth

# Upload tests only
./scripts/run-sharded-tests.sh --upload

# Configuration tests only
./scripts/run-sharded-tests.sh --config
```

### Platform-Based Tags

```bash
# Web platform tests (@web or @core)
./scripts/run-sharded-tests.sh --web

# Electron platform tests (@electron or @core)
./scripts/run-sharded-tests.sh --electron
```

### Custom Tag Expressions

```bash
# Auth validation tests
./scripts/run-sharded-tests.sh --tags '@auth and @validation'

# Config smoke tests
./scripts/run-sharded-tests.sh --tags '@config and @smoke'

# All parallel tests
./scripts/run-sharded-tests.sh --tags '@parallel'

# Everything except skipped tests
./scripts/run-sharded-tests.sh --tags 'not @skip'
```

## Performance Options

```bash
# Skip Allure reports for faster execution
./scripts/run-sharded-tests.sh --core --skip-allure

# Enable performance tracking
./scripts/run-sharded-tests.sh --core --track-performance

# Fail fast - stop on first failure
./scripts/run-sharded-tests.sh --core --fail-fast

# Auto-serve Allure report when complete
./scripts/run-sharded-tests.sh --core --serve-allure
```

## Combining Options

```bash
# Fast smoke test with no reports
./scripts/run-sharded-tests.sh --smoke --skip-allure --fail-fast

# Full regression with performance tracking and report
./scripts/run-sharded-tests.sh --regression --track-performance --serve-allure

# Web platform core tests with report
./scripts/run-sharded-tests.sh --web --core --serve-allure
```

## Shard Allocation

The script automatically adjusts shard count based on test scope:

| Tag Filter | Shards | Reason |
|------------|--------|--------|
| `@smoke` | 2 | Fast tests, minimal parallelization needed |
| `@core` | 3 | Balanced parallelization for core tests |
| `@regression` or all | 4 | Maximum parallelization for full suite |
| Other tags | 3 | Default balanced approach |

## Understanding the Output

```
=== SHARDED E2E TEST RUNNER ===
Starting sharded test execution...
🏷️  Tag filter: @smoke
🖥️  Platform: Auto-detect
Running 2 shards in parallel, each with its own server...

# ... test execution ...

=== SHARD EXECUTION SUMMARY ===
✅ Shard 1: PASSED (45s)
✅ Shard 2: PASSED (43s)

=== FINAL RESULTS ===
Passed: 2
Failed: 0
Total: 2
Total Duration: 88s
```

## Log Structure

After execution, check the organized logs:

```
logs/
├── servers/          # Angular dev server logs
│   ├── server-1.log
│   ├── server-1.pid
│   └── server-1.port
├── shards/           # Test execution logs
│   ├── shard-1.log
│   ├── shard-1.browser.log
│   └── shard-1.timing
└── exits/            # Exit codes
    └── shard-1.exit

allure-results/       # Combined Allure results
allure-report-combined/  # Final report
```

## Troubleshooting

### Port Conflicts

The script automatically finds available ports starting from 4201. If ports are occupied, it will increment until an available port is found.

### ChromeDriver Issues

The script pre-downloads ChromeDriver before starting shards to avoid rate limiting. If issues persist:

```bash
npm install chromedriver@latest --no-save
```

### Server Startup Failures

Check server logs if a shard fails to start:

```bash
cat logs/servers/server-1.log
```

### Test Failures

View detailed test execution logs:

```bash
# Main test log
cat logs/shards/shard-1.log

# Browser console logs
cat logs/shards/shard-1.browser.log

# Timing information
cat logs/shards/shard-1.timing
```

## CI/CD Integration

The script is designed for both local and CI environments:

```bash
# In GitHub Actions or other CI
export CI=true
export HEADLESS=true
./scripts/run-sharded-tests.sh --core --skip-allure
```

## Best Practices

1. **Use specific tags for development**: Run only what you're working on
   ```bash
   ./scripts/run-sharded-tests.sh --tags '@auth and @validation'
   ```

2. **Use smoke tests for quick feedback**: Before committing
   ```bash
   ./scripts/run-sharded-tests.sh --smoke --fail-fast
   ```

3. **Use core tests for PR validation**: Before merging
   ```bash
   ./scripts/run-sharded-tests.sh --core
   ```

4. **Use regression for releases**: Full suite before release
   ```bash
   ./scripts/run-sharded-tests.sh --regression --serve-allure
   ```

5. **Skip Allure for speed**: When you don't need reports
   ```bash
   ./scripts/run-sharded-tests.sh --core --skip-allure
   ```

## Tag Hierarchy Reference

```
Suite Level:    @smoke, @core, @regression, @integration
Platform:       @web, @electron
Feature:        @auth, @upload, @config
Execution:      @parallel, @serial
Special:        @accessibility, @performance, @ui, @edge-case
Status:         @wip, @skip, @flaky
```

## Examples for Common Scenarios

### Before Committing
```bash
# Quick smoke test to catch obvious issues
./scripts/run-sharded-tests.sh --smoke --fail-fast
```

### Before Creating PR
```bash
# Core tests to ensure essential functionality works
./scripts/run-sharded-tests.sh --core
```

### Testing Specific Feature
```bash
# If you modified authentication code
./scripts/run-sharded-tests.sh --auth --serve-allure
```

### Before Release
```bash
# Full regression with performance tracking
./scripts/run-sharded-tests.sh --regression --track-performance --serve-allure
```

### Debugging Failures
```bash
# Run specific tests with detailed logs
./scripts/run-sharded-tests.sh --tags '@auth and @validation' --fail-fast
```

## Help Command

For full list of options:

```bash
./scripts/run-sharded-tests.sh --help
```

