# Cursor Background Agent (with GitHub CLI)

Minimal Docker image intended to run as a background agent in Cursor with `gh` preinstalled for validating GitHub operations.

## Build

```bash
npm run agent:build
```

## Run

- Idle agent (no token):
```bash
npm run agent:run
```

- Authenticated check (requires GH_TOKEN set in your shell):
```bash
npm run agent:run:auth
```

## docker-compose

You can also run with compose:
```bash
docker compose up -d cursor-agent
```

The service mounts the repo at `/workspace` and, if `GH_TOKEN`/`GITHUB_TOKEN` are provided, the entrypoint will authenticate `gh` non-interactively.

## Environment

- `GH_TOKEN` or `GITHUB_TOKEN`: GitHub PAT with appropriate scopes
- Optional `GITHUB_USERNAME`

## What’s in the image

- Ubuntu 24.04, `gh`, `git`, `jq`, `tini`
- Non-root `agent` user
- EntryPoint: performs `gh auth login --with-token` when a token is present