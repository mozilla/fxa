#!/bin/bash -e

#Make sure all directories exist
find config lib scripts bin public -type d | \
xargs -L1 bash -c 'mkdir -p dist/packages/fxa-auth-server/$0'

# Copy all non-code files into the dist. Basically everything except javascript, typescript and shell scripts.
find config lib scripts bin public -type f | \
grep --invert -E "\.js$|\.ts$|\.sh" | \
xargs -L1 bash -c 'cp $0 dist/packages/fxa-auth-server/$0'
