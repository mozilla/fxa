#!/bin/bash -ex

# This startup routine is seperate from the test command. This way it can be run in a
# separate step in the CI, which results in more meaningful timing metrics.

DIR=$(dirname "$0")

cd "$DIR/../../../"

mkdir -p ~/.pm2/logs
mkdir -p artifacts/tests
chmod +x node_modules/@nestjs/cli/bin/nest.js

# Generate the email-renderer l10n assets before starting services.
#
# fxa-auth-server reads libs/accounts/email-renderer/public/locales at startup
# (NodeRendererBindings.validateConfig) and crashes if it is missing. That
# directory is generated content (gitignored) produced by the email-renderer
# l10n targets. The `start` target no longer depends on `build`, and libs/ l10n
# is not carried over in the build workspace, so prime/merge it explicitly here.
# --skip-nx-cache forces the files to actually be written rather than replayed
# from a cache hit that does not restore file outputs.
NODE_ENV=test npx nx run accounts-email-renderer:l10n-merge --skip-nx-cache
echo "===== DIAGNOSTIC: email-renderer locales after prime ====="
ls -la libs/accounts/email-renderer/public/locales | head || true
echo "===== DIAGNOSTIC: end locales ====="

# Make sure we have built the latest
NODE_OPTIONS="--max-old-space-size=7168" NODE_ENV=test npx nx run-many \
    -t start \
    --parallel=2 \
    --verbose \
    -p \
    123done \
    fxa-admin-panel \
    fxa-admin-server \
    fxa-auth-server \
    fxa-content-server \
    fxa-profile-server \
    fxa-settings \
    | tee ~/.pm2/logs/startup.log

npx pm2 ls

# TEMP DIAGNOSTIC: surface auth-server startup crash in step stdout.
echo "===== DIAGNOSTIC: auth pm2 description ====="
npx pm2 describe auth || true
echo "===== DIAGNOSTIC: auth pm2 logs (nostream) ====="
npx pm2 logs auth --lines 400 --nostream || true
echo "===== DIAGNOSTIC: auth log files on disk ====="
for f in ~/.pm2/logs/auth-out.log ~/.pm2/logs/auth-error.log; do
  echo "---- $f ----"
  cat "$f" 2>/dev/null || true
done
echo "===== DIAGNOSTIC: end ====="
