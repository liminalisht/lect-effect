#!/usr/bin/env bash

set -e

pnpm install
pnpm migrate:test-masterdata
pnpm run test
