# E2E Test Sharding

This document describes the test sharding implementation for the Flock project, which enables parallel execution of end-to-end tests to significantly reduce test execution time.

## Overview

Test sharding divides your test suite into multiple smaller chunks (shards) that can run in parallel, either on the same machine or across multiple machines. This approach can reduce test execution time from minutes to seconds.

## Benefits

- **Faster Execution**: Tests run in parallel, reducing total execution time by up to 75%
- **Better Resource Utilization**: Multiple CPU cores and browser instances
- **Improved CI/CD**: Faster feedback loops in continuous integration
- **Scalability**: Easy to add more shards as test suite grows
- **Isolation**: Each shard runs independently with isolated browser data

## Architecture

### Files Structure

```
├── wdio.shard.conf.ts          # Base shard configuration
├── wdio.shard.dynamic.conf.ts  # Dynamic shard configuration
├── scripts/shard-tests.js      # Sharding utility script
└── shard-results/              # Generated shard information
    ├── shard-1.json
    ├── shard-2.json
    └── ...
```

### Sharding Strategies

#### 1. Domain-Based Sharding (Default)
Groups tests by feature domain (auth, config, upload, etc.) to maintain logical test grouping:

- **Shard 1**: Auth features (5 files)
- **Shard 2**: Config features (7 files) 
- **Shard 3**: Upload features (4 files)
- **Shard 4**: Layout + Navigation + Landing (3 files)

#### 2. Round-Robin Sharding
Distributes files evenly across shards regardless of domain.

## Usage

### Quick Start

1. **Create shard configurations:**
   ```bash
   npm run test:e2e:shard:create
   ```

2. **Run all shards sequentially:**
   ```bash
   npm run test:e2e:sharded
   ```

3. **Run all shards in parallel:**
   ```bash
   npm run test:e2e:sharded:parallel
   ```

4. **Run individual shard:**
   ```bash
   npm run test:e2e:shard:1
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `test:e2e:shard:create` | Create shard configuration files |
| `test:e2e:shard:1-4` | Run individual shards |
| `test:e2e:sharded` | Run all shards sequentially |
| `test:e2e:sharded:parallel` | Run all shards in parallel |
| `test:e2e:sharded:ci` | CI version (sequential) |
| `test:e2e:sharded:ci:parallel` | CI version (parallel) |

### Advanced Usage

#### Custom Shard Count

```bash
# Create 6 shards instead of default 4
node scripts/shard-tests.js create 6

# Run specific shard
node scripts/shard-tests.js run 0 6 --headless

# Run all 6 shards in parallel
node scripts/shard-tests.js run-all 6 --headless --ci
```

#### Debug Mode

```bash
# Run shard with debug logging
cross-env SHARD_INDEX=0 SHARD_TOTAL=4 HEADLESS=true DEBUG_TESTS=true wdio run wdio.shard.dynamic.conf.ts
```

#### CI Integration

```bash
# For GitHub Actions or similar CI systems
npm run test:e2e:sharded:ci:parallel
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SHARD_INDEX` | Current shard index (0-based) | 0 |
| `SHARD_TOTAL` | Total number of shards | 1 |
| `HEADLESS` | Run in headless mode | false |
| `DEBUG_TESTS` | Enable debug logging | false |
| `CI` | CI mode (longer timeouts) | false |

### Shard Configuration

Each shard gets its own configuration with:

- **Isolated browser data**: `--user-data-dir=/tmp/chrome-shard-{index}`
- **Distributed instances**: Max instances divided by shard count
- **Shard-specific reporting**: Allure results in separate directories
- **Optimized timeouts**: Adjusted for parallel execution

## Performance Comparison

### Before Sharding
- **Total Time**: ~8-12 minutes
- **Browser Instances**: 1-2
- **CPU Usage**: ~25%

### After Sharding (4 shards)
- **Total Time**: ~2-3 minutes
- **Browser Instances**: 4-8
- **CPU Usage**: ~80-90%
- **Speed Improvement**: 3-4x faster

## Best Practices

### 1. Shard Distribution
- Use domain-based sharding for logical grouping
- Ensure balanced file distribution across shards
- Monitor shard execution times and rebalance if needed

### 2. Resource Management
- Don't exceed available CPU cores
- Monitor memory usage with multiple browser instances
- Use headless mode for CI environments

### 3. Test Isolation
- Ensure tests don't depend on each other
- Use unique test data per shard
- Clean up after each test

### 4. CI/CD Integration
- Use parallel execution in CI
- Set appropriate timeouts for CI environments
- Consider using matrix builds for maximum parallelism

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Error: Port 4200 already in use
# Solution: Ensure only one Angular dev server is running
```

#### 2. Browser Data Conflicts
```bash
# Error: Chrome user data directory locked
# Solution: Each shard uses isolated user data directories
```

#### 3. Memory Issues
```bash
# Error: Out of memory
# Solution: Reduce maxInstances or add more RAM
```

#### 4. Test Dependencies
```bash
# Error: Tests failing due to shared state
# Solution: Ensure proper test isolation and cleanup
```

### Debug Commands

```bash
# Check shard distribution
node scripts/shard-tests.js create 4 domain-based

# Run single shard with debug
npm run test:e2e:shard:1 DEBUG_TESTS=true

# Check shard info files
cat shard-results/shard-1.json
```

## Monitoring and Reporting

### Allure Reports
Each shard generates its own Allure report:
- `allure-results/shard-1/`
- `allure-results/shard-2/`
- `allure-results/shard-3/`
- `allure-results/shard-4/`

### Console Output
Shard information is displayed in console:
```
🚀 Starting shard 1/4
📁 Running 5 files in shard 1
📋 Files: auth.feature, auth-help-dialog.feature, ...
✅ Shard 1 configuration ready
```

## Future Enhancements

1. **Dynamic Shard Balancing**: Automatically adjust shard distribution based on test execution times
2. **Cross-Machine Sharding**: Distribute shards across multiple CI machines
3. **Smart Test Ordering**: Order tests by execution time for optimal shard balance
4. **Real-time Monitoring**: Live dashboard showing shard progress
5. **Automatic Retry**: Retry failed shards automatically

## Migration Guide

### From Single Test Run
1. Run `npm run test:e2e:shard:create` to generate shard configs
2. Replace `npm run test:e2e` with `npm run test:e2e:sharded:parallel`
3. Update CI scripts to use sharded execution
4. Monitor performance and adjust shard count as needed

### Adding New Tests
1. Add new feature files to appropriate domain directories
2. Run `npm run test:e2e:shard:create` to regenerate shard configs
3. Verify new tests are distributed correctly across shards

## Support

For issues or questions about test sharding:
1. Check the troubleshooting section above
2. Review console output for shard-specific errors
3. Examine shard configuration files in `shard-results/`
4. Consider reducing shard count if experiencing resource issues
