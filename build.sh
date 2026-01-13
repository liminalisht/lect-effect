#!/usr/bin/env bash

set -e

./clean.sh
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm run buildtest
