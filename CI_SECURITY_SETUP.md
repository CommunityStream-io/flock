# CI/CD Security Setup Guide

## Overview
This guide provides secure CI/CD integration for Docker builds with private package authentication using the environment variable approach implemented in this project.

## Security Implementation

### ✅ Current Secure Setup
1. **Secure .npmrc Template**: Uses `${PACKAGE_TOKEN}` placeholder
2. **Dockerfile Security**: Accepts PACKAGE_TOKEN as build argument
3. **Docker Compose Security**: Passes PACKAGE_TOKEN from environment
4. **Runtime Security**: No hardcoded credentials anywhere

## CI/CD Platform Integration

### GitHub Actions (Recommended)

#### 1. Create GitHub Actions Workflow
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Build Docker image
      run: |
        docker build \
          --build-arg PACKAGE_TOKEN=${{ secrets.PACKAGE_TOKEN }} \
          -f Dockerfile.test \
          -t flock-e2e-runtime .
      env:
        PACKAGE_TOKEN: ${{ secrets.PACKAGE_TOKEN }}

    - name: Run E2E Tests
      run: |
        docker run --rm \
          -e PACKAGE_TOKEN=${{ secrets.PACKAGE_TOKEN }} \
          -v ${{ github.workspace }}/logs:/app/logs \
          -v ${{ github.workspace }}/allure-results:/app/allure-results \
          flock-e2e-runtime npm run test:e2e:skip-failing
      env:
        PACKAGE_TOKEN: ${{ secrets.PACKAGE_TOKEN }}

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: e2e-test-results
        path: |
          logs/
          allure-results/
```

#### 2. Set GitHub Secrets
1. Go to Repository Settings → Secrets and variables → Actions
2. Add `PACKAGE_TOKEN` with your GitHub Personal Access Token
3. Token should have `read:packages` scope

### GitLab CI/CD

#### 1. Create GitLab CI Configuration
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test

variables:
  DOCKER_DRIVER: overlay2

build-e2e:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker build 
        --build-arg PACKAGE_TOKEN=$PACKAGE_TOKEN 
        -f Dockerfile.test 
        -t flock-e2e-runtime .
  variables:
    PACKAGE_TOKEN: $PACKAGE_TOKEN

e2e-tests:
  stage: test
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker run --rm 
        -e PACKAGE_TOKEN=$PACKAGE_TOKEN
        -v $PWD/logs:/app/logs 
        -v $PWD/allure-results:/app/allure-results 
        flock-e2e-runtime npm run test:e2e:skip-failing
  artifacts:
    paths:
      - logs/
      - allure-results/
    when: always
  variables:
    PACKAGE_TOKEN: $PACKAGE_TOKEN
```

#### 2. Set GitLab Variables
1. Go to Project Settings → CI/CD → Variables
2. Add `PACKAGE_TOKEN` with your token (mark as protected and masked)

### Jenkins

#### 1. Jenkins Pipeline
```groovy
pipeline {
    agent any
    
    environment {
        PACKAGE_TOKEN = credentials('package-token')
    }
    
    stages {
        stage('Build') {
            steps {
                script {
                    docker.build("flock-e2e-runtime", "--build-arg PACKAGE_TOKEN=${PACKAGE_TOKEN} -f Dockerfile.test .")
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    docker.image("flock-e2e-runtime").run(
                        "-e PACKAGE_TOKEN=${PACKAGE_TOKEN} " +
                        "-v ${WORKSPACE}/logs:/app/logs " +
                        "-v ${WORKSPACE}/allure-results:/app/allure-results",
                        "npm run test:e2e:skip-failing"
                    )
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'logs/**, allure-results/**', fingerprint: true
        }
    }
}
```

#### 2. Set Jenkins Credentials
1. Go to Manage Jenkins → Manage Credentials
2. Add Secret Text credential with ID `package-token`

## Local Development

### Using Docker Compose
```bash
# Set environment variable
export PACKAGE_TOKEN="your_github_token_here"

# Run E2E tests
docker-compose up test-runner

# Or run specific services
docker-compose up app-server
```

### Using Docker Build Directly
```bash
# Build with token
docker build --build-arg PACKAGE_TOKEN=$PACKAGE_TOKEN -f Dockerfile.test -t flock-e2e .

# Run tests
docker run --rm -e PACKAGE_TOKEN=$PACKAGE_TOKEN flock-e2e npm run test:e2e:skip-failing
```

## Security Best Practices

### ✅ DO
- Use environment variables for tokens
- Store tokens in secure CI/CD secrets
- Use GitHub Personal Access Tokens with minimal scopes
- Rotate tokens regularly
- Use `.npmrc` with `${PACKAGE_TOKEN}` placeholder
- Pass tokens as build arguments to Docker

### ❌ DON'T
- Hardcode tokens in `.npmrc` files
- Commit tokens to version control
- Create dynamic `.npmrc` files with `echo` commands
- Store tokens in Docker images
- Use overly broad token scopes
- Share tokens between environments

## Token Management

### GitHub Personal Access Token Setup
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set expiration (90 days recommended)
4. Select scopes:
   - `read:packages` (required for reading packages)
   - `repo` (if accessing private repositories)
5. Copy token immediately and store securely

### Token Validation
```bash
# Test token locally
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Test npm authentication
npm whoami --registry=https://npm.pkg.github.com/
```

## Troubleshooting

### Common Issues

#### 1. "401 Unauthorized" errors
- Check token is valid and not expired
- Verify token has `read:packages` scope
- Ensure PACKAGE_TOKEN environment variable is set
- Confirm `.npmrc` uses `${PACKAGE_TOKEN}` format

#### 2. Docker build failures
- Verify PACKAGE_TOKEN is passed as build argument
- Check `.npmrc` is copied to all Docker stages
- Ensure npm ci can access private packages

#### 3. CI/CD failures
- Check secrets are properly configured
- Verify environment variables are passed to Docker
- Confirm token permissions in CI environment

### Debug Commands
```bash
# Check environment variable
echo $PACKAGE_TOKEN

# Verify .npmrc content
cat .npmrc

# Test Docker build
docker build --build-arg PACKAGE_TOKEN=$PACKAGE_TOKEN -f Dockerfile.test --target deps -t debug .

# Check npm config in container
docker run --rm -e PACKAGE_TOKEN=$PACKAGE_TOKEN debug npm config list
```

## Migration Checklist

- [ ] Replace any existing `.npmrc` with template version
- [ ] Update Dockerfile to use build arguments
- [ ] Update docker-compose.yml with PACKAGE_TOKEN
- [ ] Set up CI/CD secrets management
- [ ] Test build process locally
- [ ] Verify CI/CD pipeline works
- [ ] Document token rotation process

## Compliance Notes

This setup follows security best practices:
- No credentials in version control
- Environment variable-based authentication
- Secure CI/CD integration
- Regular token rotation capability
- Audit trail through CI/CD logs