# 🦅 Flock Documentation Jekyll Site

This directory contains the Jekyll-based documentation website for the Flock project, providing comprehensive documentation with multi-branch tool integration and responsive design.

## 🏗️ **Architecture**

### **Multi-Branch Strategy**
The Jekyll site supports deployment across multiple branches with specialized tool integration:

- **📊 Main Branch** (`main`): Production documentation at `https://communitystream-io.github.io/flock/`
- **🚧 Development Branch** (`develop`): Development docs at `https://communitystream-io.github.io/flock-develop/`
- **🔬 Staging Branch** (`staging`): Staging docs at `https://communitystream-io.github.io/flock-staging/`

### **Tool Integration**
Each branch maintains its own tool endpoints:

```yaml
# Main Branch Tools
- Allure Reports: https://communitystream-io.github.io/flock/allure/
- Test Badges: https://communitystream-io.github.io/flock/badges/
- Coverage: https://codecov.io/github/CommunityStream-io/flock

# Development Branch Tools  
- Allure Reports: https://communitystream-io.github.io/flock-develop/allure/
- Test Badges: https://communitystream-io.github.io/flock-develop/badges/
- Coverage: https://codecov.io/github/CommunityStream-io/flock/branch/develop
```

## 🚀 **Getting Started**

### **Prerequisites**
- Ruby 3.1+
- Bundler gem
- Node.js (for asset processing)

### **Local Development**

```bash
# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Serve with live reload
bundle exec jekyll serve --livereload --incremental

# Build for production
bundle exec jekyll build
```

### **Branch-Specific Builds**

```bash
# Build for specific branch
bundle exec jekyll build --config "_config.yml,_config-develop.yml"

# Serve with branch config
bundle exec jekyll serve --config "_config.yml,_config-develop.yml"
```

## 📁 **Site Structure**

```
├── _config.yml                 # Main Jekyll configuration
├── _layouts/                   # Page layouts
│   ├── default.html            # Base layout with navigation
│   ├── doc.html                # Documentation pages
│   └── tool.html               # Tool-specific pages
├── _includes/                  # Reusable components  
│   ├── sidebar.html            # Dynamic sidebar navigation
│   ├── breadcrumbs.html        # Breadcrumb navigation
│   └── page-footer.html        # Page footer with actions
├── _tools/                     # Tool documentation
│   ├── allure.md               # Allure reporting documentation
│   └── badges.md               # Badge system documentation
├── assets/                     # Static assets
│   ├── css/main.scss          # Main stylesheet
│   └── js/main.js             # Interactive functionality
├── index.md                    # Homepage
├── development.md              # Development guide
├── architecture.md             # Architecture overview
├── styling.md                  # Styling guide
├── tools.md                    # Tools overview
└── Gemfile                     # Ruby dependencies
```

## 🎨 **Theming System**

### **Design Principles**
- **🎯 Flock-Themed**: Bird and flight metaphors throughout
- **🎨 Material Design 3**: Modern, accessible design system
- **🌙 Dark Mode**: Automatic theme switching with user preference
- **📱 Responsive**: Mobile-first responsive design
- **⚡ Performance**: Optimized CSS and JavaScript

### **Color Scheme**
```scss
:root {
  --color-primary: #2196F3;      // Sky Blue (Flight theme)
  --color-secondary: #4CAF50;    // Nature Green (Growth theme)  
  --color-accent: #FF9800;       // Sunrise Orange (Energy theme)
  --color-success: #4CAF50;      // Success states
  --color-warning: #FF9800;      // Warning states
  --color-error: #F44336;        // Error states
}
```

## 🛠️ **Tool Integration Features**

### **Multi-Branch Tool Access**
Each tool page provides branch-specific access:

```html
<!-- Branch selector example -->
<select id="branch-select">
  <option value="main">Production</option>
  <option value="develop">Development</option>
  <option value="staging">Staging</option>
</select>
```

### **Real-Time Status Integration**
Live status badges and links:

```markdown
[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-Live-green)](https://communitystream-io.github.io/flock/)
[![Build Status](https://github.com/CommunityStream-io/flock/actions/workflows/ci.yml/badge.svg)](https://github.com/CommunityStream-io/flock/actions)
[![Coverage](https://codecov.io/github/CommunityStream-io/flock/graph/badge.svg)](https://codecov.io/github/CommunityStream-io/flock)
```

### **Dynamic Tool Cards**
Interactive tool cards with branch switching:

```html
<div class="tool-card">
  <h3>📊 Allure Reports</h3>
  <div class="branch-links">
    <a href="https://communitystream-io.github.io/flock/" class="main">Production</a>
    <a href="https://communitystream-io.github.io/flock-develop/" class="develop">Development</a>
  </div>
</div>
```

## 🔄 **CI/CD Integration**

### **Deployment Workflow**
The site is automatically deployed via GitHub Actions:

```yaml
# .github/workflows/jekyll-deploy.yml
- name: Build Jekyll Site
  run: bundle exec jekyll build --config "_config.yml,_config-${{ matrix.branch }}.yml"

- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v4
```

### **Branch-Specific Configurations**
Each branch has its own configuration override:

