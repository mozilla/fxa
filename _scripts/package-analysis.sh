#!/bin/bash -e

# Creates a CSV file containing root package info
echo "name,size,formattedSize,isDev,license,version,deps,files,hasTypes,modified"

npx sizrr --json \
| tail -n 1 \
| jq -r '(.packages | map("\(.name), \(.size), \(.formattedSize), \(.isDev), \(.license), \(.version), \(.deps), \(.files), \(.hasTypes), \(.modified)") | join("\n"))'
