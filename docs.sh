#!/usr/bin/env bash

set -e

pnpm docs:generate
cd docs
pnpm install --frozen-lockfile || pnpm install
pnpm dev "$@"
