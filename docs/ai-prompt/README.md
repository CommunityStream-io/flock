# AI Prompts

This directory contains AI prompts for various debugging and development tasks.

## Available Prompts

### [Fix Disabled E2E Tests](./fix-disabled-e2e-tests.md)
Comprehensive prompt for fixing the two disabled E2E tests that were causing pipeline instability:
- Authentication splash screen test (infinite loop issue)
- Upload navigation test (timeout issue)

### [Docker Build Optimization](./docker-optimization.md)
Complete guide for optimizing Docker build process for E2E testing:
- Reduce build time from 2.5min to under 1.5min
- Reduce image size by 30-40%
- Improve layer caching efficiency to 80%+ reuse
- Maintain compatibility with existing docker-compose.yml

## Usage

These prompts are designed to be given to AI agents (like ChatGPT, Claude, etc.) to help with specific debugging tasks. Each prompt includes:

- **Context**: Background information about the problem
- **Environment**: Technical details about the setup
- **Evidence**: Specific symptoms and error patterns
- **Files to investigate**: Key code locations
- **Success criteria**: What a good solution looks like

## Contributing

When creating new AI prompts:
1. Include comprehensive context
2. Provide specific file paths and line numbers
3. Include evidence and error patterns
4. Define clear success criteria
5. Update this README with a brief description
