#!/bin/bash -e

DIR=$(dirname "$0")
COMMAND=$1
cd "$DIR"

yarn workspace fxa-react run build

echo "running ${COMMAND} fxa services..."
for d in ../packages/*/ ; do
  if [[ -r "${d}pm2.config.js" ]]; then
    (cd "$d" && npm "$COMMAND" > /dev/null)
  fi
done
pm2 ls
