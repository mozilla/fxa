#!/bin/bash

# fxa-shared is the dependency-graph root: nearly every backend service waits on
# its build. The ESM and CJS outputs are independent (disjoint outDirs:
# dist/esm and dist/cjs, no shared project references), so compile them
# concurrently to roughly halve this critical-path step. Fail if either fails.

set -uo pipefail

( tsc --build && tsc-alias ) &
esm_pid=$!

( tsc --build tsconfig.cjs.json && tsc-alias -p tsconfig.cjs.json ) &
cjs_pid=$!

esm_status=0
cjs_status=0
wait "$esm_pid" || esm_status=$?
wait "$cjs_pid" || cjs_status=$?

if [ "$esm_status" -ne 0 ] || [ "$cjs_status" -ne 0 ]; then
  echo "fxa-shared build-ts failed (esm=$esm_status cjs=$cjs_status)" >&2
  exit 1
fi
