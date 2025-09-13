# Timeout Telemetry System

This document describes the comprehensive timeout telemetry system designed to diagnose intermittent timeout issues in sharded E2E tests.

## Overview

The timeout telemetry system provides detailed tracking and analysis of timeout patterns, helping identify root causes of intermittent test failures. It integrates seamlessly with your existing test metrics and performance monitoring.

## Features

- **Detailed Timeout Tracking**: Records every timeout event with comprehensive context
- **Pattern Analysis**: Identifies recurring timeout patterns and their causes
- **Resource Correlation**: Links timeouts to system resource usage
- **Shard Analysis**: Tracks timeout distribution across test shards
- **Environmental Factors**: Monitors browser, time, and system conditions
- **Actionable Insights**: Provides specific recommendations for fixing timeout issues

## Architecture

### Core Components

1. **TimeoutTelemetryCollector** (`features/support/timeout-telemetry.ts`)
   - Central timeout event collection and storage
   - Context gathering (browser, system, network)
   - Pattern analysis and recommendations

2. **Enhanced PerformanceMonitor** (`features/support/performance-monitor.ts`)
   - Integrates timeout telemetry with WebdriverIO operations
   - Monitors waitUntil, element interactions, and navigation
   - Records both successful operations and timeouts

3. **WebdriverIO Hooks Integration** (`features/support/webdriverio-hooks.ts`)
   - Automatic telemetry collection during test lifecycle
   - Export and analysis of timeout data
   - Integration with existing metrics system

4. **Timeout Analysis Script** (`scripts/analyze-timeout-telemetry.js`)
   - Analyzes collected timeout telemetry data
   - Generates comprehensive reports
   - Provides actionable recommendations

## Usage

### Automatic Collection

Timeout telemetry is automatically enabled when running sharded tests:

```bash
# Run sharded tests with timeout telemetry
./run-sharded-tests.sh

# Run with timeout analysis
./run-sharded-tests.sh --track-performance

# Skip timeout analysis if not needed
./run-sharded-tests.sh --skip-timeout-analysis
```

### Manual Analysis

After running tests, analyze the collected timeout data:

```bash
# Analyze all timeout telemetry files
npm run analyze:timeouts

# Analyze latest timeout data
npm run analyze:timeouts:latest
```

### Environment Variables

- `TIMEOUT_TELEMETRY=true`: Enables timeout telemetry collection
- `SHARDED_TESTS=true`: Reduces log verbosity for sharded execution
- `DEBUG_TESTS=true`: Enables detailed timeout logging

## Data Structure

### TimeoutEvent Interface

Each timeout event includes:

```typescript
interface TimeoutEvent {
  id: string;                    // Unique event identifier
  timestamp: number;             // When the timeout occurred
  operation: string;             // What operation timed out
  element?: string;              // Which element (if applicable)
  step?: string;                 // Which test step
  timeout: number;               // Configured timeout value
  actualDuration: number;        // How long it actually took
  timeoutType: 'waitUntil' | 'element' | 'navigation' | 'script' | 'custom';
  success: boolean;              // Whether it succeeded or timed out
  context: {
    shardId?: number;            // Which shard
    testName: string;            // Which test
    browserInfo: {               // Browser details
      name: string;
      version: string;
      platform: string;
    };
    systemResources: {           // System state
      memoryUsage: number;       // Memory usage in MB
      cpuUsage: number;          // CPU usage in seconds
      uptime: number;            // Process uptime
    };
    networkConditions?: {        // Network state
      online: boolean;
      connectionType?: string;
    };
  };
  retryAttempt?: number;         // If this was a retry
  previousTimeouts?: number;     // Timeouts in recent history
}
```

### TimeoutAnalysis Interface

Analysis results include:

```typescript
interface TimeoutAnalysis {
  totalTimeouts: number;         // Total timeout events
  timeoutRate: number;           // Overall timeout rate
  patterns: TimeoutPattern[];    // Identified patterns
  recommendations: string[];     // Actionable recommendations
  criticalIssues: Array<{        // Issues requiring attention
    type: string;
    description: string;
    frequency: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
  }>;
  environmentalFactors: {        // Environmental analysis
    shardDistribution: Record<number, number>;
    browserDistribution: Record<string, number>;
    timeDistribution: Record<number, number>;
  };
}
```

## Timeout Types Tracked

### 1. waitUntil Timeouts
- **Operation**: `waitUntil_<description>`
- **Common Causes**: Slow page loads, element visibility delays
- **Default Timeout**: 8 seconds (CI), 8 seconds (local)

### 2. Element Interaction Timeouts
- **Operation**: `<interaction>_<element>`
- **Common Causes**: Element not found, slow rendering
- **Default Timeout**: 5 seconds