```yaml
# _config-develop.yml
baseurl: "/flock-develop"
environment: "development" 
branch: "develop"

tools:
  allure:
    branches:
      - name: "develop"
        url: "https://communitystream-io.github.io/flock-develop/"
```

## 📊 **Analytics and Monitoring**

### **Performance Tracking**
- Page load time monitoring
- User interaction tracking  
- Search functionality analytics
- Tool usage metrics

### **SEO Optimization**
- Semantic HTML structure
- OpenGraph meta tags
- Twitter Card integration
- JSON-LD structured data
- XML sitemap generation

## 🎯 **Interactive Features**

### **Search Functionality**
```javascript
// Keyboard shortcut: Ctrl/Cmd + K
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
});
```

### **Table of Contents**
Dynamic TOC generation from page headings:

```javascript
function generateTOC() {
  const headings = document.querySelectorAll('h1, h2, h3, h4');
  const toc = document.getElementById('toc');
  // Generate nested list from headings
}
```

### **Theme Switching**
```javascript
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}
```

## 📚 **Content Management**

### **Markdown Extensions**
- GitHub Flavored Markdown
- Code syntax highlighting with Rouge
- Mermaid diagram support
- Custom callout blocks
- Automatic heading anchors

### **Front Matter Structure**
```yaml
---
layout: doc                     # Layout template
title: "Page Title"            # Page title
description: "Page description" # Meta description
permalink: /custom-url/        # Custom URL
nav_order: 1                   # Navigation order
icon: "🚀"                     # Page icon
tags: ["tag1", "tag2"]         # Content tags
related_pages:                 # Related page links
  - title: "Related Page"
    url: "/related/"
    description: "Description"
toc: true                      # Enable table of contents
---
```

### **Collection Organization**
```yaml
# _config.yml
collections:
  docs:
    output: true
    permalink: /:collection/:name/
  architecture:
    output: true  
    permalink: /:collection/:path/
  testing:
    output: true
    permalink: /:collection/:name/
  tools:
    output: true
    permalink: /tools/:name/
```

## 🔧 **Development Workflow**

### **Local Development**
```bash
# Start development server
bundle exec jekyll serve --livereload

# Watch for changes with incremental builds
bundle exec jekyll serve --incremental --livereload

# Build and serve with specific config
bundle exec jekyll serve --config "_config.yml,_config-develop.yml"
```

### **Content Creation**
```bash
# Create new documentation page
touch new-doc.md

# Add front matter and content
---
layout: doc
title: "New Documentation"
---

# New Documentation Content
```

### **Testing**
```bash
# Build site for testing
bundle exec jekyll build

# Run HTML validation (requires html-proofer)
bundle exec htmlproofer ./_site --check-html --check-img-http

# Check internal links
bundle exec htmlproofer ./_site --disable-external
```

## 🚀 **Deployment**

### **Manual Deployment**
```bash
# Build for production
JEKYLL_ENV=production bundle exec jekyll build

# Deploy to GitHub Pages manually
# (Usually handled by CI/CD)
```

### **Automatic Deployment**
The site deploys automatically on:
- Push to `main`, `develop`, or `staging` branches
- Changes to documentation files
- Updates to Jekyll configuration

### **Branch-Specific Deployment**
Each branch deploys to its own subdirectory:
- `main` → `https://communitystream-io.github.io/flock/`
- `develop` → `https://communitystream-io.github.io/flock-develop/`
- `staging` → `https://communitystream-io.github.io/flock-staging/`

## 📈 **Metrics and Analytics**

### **Performance Metrics**
- Build time: ~2-3 minutes
- Page load time: <2 seconds
- Lighthouse score: 90+ across all metrics
- Mobile responsiveness: 100%

### **Content Metrics**
- Documentation coverage: 100% of features
- Search functionality: Full-text search
- Navigation depth: Maximum 3 levels
- Cross-references: Comprehensive linking

## 🤝 **Contributing**

### **Documentation Updates**
1. Edit markdown files directly
2. Follow front matter conventions
3. Test locally before committing
4. Verify responsive design
5. Check both light and dark themes

### **Feature Additions**
1. Update `_config.yml` for new collections
2. Create appropriate layouts in `_layouts/`
3. Add styling to `assets/css/main.scss`
4. Implement JavaScript features in `assets/js/main.js`
5. Test across all branches

### **Tool Integration**
1. Create tool page in `_tools/`
2. Update tool configuration in `_config.yml`
3. Add branch-specific URLs
4. Implement status dashboards
5. Test multi-branch functionality

---

## 📞 **Support and Troubleshooting**

### **Common Issues**
1. **Build Failures**: Check Ruby version and bundle dependencies
2. **Missing Assets**: Ensure assets are in the correct directory
3. **Broken Links**: Run `htmlproofer` to validate links
4. **Theme Issues**: Clear browser cache and check CSS compilation

### **Getting Help**
- **Documentation Issues**: [GitHub Issues](https://github.com/CommunityStream-io/flock/issues)
- **Jekyll Questions**: [Jekyll Documentation](https://jekyllrb.com/docs/)
- **Theme Problems**: Check `assets/css/main.scss` compilation
- **Deployment Issues**: Review GitHub Actions logs

> 🦅 **Documentation Philosophy**: *"Like a flock's formation, great documentation guides users effortlessly to their destination while providing the flexibility to explore and discover along the way."*