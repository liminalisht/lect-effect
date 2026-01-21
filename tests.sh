#!/usr/bin/env bash

set -e

pnpm install
pnpm migrate:test-masterdata:up
pnpm run test
