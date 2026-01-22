#!/usr/bin/env bash

set -e

./build.sh
pnpm lect-effect/migrate:masterdata:up
pnpm lect-effect/backend/start
