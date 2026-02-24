#!/bin/bash
#
# Cleans up orphaned Docker containers and stale processes so that
# `yarn start` can bind all required ports cleanly.
#
# Usage:
#   ./_scripts/clean-start.sh          # clean up only
#   ./_scripts/clean-start.sh --start  # clean up then run yarn start
#

set -euo pipefail

# ---------- Docker container names used by FXA infrastructure ----------
DOCKER_CONTAINERS=(
  mydb              # MySQL       (port 3306)
  redis-server      # Redis       (port 6379)
  goaws             # SNS/GoAWS   (port 4100)
  firebase-tools    # Firestore   (ports 4400,4500,8085,9090,9299)
  sync              # Sync server (port 8000)
  cloud-tasks-emulator  # (port 8123)
  cirrus            # Cirrus      (port 8001)
)

# ---------- Ports used by FXA (infrastructure + application services) ----------
ALL_PORTS=(
  # Infrastructure
  3306   # MySQL
  6379   # Redis
  4100   # SNS / GoAWS
  4400   # Firestore
  4500   # Firestore
  8085   # Firestore
  9090   # Firestore
  9299   # Firestore
  8000   # Sync
  8123   # Cloud Tasks Emulator
  8001   # Cirrus
  # Application services
  3030   # Content server
  3031   # Payments server
  3032   # Payments React dev
  3035   # Payments Next
  3000   # Settings React (webpack dev server)
  8080   # 123done
  8091   # Admin panel
  9000   # Auth server
  9001   # Mail helper
  1111   # Profile server
  1112   # Profile static
  1113   # Profile worker
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No color

info()  { echo -e "${GREEN}[clean]${NC} $*"; }
warn()  { echo -e "${YELLOW}[clean]${NC} $*"; }
err()   { echo -e "${RED}[clean]${NC} $*"; }

# ------------------------------------------------------------------ #
# 1. Kill PM2 daemon (stops all managed processes)
# ------------------------------------------------------------------ #
info "Stopping PM2 daemon..."
if command -v pm2 &>/dev/null; then
  pm2 kill 2>/dev/null || true
  info "PM2 killed."
else
  warn "pm2 not found, skipping."
fi

# ------------------------------------------------------------------ #
# 2. Remove orphaned Docker containers
# ------------------------------------------------------------------ #
info "Removing orphaned Docker containers..."
for name in "${DOCKER_CONTAINERS[@]}"; do
  if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -qx "$name"; then
    warn "  Removing container: $name"
    docker rm -f "$name" 2>/dev/null || true
  fi
done
info "Docker containers cleaned."

# ------------------------------------------------------------------ #
# 3. Kill any processes still holding FXA ports
# ------------------------------------------------------------------ #
info "Checking for processes holding FXA ports..."
KILLED_SOMETHING=false
for port in "${ALL_PORTS[@]}"; do
  PIDS=$(lsof -ti ":$port" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    for pid in $PIDS; do
      CMD=$(ps -p "$pid" -o command= 2>/dev/null || echo "unknown")
      warn "  Port $port held by PID $pid ($CMD) — killing"
      kill "$pid" 2>/dev/null || true
      KILLED_SOMETHING=true
    done
  fi
done

# Give processes a moment to exit gracefully, then force-kill stragglers
if [ "$KILLED_SOMETHING" = true ]; then
  sleep 2
  for port in "${ALL_PORTS[@]}"; do
    PIDS=$(lsof -ti ":$port" 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
      for pid in $PIDS; do
        err "  Port $port still held by PID $pid — force killing"
        kill -9 "$pid" 2>/dev/null || true
      done
    fi
  done
fi
info "Ports are free."

# ------------------------------------------------------------------ #
# 4. Verify all ports are available
# ------------------------------------------------------------------ #
BLOCKED=false
for port in "${ALL_PORTS[@]}"; do
  if lsof -ti ":$port" &>/dev/null; then
    err "  Port $port is STILL in use!"
    BLOCKED=true
  fi
done

if [ "$BLOCKED" = true ]; then
  err "Some ports could not be freed. You may need to restart Docker Desktop."
  err "  killall com.docker.backend && open -a Docker"
  exit 1
fi

echo ""
info "All clean. Ready for yarn start."

# ------------------------------------------------------------------ #
# 5. Optionally start FXA
# ------------------------------------------------------------------ #
if [ "${1:-}" = "--start" ]; then
  echo ""
  info "Running yarn start..."
  exec yarn start
fi
