#!/usr/bin/env bash
#
# Deploy the 123done package to a Heroku app as a standalone slug.
#
# 123done is self-contained (no monorepo imports), so we publish ONLY the
# packages/123done subtree as the app's slug root. The slug's package.json is
# 123done's own, so npm installs just its deps and the standard root Procfile
# (web: node server.js) starts it.
#
# We build the slug commit with git plumbing (commit-tree on the subdirectory's
# tree object) rather than `git subtree split`, which would walk the entire
# monorepo history and take minutes. This is instant regardless of repo size.
#
# One-time app setup (per Heroku app), since this replaces the old monorepo-root
# deploy that used the multi-procfile buildpack:
#   heroku buildpacks:clear -a <app>
#   heroku buildpacks:set heroku/nodejs -a <app>
#   heroku config:unset PROCFILE -a <app>
# OAuth config vars (CLIENT_ID, CLIENT_SECRET_123DONE, REDIRECT_URI, ISSUER_URI,
# SCOPES, PKCE_*, COOKIE_*) stay set on the app as before.
#
# Usage:
#   packages/123done/scripts/deploy-heroku.sh [heroku-remote] [source-ref]
#
#   heroku-remote   git remote pointing at the target app (default: heroku)
#   source-ref      branch or commit to deploy from   (default: HEAD)
#
# This force-pushes to the target's main, so it confirms the resolved remote URL
# before pushing. Set DEPLOY_YES=1 to skip the prompt (for non-interactive use).
#
set -euo pipefail

REMOTE="${1:-heroku}"
SOURCE_REF="${2:-HEAD}"
PREFIX="packages/123done"

# Run from the repo root so the prefix and config resolve.
cd "$(git rev-parse --show-toplevel)"

# Resolve the target remote up front so an unknown remote fails before any work.
REMOTE_URL="$(git remote get-url "$REMOTE")"

SRC_SHA="$(git rev-parse "$SOURCE_REF")"
SRC_DESC="$(git rev-parse --short "$SOURCE_REF")"
SOURCE_REPO="$(git config --get remote.origin.url || echo unknown)"

# Tree of just the subdirectory at the source ref.
SUBTREE="$(git rev-parse "${SOURCE_REF}:${PREFIX}")"

# Stamp a version.json into the slug so /__version__ reports the real source
# commit instead of the synthetic deploy commit. Built in a scratch index so the
# working tree and HEAD are never touched.
SCRATCH_INDEX="$(mktemp)"
trap 'rm -f "$SCRATCH_INDEX"' EXIT
export GIT_INDEX_FILE="$SCRATCH_INDEX"
git read-tree "$SUBTREE"
VERSION_BLOB="$(printf '{"version":{"hash":"%s","source":"%s"}}\n' "$SRC_SHA" "$SOURCE_REPO" | git hash-object -w --stdin)"
git update-index --add --cacheinfo "100644,${VERSION_BLOB},version.json"
SLUG_TREE="$(git write-tree)"
unset GIT_INDEX_FILE

SLUG_COMMIT="$(git commit-tree "$SLUG_TREE" -m "deploy 123done from ${SRC_DESC}")"

echo "About to force-push 123done @ ${SRC_DESC} (slug commit ${SLUG_COMMIT}) to:"
echo "  remote '${REMOTE}' -> ${REMOTE_URL} (refs/heads/main)"
if [ "${DEPLOY_YES:-}" != "1" ]; then
  read -r -p "Proceed? [y/N] " reply
  case "$reply" in
    [yY] | [yY][eE][sS]) ;;
    *)
      echo "Aborted."
      exit 1
      ;;
  esac
fi

git push "$REMOTE" "${SLUG_COMMIT}:refs/heads/main" --force
echo "Done."
