# Background Agent Prompt: Complete Docker E2E Testing with Allure Results

## Context
You are continuing work on a container-based E2E testing solution for an Angular application called "flock". The project uses WebdriverIO with Cucumber for E2E tests, sharded testing for parallel execution, and Allure reporting for test results.

## Branch Information
- **Current Branch**: `fix-e2e-tests`
- **Repository**: `CommunityStream-io/flock`
- **Checkout Command**: `git checkout fix-e2e-tests`

## Current State
- ✅ Docker image builds successfully with ChromeDriver pre-installed
- ✅ CI workflow uses pre-built container from GHCR
- ✅ NPM scripts refactored to use `test:e2e:docker` calling `test:e2e:shard`
- ✅ Allure reporter configured in `wdio.docker.conf.ts`
- ❌ **ISSUE**: Allure results are not being generated in container runs

## Key Files
- **Dockerfile**: `Dockerfile.test` - Multi-stage build with Angular CLI, ChromeDriver, Git
- **WebdriverIO Config**: `wdio.docker.conf.ts` - Docker-specific config with Allure reporter
- **CI Workflow**: `.github/workflows/ci.yml` - Uses container with `test:e2e:docker` script
- **Package Scripts**: `package.json` - `test:e2e:docker` calls `test:e2e:shard` with Docker config

## Current CI Pattern
```yaml
- name: Run E2E tests in container
  run: |
    echo "🚀 Running shard ${{ matrix.shard }}/${{ matrix.total-shards }} in pre-built container..."
    SHARD=${{ matrix.shard }} TOTAL_SHARDS=${{ matrix.total-shards }} npm run test:e2e:docker
```

## Expected Artifacts
The CI workflow expects these artifacts to be uploaded:
- `allure-results/` - Allure test results directory
- `logs/metrics/timeout-telemetry-*.json` - Timeout telemetry files
- `logs/metrics/test-metrics-*.json` - Test metrics files

## Current Problem
All E2E test jobs show: `No files were found with the provided path: allure-results/`

## Investigation Needed
1. **Verify Allure Configuration**: Check if `wdio.docker.conf.ts` has correct Allure reporter setup
2. **Check Output Directory**: Ensure Allure results are written to `allure-results/` directory
3. **Verify Environment Variables**: Confirm `CI=true` triggers Allure reporting
4. **Test Container Locally**: Run the container locally to debug Allure generation
5. **Check WebdriverIO Logs**: Look for Allure reporter initialization and execution

## Key Commands
```bash
# Build and test locally
docker build -f Dockerfile.test -t flock-e2e-test .
docker run -e PACKAGE_TOKEN=$PACKAGE_TOKEN -p 4200:4200 flock-e2e-test

# Run specific shard
SHARD=1 TOTAL_SHARDS=3 npm run test:e2e:docker

# Check Allure results
ls -la allure-results/
```

## GitHub Actions Monitoring
```bash
# Check current workflow runs
gh run list --limit=5

# View latest run details
gh run view

# Monitor specific workflow
gh run list --workflow=".github/workflows/ci.yml" --limit=3

# Watch live logs for current run
gh run watch

# View specific job logs
gh run view --job=<job-id>

# Check workflow status
gh run list --status=in_progress
```

## Success Criteria
- [ ] Allure results are generated in `allure-results/` directory
- [ ] Allure artifacts are uploaded successfully in CI
- [ ] Allure report deployment step succeeds
- [ ] Timeout telemetry and test metrics are also generated

## Files to Focus On
1. `wdio.docker.conf.ts` - Allure reporter configuration
2. `package.json` - Script execution and environment variables
3. `.github/workflows/ci.yml` - Artifact upload patterns
4. Docker container logs - Debug Allure generation

## Next Steps
1. Debug why Allure results aren't being generated in the container
2. Fix the Allure reporter configuration if needed
3. Test locally to verify Allure results are created
4. Update CI workflow if necessary
5. Verify the complete end-to-end flow works

The goal is to have a fully working container-based E2E testing solution that generates Allure reports for test result visualization and analysis.

## Recent Changes Made
- Fixed Docker container to include all devDependencies for Angular dev server
- Added Git to Alpine container for submodule support
- Fixed Docker package name and permissions for GHCR
- Refactored CI to use npm scripts instead of inline commands
- Made `test:e2e:docker` call the existing `test:e2e:shard` command with Docker config
- **LATEST**: Fixed missing `concurrently` package by installing it globally in Docker container
- **LATEST**: Fixed node_modules copying issue by installing dependencies directly in runtime stage

## Current Workflow Status
The CI workflow is currently running and should be building the Docker image and running E2E tests. The main remaining issue is ensuring Allure results are properly generated and uploaded as artifacts.

## Monitoring Instructions
1. **Check Current Run**: Use `gh run list --limit=1` to see the latest workflow run
2. **Monitor Progress**: Use `gh run watch` to watch live logs
3. **Check Specific Jobs**: Look for "Build E2E Docker Image" and "Practice the murmuration (E2E Test)" jobs
4. **Verify Artifacts**: Check if Allure results are being uploaded in the E2E test jobs
5. **Debug Failures**: Use `gh run view --job=<job-id>` to see detailed logs for failed jobs

## Expected Workflow Flow
1. **Build E2E Docker Image** - Should build and push to GHCR successfully
2. **Practice the murmuration (E2E Test)** - Should run tests in container and generate Allure results
3. **Deploy Allure Report to GitHub Pages** - Should succeed if Allure results are available
