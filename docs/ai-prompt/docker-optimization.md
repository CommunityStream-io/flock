# Docker Build Optimization for E2E Testing

## Context

You are working with an Angular monorepo E2E testing setup that needs Docker build optimization. The current setup has performance issues that need to be addressed while maintaining compatibility with existing infrastructure.

## Current Setup Analysis

**Current Dockerfile.test Issues:**
- Build time: 2.5 minutes (target: <1.5min)
- Image loading time: 1 minute
- Duplicate npm installs in builder and runtime stages
- Large build context due to copying entire projects/ directory
- Inefficient layer caching (target: 80%+ reuse)
- Image size needs 30-40% reduction

**Project Structure:**
- Angular monorepo with multiple projects (flock-mirage, flock-native, flock-murmur, shared)
- E2E tests using WebdriverIO with Cucumber
- Uses npm with private package registry (.npmrc)
- Test configuration: `--configuration=test`
- Docker Compose setup with multiple services

**Current Dockerfile.test:**
```dockerfile
# Optimized Multi-stage Dockerfile for E2E Testing
# Stage 1: Base environment with Chrome and ChromeDriver
FROM node:20-slim AS base
# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    xvfb \
    && rm -rf /var/lib/apt/lists/*
# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*
# Install ChromeDriver using the new API
RUN CHROME_VERSION=$(google-chrome --version | cut -d " " -f3 | cut -d "." -f1) \
    && CHROMEDRIVER_VERSION=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${CHROME_VERSION}") \
    && wget -O /tmp/chromedriver.zip "https://storage.googleapis.com/chrome-for-testing-public/${CHROMEDRIVER_VERSION}/linux64/chromedriver-linux64.zip" \
    && unzip /tmp/chromedriver.zip -d /tmp/ \
    && mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/ \
    && chmod +x /usr/local/bin/chromedriver \
    && rm -rf /tmp/chromedriver.zip /tmp/chromedriver-linux64

# Stage 2: Build Angular application
FROM node:20-alpine AS builder
WORKDIR /app
# Accept build argument for package token
ARG PACKAGE_TOKEN
# Set environment variable for npm authentication
ENV PACKAGE_TOKEN=$PACKAGE_TOKEN
# Copy package files and npmrc
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./
COPY .npmrc ./
# Install dependencies
RUN npm ci
# Copy source code
COPY projects/ ./projects/
# Build the Angular application
RUN npx ng build flock-mirage --configuration=test

# Stage 3: Runtime with pre-built artifacts
FROM base AS runtime
# Accept build argument for package token
ARG PACKAGE_TOKEN
# Set environment variable for npm authentication
ENV PACKAGE_TOKEN=$PACKAGE_TOKEN
# Set working directory
WORKDIR /app
# Copy built application from builder stage
COPY --from=builder /app/dist/flock-mirage ./dist/flock-mirage
# Copy test files and configuration
COPY features/ ./features/
COPY wdio.conf.ts ./
COPY tsconfig.e2e.json ./
COPY package*.json ./
COPY .npmrc ./
# Copy source code for Angular dev server
COPY projects/ ./projects/
COPY angular.json ./
COPY tsconfig*.json ./
COPY scripts/docker-startup.sh /usr/local/bin/setup-npm-auth
RUN chmod +x /usr/local/bin/setup-npm-auth
# Install dependencies
RUN npm ci
# Create directories for logs and results
RUN mkdir -p logs/servers logs/shards logs/exits allure-results
# Set environment variables
ENV NODE_ENV=test
ENV HEADLESS=true
ENV CI=true
ENV TIMEOUT_TELEMETRY=true
# Expose port for Angular dev server
EXPOSE 4200
# Default command (can be overridden)
CMD ["npm", "run", "test:e2e:skip-failing"]
```

## Environment Details

**Dependencies:**
- Node.js 20
- Angular 20.1.0
- WebdriverIO 9.19.1
- Chrome/ChromeDriver for E2E testing
- Private npm packages (requires PACKAGE_TOKEN)

