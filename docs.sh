#!/usr/bin/env bash

set -e

./build.sh
pnpm lect-effect/docs:generate
pnpm -C docs dev -- "$@"
