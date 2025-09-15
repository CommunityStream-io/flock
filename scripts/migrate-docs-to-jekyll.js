#!/usr/bin/env node

/**
 * Migration Script: Convert Existing Docs to Jekyll Format
 * 
 * This script adds Jekyll front matter to existing markdown files
 * in the docs/ directory to make them compatible with Jekyll.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Configuration for different document types
const CONFIG = {
  'docs/ARCHITECTURE.md': {
    title: '🏗️ Architecture Overview',
    description: 'Comprehensive architectural design and patterns',
    permalink: '/architecture/',
    nav_order: 2,
    icon: '🏗️',
    tags: ['architecture', 'design', 'patterns']
  },
  'docs/DEVELOPMENT.md': {
    title: '🚀 Development Guide', 
    description: 'Development setup and workflow guide',
    permalink: '/development/',
    nav_order: 3,
    icon: '🚀',
    tags: ['development', 'setup', 'workflow']
  },
  'docs/TESTING.md': {
    title: '🧪 Testing Guide',
    description: 'Comprehensive testing strategies and methodologies', 
    permalink: '/testing/',
    nav_order: 4,
    icon: '🧪',
    tags: ['testing', 'bdd', 'e2e', 'unit']
  },
  'docs/STYLING.md': {
    title: '🎨 Styling Guide',
    description: 'Material Design 3 theming system',
    permalink: '/styling/',
    nav_order: 5,
    icon: '🎨', 
    tags: ['styling', 'theming', 'material-design']
  }
};

// Testing subdirectory configuration
const TESTING_CONFIG = {
  'BDD_METHODOLOGY.md': {
    title: '🎭 BDD Methodology',
    description: 'Behavior-driven development approach',
    icon: '🎭'
  },
  'E2E_TESTING.md': {
    title: '🧪 E2E Testing',
    description: 'End-to-end testing strategies',
    icon: '🧪'
  },
  'UNIT_TESTING.md': {
    title: '🔬 Unit Testing', 
    description: 'Unit testing best practices',
    icon: '🔬'
  },
  'CI_INTEGRATION.md': {
    title: '⚙️ CI Integration',
    description: 'Continuous integration setup',
    icon: '⚙️'
  },
  'COVERAGE.md': {
    title: '📈 Coverage Analysis',
    description: 'Code coverage tracking and analysis',
    icon: '📈'
  }
};

// Architecture subdirectory configuration  
const ARCHITECTURE_CONFIG = {
  'shared/OVERVIEW.md': {
    title: '🧩 Shared Components Overview',
    description: 'Shared component library architecture',
    icon: '🧩'
  },
  'shared/COMPONENTS.md': {
    title: '🎨 UI Components',
    description: 'Reusable user interface components',
    icon: '🎨'
  },
  'shared/SERVICES.md': {
    title: '🔧 Shared Services',
    description: 'Common business logic services',
    icon: '🔧'
  },
  'flock-mirage/OVERVIEW.md': {
    title: '🎭 Mirage Architecture',
    description: 'Development and testing application architecture',
    icon: '🎭'
  },
  'flock-murmur/OVERVIEW.md': {
    title: '🌊 Murmur Architecture', 
    description: 'Web deployment application architecture',
    icon: '🌊'
  },
  'flock-native/OVERVIEW.md': {
    title: '🦅 Native Architecture',
    description: 'Desktop application architecture', 
    icon: '🦅'
  }
};

/**
 * Generate Jekyll front matter for a file
 */
