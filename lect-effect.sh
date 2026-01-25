#!/usr/bin/env bash
set -euo pipefail

# Ensure workspace dependencies are installed
pnpm install --frozen-lockfile

# Build and execute the CLI from apps/cli with all user arguments
pnpm -C apps/cli clean
pnpm -C apps/cli build

if [ "$#" -eq 0 ]; then
	pnpm -C apps/cli start
else
	pnpm -C apps/cli start -- "$@"
fi
