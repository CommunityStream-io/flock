# Docker Performance Monitoring Guide

## Overview

This guide covers the Docker performance monitoring system integrated with your CI/CD pipeline. The system provides comprehensive monitoring of Docker build performance, CI workflow status, and automated performance testing.

## 🚀 Quick Start

### Basic Docker Performance Testing
```bash
# Run a single performance test
npm run docker:test

# Record baseline metrics
npm run docker:baseline

# Compare current build with baseline
npm run docker:compare

# Monitor continuously
npm run docker:monitor
```

### CI Monitoring with Docker Integration
```bash
# Monitor CI without Docker performance
npm run ci:monitor

# Monitor CI with Docker performance
npm run ci:monitor:docker

# Full monitoring with telemetry and Docker
npm run ci:monitor:full
```

## 📊 Monitoring Scripts

### 1. Docker Performance Monitoring (`monitor-docker-performance.sh`)

**Purpose**: Monitors Docker build performance and provides detailed metrics.

**Features**:
- Build time measurement for each stage
- Image size analysis
- Cache efficiency testing
- Performance target validation
- Baseline comparison
- Continuous monitoring mode

**Usage**:
```bash
# Single performance test
./scripts/monitor-docker-performance.sh

# Record baseline metrics
./scripts/monitor-docker-performance.sh --baseline

# Compare with baseline
./scripts/monitor-docker-performance.sh --compare

# Continuous monitoring
./scripts/monitor-docker-performance.sh --continuous

# Set custom threshold
./scripts/monitor-docker-performance.sh --threshold 120
```

**Output**:
- Performance metrics in JSON format
- Markdown reports
- Console output with colored status
- Performance target validation

### 2. Enhanced CI Monitoring (`monitor-ci-with-docker.sh`)

**Purpose**: Monitors GitHub Actions workflows with integrated Docker performance testing.

**Features**:
- GitHub Actions workflow monitoring
- Docker performance testing during CI
- Artifact downloading and analysis
- Combined reporting
- Configurable thresholds

**Usage**:
```bash
# Basic CI monitoring
./scripts/monitor-ci-with-docker.sh

# Enable telemetry analysis
./scripts/monitor-ci-with-docker.sh --enable-telemetry

# Disable Docker monitoring
./scripts/monitor-ci-with-docker.sh --skip-docker

# Set Docker threshold
./scripts/monitor-ci-with-docker.sh --docker-threshold 120

# Fail fast on Docker build failure
./scripts/monitor-ci-with-docker.sh --fail-fast
```

### 3. Original CI Monitoring (`monitor-ci-timeouts.sh`)

**Purpose**: Original CI timeout monitoring (unchanged functionality).

**Usage**:
```bash
# Original CI monitoring
./scripts/monitor-ci-timeouts.sh

# With telemetry
./scripts/monitor-ci-timeouts.sh --enable-telemetry
```

## 📈 Performance Metrics

### Docker Build Metrics
- **Base Build Time**: Time to build base image (Chrome + ChromeDriver)
- **Runtime Build Time**: Time to build runtime image (Angular app + E2E tests)
- **Total Build Time**: Combined build time
- **Cached Build Time**: Time for cached rebuild
- **Cache Efficiency**: Percentage of time saved by caching
- **Image Sizes**: Base and runtime image sizes in MB

### Performance Targets
- **Build Time**: <90 seconds (configurable)
- **Cache Efficiency**: >80%
- **Image Size**: 30-40% reduction from baseline

### CI Workflow Metrics
- **Workflow Status**: Success, failure, in progress, queued
- **Job Status**: Individual job success/failure
- **Artifact Analysis**: Downloaded artifacts and telemetry data
- **Docker Integration**: Docker performance during CI builds

## 📁 Output Files

### Performance Data
```
logs/docker-performance/
├── test-YYYYMMDD_HHMMSS.json    # Individual test results
├── current-metrics.json         # Latest test results
├── baseline-metrics.json        # Baseline performance
└── performance-report-*.md      # Generated reports
```

### CI Artifacts
```
logs/ci-artifacts/
├── job-{job_id}/                # Job-specific artifacts
│   ├── timeout-telemetry-*.json
│   └── test-metrics-*.json
└── ci-docker-report-*.md        # Combined reports
```

## 🔧 Configuration