**Build Context:**
- Large projects/ directory (136+ files)
- Multiple TypeScript configurations
- E2E test features and step definitions
- WebdriverIO configuration

**Current .dockerignore:**
```dockerignore
# Docker ignore file for optimized builds
# Exclude unnecessary files from Docker build context

# Node modules (will be installed in container)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs (will be built in container)
dist/
build/

# Logs and temporary files
logs/
*.log
*.tmp

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Git
.git/
.gitignore

# CI/CD
.github/
.gitlab-ci.yml

# Test artifacts
allure-results/
allure-report/
coverage/
reports/

# Documentation
docs/
README.md

# Scripts (except essential ones)
scripts/
!scripts/docker-startup.sh
*.sh
!scripts/docker-startup.sh

# Config files not needed in container
.env*
.env.local
.env.development.local
.env.test.local
.env.production.local

# npmrc file (needed for Docker build)
# .npmrc

# Cache directories
.cache/
.parcel-cache/
.next/
.nuxt/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/
```

## Optimization Goals

1. **Reduce build time from 2.5min to under 1.5min**
2. **Reduce image size by 30-40%**
3. **Improve layer caching efficiency to 80%+ reuse**
4. **Keep the solution simple and maintainable**
5. **Maintain compatibility with existing docker-compose.yml**

## Constraints

- Must support private npm packages (PACKAGE_TOKEN)
- Must include Chrome and ChromeDriver for E2E testing
- Must support Angular dev server for testing
- Must maintain current multi-stage structure
- Keep it simple - no complex optimizations

## Key Optimization Strategies

### 1. Layer Caching Optimization
- Copy package.json files first for better npm cache reuse
- Separate dependency installation from source code copying
- Use .dockerignore to reduce build context size
- Optimize RUN commands to minimize layer count

### 2. Build Context Reduction
- Improve .dockerignore to exclude unnecessary files
- Only copy required project files for E2E testing
- Use multi-stage builds more efficiently

### 3. Dependency Management
- Eliminate duplicate npm installs
- Use npm ci for faster, reliable installs
- Leverage Docker layer caching for dependencies

### 4. Image Size Reduction
- Use Alpine Linux base images where possible
- Remove unnecessary packages after installation
- Clean up package caches and temporary files
- Use multi-stage builds to exclude build tools from final image

## Success Criteria

**Performance Targets:**
- Build time: <1.5 minutes (40% reduction)
- Image size: 30-40% smaller than current
- Layer cache hit rate: >80% for unchanged dependencies
- Image loading time: <45 seconds

**Maintainability:**
- Simple, readable Dockerfile structure
- Clear separation of concerns between stages
- Easy to modify and extend
- Compatible with existing docker-compose.yml

**Functionality:**
- All E2E tests must continue to work
- Private npm package access maintained
- Chrome/ChromeDriver functionality preserved
- Angular dev server works correctly

## Files to Investigate

1. **Dockerfile.test** - Main optimization target
2. **.dockerignore** - Build context optimization
3. **docker-compose.yml** - Service compatibility
4. **package.json** - Dependency analysis
5. **angular.json** - Build configuration
6. **projects/** - Source code structure analysis

## Expected Deliverables

1. **Optimized Dockerfile.test** with clear comments
2. **Enhanced .dockerignore** with better exclusions
3. **Performance analysis** showing improvements
4. **Build commands** for testing optimizations
5. **Migration guide** for existing setup

## Testing Commands

```bash
# Test build performance
time docker build -f Dockerfile.test --target base -t flock-e2e-base:optimized .
time docker build -f Dockerfile.test --target runtime -t flock-e2e-runtime:optimized .

# Test image size
docker images | grep flock-e2e

# Test functionality
docker-compose up --build
```

## Notes

- Focus on the most impactful changes that are easy to implement
- Maintain backward compatibility with existing workflows
- Document all changes clearly for team adoption
- Test thoroughly with actual E2E test runs
- Consider future scalability and maintenance needs
