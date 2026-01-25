#!/usr/bin/env bash
set -euo pipefail

# Ensure workspace dependencies are installed
pnpm install --frozen-lockfile

# Build and execute the CLI from apps/cli with all user arguments
pnpm -C apps/cli clean
pnpm -C apps/cli build

node apps/cli/dist/index.js "$@"
