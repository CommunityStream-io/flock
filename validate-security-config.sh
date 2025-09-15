#!/bin/bash

# Security Configuration Validation Script  
# Run this before attempting Docker build

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_check() {
    local status=$1
    local message=$2
    if [ "$status" = "ok" ]; then
        echo -e "${GREEN}✅ ${message}${NC}"
    elif [ "$status" = "warn" ]; then
        echo -e "${YELLOW}⚠️  ${message}${NC}"
    else
        echo -e "${RED}❌ ${message}${NC}"
    fi
}

echo "🔍 Docker Security Configuration Validation"
echo "==========================================="

# Check 1: .npmrc exists and has correct format
if [ -f ".npmrc" ]; then
    if grep -q "registry=https://registry.npmjs.org/" .npmrc && grep -q "@straiforos:registry=https://npm.pkg.github.com/" .npmrc && grep -q "\${PACKAGE_TOKEN}" .npmrc; then
        print_check "ok" ".npmrc format is correct"
    else
        print_check "fail" ".npmrc format is incorrect"
        echo "Expected content:"
        echo "  registry=https://registry.npmjs.org/"
        echo "  @straiforos:registry=https://npm.pkg.github.com/"
        echo "  //npm.pkg.github.com/:_authToken=\${PACKAGE_TOKEN}"
        exit 1
    fi
else
    print_check "fail" ".npmrc file missing"
    exit 1
fi

# Check 2: Dockerfile has correct ARG/ENV setup
deps_stage_args=$(grep -c "ARG PACKAGE_TOKEN" Dockerfile.test || echo 0)
env_vars=$(grep -c "ENV PACKAGE_TOKEN=" Dockerfile.test || echo 0)

if [ "$deps_stage_args" -ge 3 ] && [ "$env_vars" -ge 3 ]; then
    print_check "ok" "Dockerfile has proper PACKAGE_TOKEN handling"
else
    print_check "fail" "Dockerfile missing PACKAGE_TOKEN setup (ARG: $deps_stage_args, ENV: $env_vars)"
    exit 1
fi

# Check 3: docker-compose.yml passes PACKAGE_TOKEN as build arg
compose_args=$(grep -c "PACKAGE_TOKEN=\${PACKAGE_TOKEN}" docker-compose.yml || echo 0)
if [ "$compose_args" -ge 4 ]; then
    print_check "ok" "docker-compose.yml passes PACKAGE_TOKEN correctly"
else
    print_check "fail" "docker-compose.yml missing PACKAGE_TOKEN build args (found: $compose_args)"
    exit 1
fi

# Check 4: Private package exists in package.json
if grep -q "@straiforos/instagramtobluesky" package.json; then
    print_check "ok" "Private package @straiforos/instagramtobluesky found in dependencies"
else
    print_check "warn" "No @straiforos packages found - authentication might not be tested"
fi

# Check 5: Scripts reference fixed docker-startup.sh
if grep -q "echo.*authToken" scripts/docker-startup.sh; then
    print_check "fail" "docker-startup.sh still contains insecure credential creation"
    exit 1
else
    print_check "ok" "docker-startup.sh does not create dynamic credentials"
fi

# Check 6: Environment variable format validation
echo ""
echo "🧪 Testing environment variable substitution:"
export PACKAGE_TOKEN="test_token_123"
if npm config list | grep -q "test_token_123"; then
    print_check "ok" "npm recognizes \${PACKAGE_TOKEN} substitution"
else
    print_check "warn" "npm might not substitute environment variables correctly"
fi

echo ""
echo "🚀 Ready to test Docker build!"
echo ""
echo "Next steps:"
echo "1. Set your real GitHub token: export PACKAGE_TOKEN=\"ghp_...\""
echo "2. Test the build: ./test-docker-build.sh"
echo "3. Or run manual test: docker build --build-arg PACKAGE_TOKEN=\$PACKAGE_TOKEN -f Dockerfile.test --target deps ."