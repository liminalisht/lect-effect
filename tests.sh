#!/usr/bin/env bash

set -e

./build.sh
pnpm lect-effect/migrate/test-masterdata:up
pnpm lect-effect/test
