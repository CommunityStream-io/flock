# Codecov Integration

This document explains how Codecov is integrated into the CI/CD pipeline for the Bluesky Social Migrator project.

## Overview

Codecov provides code coverage reporting and analysis for the webui Angular application. It automatically tracks coverage metrics, generates reports, and provides insights into code quality.

## Configuration Files

### 1. CI Workflow (`.github/workflows/ci.yml`)

The CI pipeline now includes:
- **Test Coverage Generation**: Runs tests with coverage enabled
- **Codecov Upload**: Automatically uploads coverage reports to Codecov
- **Coverage Flags**: Uses `webui` flag to identify the specific project

### 2. Karma Configuration (`webui/karma.conf.js`)

Updated to include LCOV format output:
```javascript
coverageReporter: {
  dir: './coverage/webui',
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' },
    { type: 'lcov' }  // Required for Codecov
  ]
}
```

### 3. Codecov Configuration (`webui/.codecov.yml`)

Customizes coverage behavior:
- **Coverage Targets**: 80% minimum coverage
- **Thresholds**: 5% tolerance for coverage drops
- **Status Checks**: Requires CI to pass before reporting
- **Comment Layout**: Comprehensive PR coverage comments

### 4. Package Scripts (`webui/package.json`)

Added new script:
```bash
npm run test:coverage
```

This runs tests with coverage enabled and outputs reports to `coverage/webui/`.

## Usage

### Local Development

1. **Generate Coverage Report**:
   ```bash
   cd webui
   npm run test:coverage
   ```

2. **View HTML Report**:
   Open `coverage/webui/index.html` in your browser

3. **View Text Summary**:
   Check the terminal output for coverage summary

### CI/CD Pipeline

Coverage is automatically generated and uploaded on:
- Every push to `main` branch
- Every pull request

### Codecov Dashboard

Visit [Codecov](https://codecov.io) to:
- View coverage trends over time
- Analyze coverage by file/directory
- Set up coverage targets and alerts
- Configure team notifications

## Coverage Metrics

The integration tracks:
- **Line Coverage**: Percentage of code lines executed
- **Branch Coverage**: Percentage of conditional branches taken
- **Function Coverage**: Percentage of functions called
- **Statement Coverage**: Percentage of statements executed

## Best Practices

1. **Maintain Coverage**: Aim for 80%+ coverage
2. **Review Coverage**: Check coverage reports before merging PRs
3. **Coverage Comments**: Codecov automatically comments on PRs with coverage changes
4. **Thresholds**: Set appropriate coverage thresholds for your team

## Troubleshooting

### Common Issues

1. **Coverage Not Uploading**:
   - Check if CI tests are passing
   - Verify LCOV file is generated
   - Check Codecov action logs

2. **Low Coverage**:
   - Add more test cases
   - Review untested code paths
   - Use coverage reports to identify gaps

3. **Coverage Decreases**:
   - Review recent changes
   - Add tests for new code
   - Check if coverage thresholds are appropriate

### Getting Help

- [Codecov Documentation](https://docs.codecov.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Karma Coverage Documentation](https://karma-runner.github.io/latest/config/coverage-reporter.html)

## Next Steps

1. **Set up Codecov Account**: Connect your GitHub repository
2. **Configure Team Settings**: Set up notifications and access
3. **Review Coverage**: Analyze current coverage and identify areas for improvement
4. **Set Goals**: Establish coverage targets for your team