### Environment Variables
- `DOCKER_THRESHOLD`: Build time threshold in seconds (default: 90)
- `POLL_INTERVAL`: CI monitoring poll interval (default: 15s)
- `MAX_WAIT_TIME`: Maximum monitoring time (default: 1800s)

### Script Options
- `--baseline`: Record baseline metrics
- `--compare`: Compare with baseline
- `--continuous`: Continuous monitoring mode
- `--threshold N`: Set performance threshold
- `--skip-docker`: Disable Docker monitoring
- `--enable-docker`: Enable Docker monitoring
- `--skip-telemetry`: Skip telemetry analysis
- `--enable-telemetry`: Enable telemetry analysis
- `--fail-fast`: Exit on Docker build failure

## 📊 Monitoring Workflows

### 1. Development Workflow
```bash
# Record baseline after optimization
npm run docker:baseline

# Test performance changes
npm run docker:test

# Compare with baseline
npm run docker:compare
```

### 2. CI/CD Workflow
```bash
# Monitor CI with Docker performance
npm run ci:monitor:docker

# Full monitoring with all features
npm run ci:monitor:full
```

### 3. Continuous Monitoring
```bash
# Run continuous Docker monitoring
npm run docker:monitor

# Monitor CI continuously
npm run ci:monitor:docker
```

## 🚨 Alerts and Notifications

### Performance Alerts
- Build time exceeds threshold
- Cache efficiency below target
- Image size regression
- Docker build failures

### CI Alerts
- Workflow failures
- Job failures
- Docker build failures (if fail-fast enabled)
- Performance regressions

## 📈 Reporting

### Individual Test Reports
- Console output with colored status
- JSON metrics files
- Markdown performance reports

### Combined Reports
- CI and Docker performance integration
- Trend analysis
- Performance recommendations
- Artifact summaries

## 🔍 Troubleshooting

### Common Issues

1. **Docker not available**
   - Check Docker Desktop is running
   - Verify Docker daemon status
   - Check Docker CLI installation

2. **GitHub CLI not authenticated**
   - Run `gh auth login`
   - Check GitHub CLI installation

3. **Performance test failures**
   - Check Dockerfile syntax
   - Verify build context
   - Check available disk space

4. **CI monitoring issues**
   - Verify workflow name
   - Check GitHub repository access
   - Verify authentication

### Debug Commands
```bash
# Check Docker status
docker info

# Check GitHub CLI status
gh auth status

# Test Docker build manually
docker build -f Dockerfile.test --target base -t test .

# Check script permissions
ls -la scripts/monitor-*.sh
```

## 📚 Integration with Existing Tools

### GitHub Actions
- Monitors "Feathering the Nest" workflow
- Downloads artifacts from failed jobs
- Integrates with existing CI pipeline

### Allure Reporting
- Compatible with existing Allure setup
- Downloads timeout telemetry artifacts
- Integrates with test analysis tools

### Performance Analysis
- Works with existing metrics analysis
- Integrates with timeout analysis
- Compatible with CI optimization tools

## 🎯 Best Practices

### Performance Monitoring
1. **Record baselines** after major changes
2. **Monitor continuously** during development
3. **Set appropriate thresholds** for your environment
4. **Track trends** over time
5. **Alert on regressions** immediately

### CI Integration
1. **Use fail-fast** for critical builds
2. **Enable telemetry** for detailed analysis
3. **Monitor Docker performance** during CI
4. **Download artifacts** for failed builds
5. **Generate reports** for stakeholders

### Maintenance
1. **Update thresholds** as performance improves
2. **Clean up old reports** regularly
3. **Monitor disk space** for logs and artifacts
4. **Update scripts** with new features
5. **Document changes** and improvements

## 🔄 Future Enhancements

### Planned Features
- Multi-architecture build monitoring
- Registry-based layer caching analysis
- Performance trend visualization
- Automated performance regression detection
- Integration with more CI/CD platforms

### Monitoring Improvements
- Real-time performance dashboards
- Historical performance tracking
- Automated alerting and notifications
- Performance optimization recommendations
- Integration with monitoring platforms

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review script help: `./scripts/monitor-*.sh --help`
3. Check logs in `logs/docker-performance/` and `logs/ci-artifacts/`
4. Review generated reports for detailed information

The monitoring system is designed to be robust and provide comprehensive insights into both Docker build performance and CI workflow status, helping you maintain optimal performance and quickly identify issues.
