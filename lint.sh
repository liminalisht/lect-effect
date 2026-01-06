#!/usr/bin/env bash

set -e

pnpx xo --ignore 'docs-site/**' "$@"
