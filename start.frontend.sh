#!/usr/bin/env bash

set -e

./build.sh
pnpm -C apps/frontend start
