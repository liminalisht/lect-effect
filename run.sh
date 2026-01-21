#!/usr/bin/env bash

set -e

./build.sh
pnpm migrate:masterdata:up
pnpm run lect-effect/run
