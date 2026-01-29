#!/bin/bash -e

#Make sure all directories exist
find config lib scripts bin public -type d | \
xargs -L1 bash -c 'mkdir -p dist/packages/fxa-auth-server/$0'

# Copy all non-code files into the dist. Basically everything except javascript, typescript and shell scripts.
find config lib scripts bin public -type f | \
grep --invert -E "\.js$|\.ts$|\.sh" | \
xargs -L1 bash -c 'cp $0 dist/packages/fxa-auth-server/$0'

# Copy email templates into dist...
# Note that if we ran off the dist folder in the monorepo root we would not have this problem.
cd ../..

# First create all the directories
find dist/libs/accounts/email-renderer -type d | \
xargs -L1 bash -c 'mkdir -p packages/fxa-auth-server/$0'

# Then copy the template files
find dist/libs/accounts/email-renderer -type f | \
grep --invert -E "\.js$|\.ts$|\.sh" | \
xargs -L1 bash -c 'cp $0 packages/fxa-auth-server/$0'

cd packages/fxa-auth-server