function generateFrontMatter(filePath, config) {
  const relativePath = path.relative('.', filePath);
  const fileName = path.basename(filePath, '.md');
  
  let frontMatter = {
    layout: 'doc',
    title: config.title || fileName,
    description: config.description || `Documentation for ${fileName}`,
    toc: true,
    tags: config.tags || []
  };

  // Add specific properties
  if (config.permalink) frontMatter.permalink = config.permalink;
  if (config.nav_order) frontMatter.nav_order = config.nav_order;
  if (config.icon) frontMatter.icon = config.icon;
  if (config.parent) frontMatter.parent = config.parent;

  // Add parent and custom permalink for subdirectories
  if (relativePath.includes('docs/testing/')) {
    frontMatter.parent = 'testing';
    frontMatter.permalink = `/docs/testing/${fileName.toLowerCase()}/`;
  } else if (relativePath.includes('docs/architecture/')) {
    frontMatter.parent = 'architecture';
    const subPath = path.dirname(relativePath).replace('docs/architecture/', '');
    frontMatter.permalink = `/docs/architecture/${subPath}/${fileName.toLowerCase()}/`;
  }

  return frontMatter;
}

/**
 * Check if file already has front matter
 */
function hasFrontMatter(content) {
  return content.trim().startsWith('---');
}

/**
 * Add front matter to a markdown file
 */
function addFrontMatter(filePath, config) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (hasFrontMatter(content)) {
      console.log(`⏭️  Skipping ${filePath} - already has front matter`);
      return;
    }

    const frontMatter = generateFrontMatter(filePath, config);
    const yamlString = yaml.stringify(frontMatter);
    const newContent = `---\n${yamlString}---\n\n${content}`;
    
    // Create backup
    fs.writeFileSync(`${filePath}.backup`, content);
    
    // Write new content
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Updated ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Find all markdown files in a directory
 */
function findMarkdownFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.md') && !item.includes('.backup')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Main migration function
 */
function migrateDocs() {
  console.log('🚀 Starting documentation migration to Jekyll...\n');

  // Process main docs
  for (const [filePath, config] of Object.entries(CONFIG)) {
    if (fs.existsSync(filePath)) {
      addFrontMatter(filePath, config);
    }
  }

  // Process testing docs
  const testingDir = 'docs/testing';
  if (fs.existsSync(testingDir)) {
    for (const [fileName, config] of Object.entries(TESTING_CONFIG)) {
      const filePath = path.join(testingDir, fileName);
      if (fs.existsSync(filePath)) {
        addFrontMatter(filePath, { ...config, parent: 'testing' });
      }
    }
  }

  // Process architecture docs
  const architectureDir = 'docs/architecture';
  if (fs.existsSync(architectureDir)) {
    for (const [fileName, config] of Object.entries(ARCHITECTURE_CONFIG)) {
      const filePath = path.join(architectureDir, fileName);
      if (fs.existsSync(filePath)) {
        addFrontMatter(filePath, { ...config, parent: 'architecture' });
      }
    }
  }

  // Process any remaining markdown files
  const allMarkdownFiles = findMarkdownFiles('docs');
  for (const filePath of allMarkdownFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!hasFrontMatter(content)) {
      const fileName = path.basename(filePath, '.md');
      const defaultConfig = {
        title: fileName.replace(/[-_]/g, ' '),
        description: `Documentation for ${fileName}`,
        icon: '📄'
      };
      addFrontMatter(filePath, defaultConfig);
    }
  }

  console.log('\n🎉 Documentation migration completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the generated front matter in your docs');
  console.log('2. Customize titles, descriptions, and icons as needed');
  console.log('3. Test the Jekyll site: bundle exec jekyll serve');
  console.log('4. If satisfied, remove .backup files: find docs -name "*.backup" -delete');
}

/**
 * Restore from backups (if needed)
 */
function restoreBackups() {
  const backupFiles = findMarkdownFiles('docs').filter(f => f.endsWith('.backup'));
  
  for (const backupFile of backupFiles) {
    const originalFile = backupFile.replace('.backup', '');
    fs.copyFileSync(backupFile, originalFile);
    fs.unlinkSync(backupFile);
    console.log(`🔄 Restored ${originalFile}`);
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      migrateDocs();
      break;
    case 'restore':
      restoreBackups();
      break;
    default:
      console.log('Usage:');
      console.log('  node migrate-docs-to-jekyll.js migrate  - Add Jekyll front matter to docs');
      console.log('  node migrate-docs-to-jekyll.js restore  - Restore from backups');
  }
}

module.exports = { migrateDocs, restoreBackups };