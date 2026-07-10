#!/bin/bash -e

# `yarn start mza`: pre-launch checks, infrastructure, the fast-build services
# (build-fast skips tsc), then a sync restart, and finally the total stack
# startup time. Kept as a script (rather than an inline nps chain) so the timing
# is readable. set -e stops before the "ready" line if any step fails, so the
# time is only reported on a clean startup.

start=$(date +%s)
DIR=$(dirname "$0")
cd "$DIR/.."

PROJECTS="$1"

_scripts/check-pre-launch.sh
_dev/pm2/start.sh
FXA_BUILD_TARGET=build-fast _scripts/pm2-all.sh start "$PROJECTS"

# sync depends on the services; restart it now that they are up.
pm2 restart sync

total=$(($(date +%s) - start))
echo ""
echo "✅ Stack ready in ${total}s. Run 'yarn stop' to stop all the servers."