### 3. Navigation Timeouts
- **Operation**: `navigation_<url>`
- **Common Causes**: Network issues, server delays
- **Default Timeout**: 15 seconds

### 4. Script Execution Timeouts
- **Operation**: `script_<description>`
- **Common Causes**: Complex JavaScript execution
- **Default Timeout**: 30 seconds

### 5. Custom Operation Timeouts
- **Operation**: `<custom_operation>`
- **Common Causes**: Application-specific delays
- **Default Timeout**: Variable

## Analysis Features

### Pattern Recognition

The system identifies:

- **High-frequency patterns**: Operations that timeout frequently
- **Time-based patterns**: Timeouts occurring at specific times
- **Resource correlation**: Timeouts linked to high memory/CPU usage
- **Cascading timeouts**: Multiple timeouts in sequence
- **Shard-specific issues**: Problems affecting specific test shards

### Critical Issue Detection

Automatically flags:

- **Cascading Timeouts**: Multiple timeouts in the same test
- **Shard Clusters**: High timeout rates in specific shards
- **Resource Contention**: Timeouts correlated with resource usage
- **Browser-Specific Issues**: Timeouts affecting specific browsers

### Recommendations

Provides specific guidance:

- **Timeout Configuration**: Suggests timeout adjustments
- **Wait Strategy Optimization**: Recommends better wait approaches
- **Resource Management**: Identifies memory/CPU issues
- **Retry Mechanisms**: Suggests retry strategies for flaky operations

## Integration with Existing Systems

### Test Metrics Integration

- Timeout events are included in standard test metrics
- Error categorization includes timeout-specific details
- Performance insights include timeout analysis

### Allure Reporting

- Timeout telemetry data is exported alongside test results
- Analysis reports are included in test summaries
- Critical issues are highlighted in reports

### CI/CD Integration

- Automatic collection during CI test runs
- Structured logging for CI systems
- Artifact generation for analysis

## Troubleshooting

### Common Issues

1. **No Telemetry Data**
   - Ensure `TIMEOUT_TELEMETRY=true` is set
   - Check that tests are running with performance monitoring enabled
   - Verify logs/metrics directory exists

2. **High Timeout Rates**
   - Review timeout configurations in `timeout-config.ts`
   - Check system resource usage
   - Investigate network conditions

3. **Shard-Specific Problems**
   - Check for resource contention between shards
   - Review port allocation and server startup
   - Analyze shard-specific logs

### Debug Mode

Enable detailed timeout logging:

```bash
DEBUG_TESTS=true ./run-sharded-tests.sh
```

This will show:
- Detailed timeout event logging
- Context information for each timeout
- Resource usage at timeout time
- Pattern analysis in real-time

## Best Practices

### 1. Regular Analysis
- Run timeout analysis after each test suite
- Track timeout trends over time
- Investigate new patterns promptly

### 2. Proactive Monitoring
- Set up alerts for high timeout rates
- Monitor resource usage during tests
- Track timeout patterns across environments

### 3. Configuration Management
- Use centralized timeout configuration
- Adjust timeouts based on analysis results
- Document timeout rationale

### 4. Test Optimization
- Implement retry mechanisms for flaky operations
- Optimize wait strategies based on patterns
- Consider test data and environment factors

## Examples

### Basic Usage

```bash
# Run tests with full timeout telemetry
./run-sharded-tests.sh --track-performance

# Analyze results
npm run analyze:timeouts
```

### Advanced Analysis

```bash
# Run with detailed logging
DEBUG_TESTS=true ./run-sharded-tests.sh

# Analyze specific patterns
npm run analyze:timeouts | grep "waitUntil"
```

### CI Integration

```yaml
# GitHub Actions example
- name: Run E2E Tests with Timeout Telemetry
  run: |
    export TIMEOUT_TELEMETRY=true
    ./run-sharded-tests.sh --track-performance
    
- name: Analyze Timeout Data
  run: npm run analyze:timeouts
```

## Future Enhancements

Planned improvements include:

- **Real-time Dashboard**: Web-based timeout monitoring
- **Predictive Analysis**: ML-based timeout prediction
- **Auto-remediation**: Automatic timeout configuration adjustment
- **Integration**: Enhanced CI/CD and monitoring tool integration
- **Custom Metrics**: Support for application-specific timeout tracking

## Support

For issues or questions about the timeout telemetry system:

1. Check the analysis reports for specific recommendations
2. Review the timeout patterns and critical issues
3. Examine the detailed logs in `logs/metrics/`
4. Consider the environmental factors and resource usage

The timeout telemetry system provides comprehensive insights into test reliability, helping you maintain stable and efficient test suites.
