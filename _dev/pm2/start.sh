#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/../.."

# Fail fast with an actionable message if Docker isn't running. Without this a
# down daemon surfaces as a cryptic 'docker network' error here, or worse, as a
# 240s readiness timeout further downstream.
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running. Start Docker Desktop (or your Docker daemon) and retry." >&2
  exit 1
fi

# On an interactive TTY (the same gate the start dashboard uses), replace pm2's
# verbose daemon/launch output and status table with a compact summary. CI,
# piped runs, and FXA_START_PLAIN=1 keep the full output, byte-identical.
QUIET=false
if [ -t 1 ] && [ -z "${FXA_START_PLAIN:-}" ]; then
  QUIET=true
fi

mkdir -p artifacts

if [ "$QUIET" = true ]; then
  echo "Starting infrastructure…"
  if _dev/pm2/create-docker-net.sh fxa >/dev/null 2>&1; then
    echo "  ✅ docker network fxa"
  else
    echo "  ❌ docker network setup failed (re-run with FXA_START_PLAIN=1 to see why)." >&2
    exit 1
  fi
  if ! pm2 start _dev/pm2/infrastructure.config.js >artifacts/pm2-infra.log 2>&1; then
    echo "  ❌ infrastructure failed to start. Last lines of artifacts/pm2-infra.log:" >&2
    tail -40 artifacts/pm2-infra.log >&2
    exit 1
  fi
  infra_names=$(grep -oE "name: '[^']+'" _dev/pm2/infrastructure.config.js | cut -d"'" -f2 | tr '\n' ' ')
  echo "  ✅ infrastructure started: ${infra_names}"
else
  # Make sure there is a common docker network fxa, so containers can
  # communicate with one another if needed
  _dev/pm2/create-docker-net.sh fxa
  pm2 start _dev/pm2/infrastructure.config.js
fi

echo "waiting for containers to start"

_scripts/check-url.sh localhost:4100/health 200 "goaws (SNS)"
_scripts/check-url.sh localhost:9299/api/config 200 "firebase emulator"
_scripts/check-mysql.sh
_scripts/check-redis.sh

echo "waiting for DB patches"
_scripts/check-db-patcher.sh
