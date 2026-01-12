#!/usr/bin/env bash

set -e

./build.sh
pnpm migrate:masterdata
pnpm start
