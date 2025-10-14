const fs = require('fs');

// Read the test results
const content = fs.readFileSync('test-results.txt', 'utf8');

// Find all FAILED test lines
const lines = content.split('\n');
const failures = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Look for lines with "FAILED"
  if (line.includes('FAILED') && line.includes('Chrome Headless')) {
    // Extract the test description
    const match = line.match(/Chrome Headless.*?\(Windows 10\) (.+?) FAILED/);
    if (match) {
      const testName = match[1].trim();
      
      // Look ahead for file path in error stack
      let filePath = '';
      let lineNumber = '';
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const stackLine = lines[j];
        const pathMatch = stackLine.match(/at.*?\((projects\/.*?):(\d+):\d+\)/);
        if (pathMatch) {
          filePath = pathMatch[1];
          lineNumber = pathMatch[2];
          break;
        }
      }
      
      failures.push({
        testName,
        filePath,
        lineNumber: parseInt(lineNumber) || 0
      });
    }
  }
}

// Group by file
const byFile = failures.reduce((acc, f) => {
  if (!acc[f.filePath]) {
    acc[f.filePath] = [];
  }
  acc[f.filePath].push(f);
  return acc;
}, {});

// Output as JSON
console.log(JSON.stringify(byFile, null, 2));
console.log(`\n\nTotal failures: ${failures.length}`);
console.log(`Files affected: ${Object.keys(byFile).length}`);

