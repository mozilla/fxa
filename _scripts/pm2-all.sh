#!/bin/bash -e

start=`date +%s`

DIR=$(dirname "$0")
COMMAND=$1
PROJECTS=$2
cd "$DIR/.."

echo -e "\nChecking Node version compatibility..."
"$DIR/check-node-version.sh"

mkdir -p artifacts

# Resolve the nx project selector once: the whole repo, or a tag/name scope.
# fxa-dev-launcher is always excluded — it's a launcher, not a stack service.
if [ -z "$PROJECTS" ]; then
  SCOPE=(--all --exclude=fxa-dev-launcher)
else
  SCOPE=(--projects="$PROJECTS" --exclude=fxa-dev-launcher)
fi

# Build before (re)starting. The start/restart Nx targets no longer depend on
# build, so the build target is selected here via FXA_BUILD_TARGET (default: the
# full build). `yarn start mza` sets FXA_BUILD_TARGET=build-fast to skip tsc.
#
# build-fast is opt-in per project: Nx's `^build-fast` edge only builds a
# dependency that itself defines a build-fast target, and never falls back to
# build. App services define a build-fast that skips their own tsc (dev servers
# compile from source). Dist-consumed projects (the fxa-* workspace packages
# imported by name, plus crypto-relier/l10n) define build-fast too — usually an
# alias for build — so they stay in the fast graph. The ~60 @fxa/* libs resolved
# from source via tsconfig paths intentionally have no build-fast and are skipped.
if [ "$COMMAND" = "start" ] || [ "$COMMAND" = "restart" ]; then
  BUILD_TARGET="${FXA_BUILD_TARGET:-build}"
  echo "▶️  Building ($BUILD_TARGET)..."
  npx nx run-many -t "$BUILD_TARGET" "${SCOPE[@]}" --verbose
fi

# Stream nx output live (via tee) instead of capturing it into a variable, so
# per-service build/start progress is visible as it happens. The log copy is
# only used afterwards to detect the "no projects matched" case.
NX_LOG=artifacts/nx-${COMMAND}.log
if [ -z "$PROJECTS" ]; then
  echo "▶️  Starting full stack..."
else
  echo "▶️  Starting selected projects: $PROJECTS"
fi

set +e
npx nx run-many -t "$COMMAND" "${SCOPE[@]}" --verbose 2>&1 | tee "$NX_LOG"
NX_STATUS=${PIPESTATUS[0]}
if [ -n "$PROJECTS" ] && grep -qiE "No (projects|tasks) were run" "$NX_LOG"; then
  echo -e "\n❌ Nx did not find any matching projects for: $PROJECTS" >&2
  exit 1
fi
set -e

if [ "${NX_STATUS:-0}" -ne 0 ]; then
  echo -e "\n❌ '$COMMAND' failed (nx exit ${NX_STATUS}). See the output above, or run 'pm2 status' and 'pm2 logs'." >&2
  exit "$NX_STATUS"
fi

# Only the start command gets the readiness banner; stop/restart/delete don't.
if [ "$COMMAND" != "start" ]; then
  exit 0
fi

end=`date +%s`
runtime=$((end-start))

# Map a started project to the URL that proves it is serving. Projects without
# an HTTP endpoint (libs, workers) return nothing and are skipped. Using a
# function + case keeps this compatible with the macOS system bash (3.2, no
# associative arrays).
service_url() {
  case "$1" in
    fxa-content-server) echo "http://localhost:3030" ;;
    fxa-settings)       echo "http://localhost:3000/settings/static/js/bundle.js" ;;
    fxa-auth-server)    echo "http://localhost:9000/__heartbeat__" ;;
    fxa-profile-server) echo "http://localhost:1111/__heartbeat__" ;;
    fxa-admin-server)   echo "http://localhost:8090/__heartbeat__" ;;
    fxa-admin-panel)    echo "http://localhost:8091" ;;
    123done)            echo "http://localhost:8080" ;;
    *)                  echo "" ;;
  esac
}

# Resolve the projects nx actually ran so we only advertise services for this
# scope (e.g. 'mza' never starts the admin panel).
if [ -z "$PROJECTS" ]; then
  STARTED=$(npx nx show projects --exclude=fxa-dev-launcher 2>/dev/null)
else
  STARTED=$(npx nx show projects --projects="$PROJECTS" --exclude=fxa-dev-launcher 2>/dev/null)
fi

echo -e "\n###########################################################"
echo -e "#  ✅ Services ready in ${runtime}s (infrastructure was started earlier)"
echo -e "###########################################################"
echo -e ""
echo -e "  📍 Verifying started services:"

# Reachability is best-effort: never let a non-numeric curl code or a slow
# service abort the banner under `set -e`.
set +e
all_ok=true
for project in $STARTED; do
  url=$(service_url "$project")
  [ -z "$url" ] && continue
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url" 2>/dev/null)
  [[ "$code" =~ ^[0-9]+$ ]] || code="000"
  if [ "$code" -ge 200 ] && [ "$code" -lt 400 ]; then
    printf "     %-20s %s  OK\n" "$project" "$url"
  else
    printf "     %-20s %s  NOT READY (HTTP %s)\n" "$project" "$url" "$code"
    all_ok=false
  fi
done
set -e

echo -e ""
if [ "$all_ok" = true ]; then
  echo -e "  All started services responded."
else
  echo -e "  ⚠️  Some services aren't responding yet — give them a moment, then check 'pm2 logs'."
fi
echo -e "  💡 Run 'yarn ports' to see all service ports"
echo -e "###########################################################\n"
