# Test Metrics and Telemetry Collection

This document describes the comprehensive test metrics and telemetry collection system implemented for WebdriverIO tests. This system helps identify performance issues, browser problems, and test reliability patterns.

## Overview

The metrics collection system automatically tracks:

- **Test Execution Metrics**: Duration, status, browser info
- **Performance Metrics**: Page load times, navigation performance, memory usage
- **Error Tracking**: Categorized error types with detailed context
- **Resource Metrics**: Network requests, response times, data transfer
- **Interaction Metrics**: Clicks, inputs, waits, and their performance

## Architecture

### Core Components

1. **TestMetricsCollector** (`features/support/test-metrics.ts`)
   - Central metrics collection and storage
   - Error categorization and tracking
   - Performance data aggregation

2. **PerformanceMonitor** (`features/support/performance-monitor.ts`)
   - Wraps WebdriverIO operations with performance monitoring
   - Collects timing data for operations
   - Monitors browser performance metrics

3. **WebdriverIO Hooks** (`features/support/webdriverio-hooks.ts`)
   - Integrates metrics collection with test lifecycle
   - Automatic data collection during test execution
   - Structured logging with Pino

4. **Metrics Analyzer** (`scripts/analyze-test-metrics.js`)
   - Analyzes collected metrics
   - Generates performance insights
   - Provides actionable recommendations

## Usage

### Automatic Collection

Metrics are collected automatically when running tests. No additional configuration is required.

```bash
# Run tests with metrics collection
npm run test:e2e:headless

# Run specific test with metrics
npm run test:e2e:debug
```

### Analyzing Metrics

After running tests, analyze the collected metrics:

```bash
# Analyze the most recent metrics file
npm run analyze:metrics:latest

# Analyze a specific metrics file
npm run analyze:metrics test-metrics-2024-01-15T10-30-00-000Z.json
```

### Manual Metrics Collection

You can also collect metrics programmatically in your tests. See the API methods in:
- `features/support/test-metrics.ts` - `TestMetricsCollector` class methods
- `features/support/performance-monitor.ts` - `PerformanceMonitor` class methods

## Metrics Data Structure

### TestMetrics Interface

See the complete interface definition in `features/support/test-metrics.ts` - `TestMetrics` interface (lines 4-97).

## Logging Integration

The system uses Pino for structured logging with the following log types:

- `metrics-start`: Test metrics collection started
- `metrics-complete`: Test metrics collection completed
- `performance-monitoring-start/stop`: Performance monitoring lifecycle
- `test-start/test-complete`: Test execution lifecycle
- `scenario-start/scenario-complete`: Cucumber scenario lifecycle
- `performance-slowest-tests`: Analysis of slowest tests
- `performance-error-patterns`: Error pattern analysis

### Log Levels

- **Info**: Normal operation, test lifecycle events
- **Warn**: Non-critical issues (failed metric collection)
- **Error**: Critical issues, test failures
- **Debug**: Detailed operation logging (when `DEBUG_TESTS=true`)

## Performance Insights

The system automatically analyzes collected metrics and provides insights:

### Slowest Tests
Identifies tests with the longest execution times and provides recommendations for optimization.

### Error Pattern Analysis
Categorizes errors and identifies patterns:
- **Timeout Errors**: High rate suggests timeout configuration issues
- **Element Not Found**: Indicates selector reliability problems
- **Navigation Errors**: Points to page load or routing issues
- **Script Errors**: JavaScript execution problems
- **Network Errors**: Connectivity or server issues

### Memory Usage Analysis
Tracks JavaScript heap usage and identifies potential memory leaks.

### Browser Performance
Compares performance across different browsers and versions.

## Configuration

### Environment Variables

- `DEBUG_TESTS=true`: Enables detailed BDD logging
- `CI=true`: Uses CI-optimized timeout configurations
- `HEADLESS=true`: Enables headless mode logging
- `SHARDED_TESTS=true`: Reduces log verbosity for sharded execution

### Timeout Configuration

Timeouts are centrally managed in `features/support/timeout-config.ts`. See the `getTimeoutConfig()` function for CI vs local timeout configurations.

## Troubleshooting

### Common Issues

1. **High Timeout Error Rate**
   - Increase timeout values in `timeout-config.ts`
   - Optimize wait strategies using `waitUntil`
   - Review network conditions

2. **Element Not Found Errors**
   - Improve element selectors
   - Add better wait strategies for dynamic content
   - Use more specific selectors

3. **Navigation Errors**
   - Implement retry mechanisms
   - Add better page load verification
   - Review application stability

4. **Memory Issues**
   - Investigate potential memory leaks
   - Optimize test data cleanup
   - Review browser resource usage

### Debug Mode

Enable detailed logging for debugging:

```bash
DEBUG_TESTS=true npm run test:e2e:debug
```

This will show:
- Detailed BDD step logging
- Performance monitoring details
- Error context and stack traces
- Metrics collection progress

## Integration with CI/CD

The metrics system integrates seamlessly with your CI/CD pipeline:

1. **Automatic Collection**: Metrics are collected during CI test runs
2. **Artifact Generation**: Metrics files are generated as test artifacts
3. **Structured Logging**: All logs are structured for easy parsing
4. **Performance Insights**: Automatic analysis provides actionable recommendations

### CI Configuration

The system automatically detects CI environment and:
- Uses more generous timeouts
- Enables performance monitoring
- Generates detailed metrics
- Provides structured logging for CI systems

## Best Practices

1. **Regular Analysis**: Run metrics analysis after each test suite
2. **Trend Monitoring**: Track metrics over time to identify regressions
3. **Error Investigation**: Investigate high error rates promptly
4. **Performance Optimization**: Use insights to optimize slow tests
5. **Environment Monitoring**: Compare metrics across different environments

## Future Enhancements

Planned improvements include:

- **Real-time Dashboard**: Web-based metrics visualization
- **Alerting**: Automated alerts for performance regressions
- **Historical Analysis**: Long-term trend analysis
- **Integration**: Integration with monitoring tools (DataDog, New Relic)
- **Custom Metrics**: Support for application-specific metrics

## Examples

### Basic Usage

```bash
# Run tests with full metrics collection
npm run test:e2e:headless

# Analyze results
npm run analyze:metrics:latest
```

### Advanced Usage

For custom test implementations with detailed metrics, see the example patterns in:
- `features/support/webdriverio-hooks.ts` - Integration examples
- `features/support/test-metrics.ts` - API usage patterns
- `features/support/performance-monitor.ts` - Monitoring examples

This comprehensive metrics and telemetry system provides deep insights into your test performance, helping you identify and resolve issues quickly while maintaining test reliability.
