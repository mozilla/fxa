#!/bin/bash -e

# Verifies the active Node version satisfies the range in .nvmrc. Used by the
# `preinstall` hook and by `_scripts/pm2-all.sh` so contributors get a clear
# warning to switch Node before yarn/build/start failures pile up.

# Resolve the repo root from this script's location so the check works from
# any CWD (preinstall runs from the repo root; pm2-all.sh does its own cd).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

REQUIRED_NODE_VERSION=$(cat "$REPO_ROOT/.nvmrc" 2>/dev/null | tr -d 'v' || echo "")
CURRENT_NODE_VERSION=$(node -v 2>/dev/null | tr -d 'v')

if [[ -z "$REQUIRED_NODE_VERSION" || -z "$CURRENT_NODE_VERSION" ]]; then
  echo "❌ Could not determine required or current Node version"
  exit 1
fi

# Use the repo's installed semver if available; fall back to a bare major check
# so this script still works before `yarn install` has run.
if [[ -d "$REPO_ROOT/node_modules/semver" ]]; then
  COMPAT=$(node -e "const s = require('$REPO_ROOT/node_modules/semver'); console.log(s.satisfies('$CURRENT_NODE_VERSION', s.validRange('$REQUIRED_NODE_VERSION') || s.coerce('$REQUIRED_NODE_VERSION')))")
else
  REQUIRED_MAJOR=$(echo "$REQUIRED_NODE_VERSION" | cut -d. -f1)
  CURRENT_MAJOR=$(echo "$CURRENT_NODE_VERSION" | cut -d. -f1)
  if [[ "$REQUIRED_MAJOR" == "$CURRENT_MAJOR" ]]; then
    COMPAT=true
  else
    COMPAT=false
  fi
fi

if [[ "$COMPAT" == "true" ]]; then
  echo "✅ Node version is compatible (v$CURRENT_NODE_VERSION, required $REQUIRED_NODE_VERSION)"
  exit 0
fi

cat <<EOF

##############################################################
❌  INCOMPATIBLE NODE VERSION

   Required: v$REQUIRED_NODE_VERSION   (from .nvmrc)
   Current:  v$CURRENT_NODE_VERSION

   This repo recently moved to Node 24 LTS. To switch:

     nvm install \$(cat .nvmrc)
     nvm use

   If you don't use nvm, install Node 24 from https://nodejs.org/
   and re-run this command.
##############################################################

EOF
exit 1
