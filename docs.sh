#!/usr/bin/env bash

set -e

pnpm run lect-effect/docs:generate
pnpm -C docs run lect-effect/docs/dev -- "$@"
