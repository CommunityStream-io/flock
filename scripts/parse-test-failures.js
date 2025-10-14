const fs = require('fs');
const path = require('path');

// Read the test results file
const testResults = fs.readFileSync('test-results.txt', 'utf8');

// Pattern to match failing tests
const failurePattern = /Chrome Headless.*?\(Windows 10\) (.+?) FAILED\s+(.+?)\s+at.*?\((.+?):(\d+):\d+\)/gs;

const failures = [];
let match;

while ((match = failurePattern.exec(testResults)) !== null) {
  failures.push({
    testName: match[1].trim(),
    error: match[2].trim(),
    file: match[3].trim(),
    line: parseInt(match[4])
  });
}

// Group failures by file
const failuresByFile = failures.reduce((acc, failure) => {
  if (!acc[failure.file]) {
    acc[failure.file] = [];
  }
  acc[failure.file].push(failure);
  return acc;
}, {});

// Output the results
console.log(JSON.stringify(failuresByFile, null, 2));
console.log(`\nTotal failures found: ${failures.length}`);

