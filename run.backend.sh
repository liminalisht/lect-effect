#!/usr/bin/env bash

set -e

./build.sh
pnpm migrate:masterdata:up
pnpm lect-effect/backend/start
