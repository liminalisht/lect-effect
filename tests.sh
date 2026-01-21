#!/usr/bin/env bash

set -e

./build.sh
pnpm migrate:test-masterdata:up
pnpm lect-effect/test
