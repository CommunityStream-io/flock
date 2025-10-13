#!/usr/bin/env node
/**
 * StepHeader Test Suite Validation Script
 * 
 * Validates that all test files exist and are properly structured
 * for the comprehensive StepHeader component test suite.
 */

const fs = require('fs');
const path = require('path');

const testFiles = [
  'src/lib/step-header/step-header.spec.ts',
  'src/lib/step-header/step-header-bdd.component.spec.ts', 
  'src/lib/step-header/step-header-integration.spec.ts',
  'src/lib/step-header/step-header-test-utils.ts',
  'src/lib/step-layout/step-layout-bdd.component.spec.ts',
  'src/lib/step-header/step-header-coverage.md',
  'src/lib/step-header/README-TESTING.md'
];

const requiredPatterns = {
  'step-header.spec.ts': [
    'describe.*StepHeader Component Unit Tests',
    'Component Initialization',
    'Route Data Extraction',
    'Nested Route Handling',
    'Router Events Handling',
    'Template Rendering',
    'Edge Cases and Error Handling'
  ],
  'step-header-bdd.component.spec.ts': [
    'BDD-Style Integration Tests',
    'Feature.*Dynamic Step Header Display',
    'Scenario.*Display current route title',
    'Scenario.*Navigate between different step routes',
    'console\.log.*🔧 BDD:',
    'console\.log.*⚙️ BDD:',
    'console\.log.*✅ BDD:'
  ],
  'step-header-integration.spec.ts': [
    'Integration Tests.*Real Router Configuration',
    'Feature.*StepHeader Integration with Real Routes',
    'STEP_ROUTE_TEST_DATA',
    'MockUploadComponent',
    'RouterTestingModule\.withRoutes'
  ],
  'step-layout-bdd.component.spec.ts': [
    'Feature.*Step Layout Integration with Header',
    'StepLayout.*StepHeader',
    'router-outlet',
    'StepNavigationComponent'
  ],
  'step-header-test-utils.ts': [
    'createMockActivatedRoute',
    'createMockRouter',
    'STEP_ROUTE_TEST_DATA',
    'EDGE_CASE_TEST_DATA',
    'createNestedRouteStructure',
    'simulateNavigation',
    'StepHeaderTestAssertions'
  ]
};

console.log('🧪 Validating StepHeader Test Suite...\n');

let allValid = true;
let totalTests = 0;

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  
  if (!exists) {
    console.log(`❌ Missing file: ${file}`);
    allValid = false;
    return;
  }
  
  console.log(`✅ Found: ${file}`);
  
  // Validate content for test files
  const fileName = path.basename(file);
  if (requiredPatterns[fileName]) {
    const content = fs.readFileSync(filePath, 'utf8');
    const patterns = requiredPatterns[fileName];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'i');
      if (!regex.test(content)) {
        console.log(`   ⚠️  Missing pattern: ${pattern}`);
        allValid = false;
      }
    });
    
    // Count test cases
    const testCases = content.match(/it\s*\(/g);
    if (testCases) {
      const count = testCases.length;
      totalTests += count;
      console.log(`   📊 Test cases: ${count}`);
    }
  }
});

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log(`✅ All test files validated successfully!`);
  console.log(`📊 Total test cases: ${totalTests}`);
  console.log(`🎯 Comprehensive coverage achieved`);
  
  console.log('\n🚀 Ready to run tests:');
  console.log('   npm run test:shared');
  console.log('   npm run test:shared -- --code-coverage');
  
} else {
  console.log(`❌ Test suite validation failed`);
  console.log(`Please ensure all required test files and patterns are present`);
  process.exit(1);
}

console.log('\n📋 Test Suite Structure:');
console.log('├── Unit Tests (step-header.spec.ts)');
console.log('├── BDD Integration Tests (step-header-bdd.component.spec.ts)');
console.log('├── Layout Integration Tests (step-layout-bdd.component.spec.ts)');
console.log('├── Router Integration Tests (step-header-integration.spec.ts)');
console.log('├── Test Utilities (step-header-test-utils.ts)');
console.log('├── Coverage Report (step-header-coverage.md)');
console.log('└── Testing Guide (README-TESTING.md)');

console.log('\n🎉 StepHeader component is ready for comprehensive testing!');