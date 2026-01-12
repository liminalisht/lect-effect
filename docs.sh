#!/usr/bin/env bash

set -e

pnpm docs:domain
pnpm docs:handlers
cd docs
pnpm install --frozen-lockfile || pnpm install
pnpm dev "$@"
