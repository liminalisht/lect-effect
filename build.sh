#!/usr/bin/env bash

set -e

pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm run buildtest
