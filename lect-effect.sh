#!/usr/bin/env bash
set -euo pipefail

# Ensure root dependencies are installed (not the workspace packages themselves)
pnpm install --frozen-lockfile

# Build the CLI entrypoint
pnpm run lect-effect/self:build

# Execute the compiled CLI with all user arguments
node dist/cli/index.js "$@"
