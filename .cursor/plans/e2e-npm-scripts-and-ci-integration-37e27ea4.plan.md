<!-- 37e27ea4-1aca-408c-bcb4-eee9e1de81a4 a2ad5a52-1de6-497b-86e7-044c686d4d45 -->
# E2E NPM Scripts and CI Integration

## Phase 3: NPM Scripts

### Update package.json

Replace existing e2e scripts (lines 38-62 in `package.json`) with comprehensive tag-based scripts that support:

- Smoke tests (`@smoke`) - < 3 minutes
- Core suites (`@core`, `@auth`, `@upload`, `@config`) - < 8 minutes each
- Feature-specific tests (auth, upload, config sub-suites)
- Platform-specific tests (`@web`, `@electron`)
- Integration and regression suites
- Parallel execution support

Key scripts to add:

- `e2e:smoke` - Critical path tests
- `e2e:core` - Essential functionality
- `e2e:core:auth`, `e2e:core:upload`, `e2e:core:config` - Core feature tests
- `e2e:config:*` - Config sub-suite breakdowns (validation, date-range, ui, testing)
- `e2e:auth:*` - Auth sub-suite breakdowns (validation, guards)
- `e2e:upload:*` - Upload sub-suite breakdowns (validation)
- `e2e:web`, `e2e:electron` - Platform-specific tests
- `e2e:parallel` - Parallel-safe tests
- `e2e:regression` - Full regression suite

All scripts will use the existing server startup approach with `concurrently` and `wait-on` for web tests, and direct execution for electron tests.

## Phase 4: CI/CD Integration

### Update .github/workflows/ci.yml

Add new smoke test job that runs on every push:

- Runs before the full e2e matrix (fast feedback loop)
- Uses `@smoke` tag filter
- Single shard execution (smoke tests should be fast enough)
- Timeout: 10 minutes
- Runs in the pre-built Docker container

Enhance existing e2e-matrix job to support tag-based execution:

- Keep the dynamic sharding approach (1 shard per feature file = 33 shards currently)
- Add ability to filter by tags via workflow inputs
- Add conditional execution based on tag filtering
- Maintain existing artifact upload and analysis steps

Update workflow triggers:

- Smoke tests: Run on every push to any branch
- Full suite: Run on push to main/develop and PRs (as currently configured)

### Key Implementation Details

**Smoke Test Job:**

```yaml
smoke-tests:
  runs-on: ubuntu-latest
  needs: build-e2e-image
  timeout-minutes: 10
  container:
    image: ghcr.io/communitystream-io/flock-e2e-test:${{ github.ref_name }}
  steps:
    - Run smoke tests using TEST_TAGS='@smoke'
    - Upload results
```

**Enhanced E2E Matrix:**

- Continue using the dynamic matrix calculation (counting feature files)
- Pass TEST_TAGS environment variable through to test execution
- Maintain all existing features (artifact upload, timeout analysis, Allure deployment)

## Testing

After implementation:

1. Test smoke script locally: `npm run e2e:smoke`
2. Test core script locally: `npm run e2e:core`
3. Test config sub-suite: `npm run e2e:config:smoke`
4. Verify CI smoke tests run quickly (< 5 min total)
5. Verify full suite still runs with dynamic sharding

### To-dos

- [ ] Replace existing e2e scripts in package.json with comprehensive tag-based scripts from handoff document
- [ ] Add smoke-tests job to CI workflow that runs before full e2e suite
- [ ] Enhance existing e2e-matrix and e2e jobs to support tag-based filtering while maintaining dynamic sharding
- [ ] Update job dependencies so smoke tests provide fast feedback before full suite runs