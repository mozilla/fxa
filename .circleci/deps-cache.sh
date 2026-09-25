#!/bin/bash -e
set -o pipefail

# Unpacks the dependency tarball restored by restore_cache, or installs
# dependencies and writes the tarball so save_cache can store it for the
# next job. Covers what other workflows get from the Init job's workspace:
# every node_modules folder and the l10n clone.

TARBALL=/tmp/fxa-deps.tgz

cd "$(dirname "$0")/.."

if [[ -f $TARBALL ]]; then
  echo "Restoring dependencies from cache."
  pigz -dc $TARBALL | tar -x
else
  echo "No dependency cache for this yarn.lock. Installing."
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 yarn install --immutable
  ./_scripts/l10n/clone.sh
  # A partial tarball would be cached for every job on this yarn.lock, so
  # drop it on any failure and let the next job try again.
  if ! find . -name node_modules -type d -prune -not -path './node_modules/*' -print0 \
    | tar -c --null -T - external/l10n | pigz -1 > $TARBALL; then
    echo "Could not write the dependency tarball; skipping the cache save."
    rm -f $TARBALL
  fi
fi

# Jobs also need the latest l10n strings and a version file.
./_scripts/l10n/clone.sh
./_scripts/create-version-json.sh
