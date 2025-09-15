# Allure E2E Test Badge

## Overview

The Flock project includes an automated Allure badge system that displays the current E2E test success percentage and links directly to the Allure report at [https://communitystream-io.github.io/flock/](https://communitystream-io.github.io/flock/).

## Badge Features

- **Real-time Data**: Shows current test success percentage
- **Clickable Link**: Direct link to the Allure report
- **Color Coding**: Green (90%+), Yellow (80-89%), Orange (70-79%), Red (<70%)
- **Test Count**: Displays passed/total test counts
- **Automatic Updates**: Updated on every CI run

## Badge Types

### 1. Shields.io Badge (Recommended)

The system generates a shields.io badge that's reliable and widely supported:

```markdown
[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-94%25%20(18/19)-green?style=flat-square&logo=allure&logoColor=white)](https://communitystream-io.github.io/flock/)
```

**Rendered as:**
[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-94%25%20(18/19)-green?style=flat-square&logo=allure&logoColor=white)](https://communitystream-io.github.io/flock/)

### 2. Custom SVG Badge

A custom SVG badge with the same functionality:

```markdown
[![E2E Tests](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAiIGZpbGw9IiM0Y2FmNTAiIHJ4PSIzIi8+PHRleHQgeD0iMTQiIHk9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiNmZmZmZmYiPkUyRSBUZXN0czogOTQlICgxOC8xOSk8L3RleHQ+PC9zdmc+)](https://communitystream-io.github.io/flock/)
```

## Usage

### Generate Badge Locally

```bash
# Generate badge from current Allure results
npm run allure:badge

# Or run the script directly
node scripts/generate-allure-badge.js
```

### Add to README

Add the badge to your project's README.md:

```markdown
# Flock Project

[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-94%25%20(18/19)-green?style=flat-square&logo=allure&logoColor=white)](https://communitystream-io.github.io/flock/)

Your project description here...
```

### Add to Documentation

Include the badge in documentation files:

```markdown
## Test Status

Current E2E test status: [![E2E Tests](https://img.shields.io/badge/E2E%20Tests-94%25%20(18/19)-green?style=flat-square&logo=allure&logoColor=white)](https://communitystream-io.github.io/flock/)
```

## CI Integration

The badge is automatically generated during the CI pipeline:

1. **E2E Tests Complete**: All shards finish running
2. **Allure Results Collected**: Results are aggregated from all shards
3. **Badge Generated**: Script analyzes results and creates badge
4. **Report Deployed**: Badge and report are available on GitHub Pages

### CI Workflow

```yaml
- name: Generate Allure Badge
  run: node scripts/generate-allure-badge.js
```

## Badge Data

The badge shows:

- **Success Percentage**: Current test pass rate
- **Test Count**: Number of passed tests vs total tests
- **Color**: Visual indicator of test health
- **Link**: Direct access to detailed Allure report

### Color Coding

| Success Rate | Color | Meaning |
|-------------|-------|---------|
| 90%+ | 🟢 Green | Excellent test health |
| 80-89% | 🟡 Yellow | Good test health, minor issues |
| 70-79% | 🟠 Orange | Moderate issues, needs attention |
| <70% | 🔴 Red | Critical issues, immediate action needed |

## Generated Files

The badge generator creates several files in the `badges/` directory:

- `allure-badge-shields.json` - Shields.io badge data
- `allure-badge-shields.md` - Markdown for shields.io badge
- `allure-badge-shields.html` - HTML for shields.io badge
- `allure-badge.svg` - Custom SVG badge
- `allure-badge.md` - Markdown for custom badge
- `allure-badge.html` - HTML for custom badge

## Customization

### Modify Badge Text

Edit `scripts/generate-allure-badge.js` to change:

- Badge text format
- Color thresholds
- Logo and styling
- Link destination

### Different Badge Styles

The script supports multiple badge styles:

- **Flat Square**: `style=flat-square` (default)
- **Plastic**: `style=plastic`
- **Flat**: `style=flat`
- **For the Badge**: `style=for-the-badge`

### Custom Colors

Modify the color logic in the script:

```javascript
let color = 'red';
if (successRate >= 90) color = 'green';
else if (successRate >= 80) color = 'yellow';
else if (successRate >= 70) color = 'orange';
```

## Troubleshooting

### Badge Not Updating

1. **Check CI Status**: Ensure the badge generation step completed successfully
2. **Verify Results**: Confirm Allure results are available
3. **Manual Generation**: Run `npm run allure:badge` locally to test

### Incorrect Data

1. **Check Allure Results**: Verify `allure-results/` directory contains valid data
2. **Filter Issues**: Ensure phantom hook failures are filtered out
3. **Script Errors**: Check for errors in the badge generation script

### Badge Not Displaying

1. **Markdown Syntax**: Verify correct markdown syntax
2. **Image URL**: Check that the shields.io URL is accessible
3. **Link Format**: Ensure the link format is correct

## Examples

### GitHub README

```markdown
# Flock

[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-94%25%20(18/19)-green?style=flat-square&logo=allure&logoColor=white)](https://communitystream-io.github.io/flock/)

A comprehensive testing framework for Angular applications.
```

### Project Status Page

```markdown
## Project Status

| Component | Status | Coverage | Tests |
|-----------|--------|----------|-------|
| E2E Tests | [![E2E Tests](https://img.shields.io/badge/E2E%20Tests-94%25%20(18/19)-green?style=flat-square&logo=allure&logoColor=white)](https://communitystream-io.github.io/flock/) | 94% | 18/19 |
| Unit Tests | [![Unit Tests](https://img.shields.io/badge/Unit%20Tests-98%25%20(245/250)-green?style=flat-square&logo=jest&logoColor=white)](https://codecov.io/gh/CommunityStream-io/flock) | 98% | 245/250 |
```

### Documentation

```markdown
## Testing

Our comprehensive testing suite ensures code quality and reliability:

- **E2E Tests**: [![E2E Tests](https://img.shields.io/badge/E2E%20Tests-94%25%20(18/19)-green?style=flat-square&logo=allure&logoColor=white)](https://communitystream-io.github.io/flock/)
- **Unit Tests**: [![Unit Tests](https://img.shields.io/badge/Unit%20Tests-98%25%20(245/250)-green?style=flat-square&logo=jest&logoColor=white)](https://codecov.io/gh/CommunityStream-io/flock)

For detailed test reports and analysis, visit our [Allure Dashboard](https://communitystream-io.github.io/flock/).
```

This badge system provides immediate visibility into your E2E test health and easy access to detailed test reports, making it easier for developers and stakeholders to understand the current state of your testing suite.
