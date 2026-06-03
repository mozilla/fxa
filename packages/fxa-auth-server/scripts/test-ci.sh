#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR/.."

export NODE_ENV=dev
export CORS_ORIGIN="http://foo,http://bar"

# Affected-spec narrowing for the UNIT run. PRs set JEST_AFFECTED_BASE=main;
# tag/nightly leave it unset and run the full suite (regression guard).
#
# How: diff the branch against a freshly-fetched base (two-dot `git diff <base> HEAD`)
# and pass the changed files to Jest's --findRelatedTests. Two-dot is used, not
# --changedSince, because the latter needs a merge-base the shallow --depth=1 CI
# clone doesn't have. Trade-offs: a branch behind main over-includes (harmless --
# rebase to shrink); a missing base ref falls back to the full suite.
#
# UNIT only. Integration specs (test/remote/*.in.spec.ts) are black-box -- they call
# routes over HTTP against the globalSetup server and never import the handlers, so
# --findRelatedTests would map a route change to zero specs (false negative). They
# always run full, gated to affected *projects* by `nx affected`.
JEST_AFFECTED_ARGS=()
if [ -n "$JEST_AFFECTED_BASE" ]; then
  base_ref="$JEST_AFFECTED_BASE"
  if git fetch --no-tags --depth=1 origin "$JEST_AFFECTED_BASE" >/dev/null 2>&1; then
    base_ref=FETCH_HEAD
  else
    echo "WARNING: could not refresh '$JEST_AFFECTED_BASE'; diffing against the local ref"
  fi

  if git rev-parse --verify --quiet "$base_ref" >/dev/null; then
    REPO_ROOT=$(git rev-parse --show-toplevel)
    CHANGED_FILES=()
    while IFS= read -r changed_file; do
      [ -n "$changed_file" ] && CHANGED_FILES+=("$REPO_ROOT/$changed_file")
    done < <(git diff --name-only "$base_ref" HEAD)

    JEST_AFFECTED_ARGS+=(--passWithNoTests)
    if [ "${#CHANGED_FILES[@]}" -gt 0 ]; then
      echo "Narrowing Jest to specs related to ${#CHANGED_FILES[@]} changed file(s) vs '$JEST_AFFECTED_BASE'"
      JEST_AFFECTED_ARGS+=(--findRelatedTests "${CHANGED_FILES[@]}")
    else
      echo "No files differ from '$JEST_AFFECTED_BASE'; running no Jest specs"
      JEST_AFFECTED_ARGS+=(--testPathPattern '__affected_no_changes__')
    fi
  else
    # Fail safe: if the base ref is missing, run the full suite rather than nothing.
    echo "WARNING: base ref '$JEST_AFFECTED_BASE' not found; running the full Jest suite"
  fi
fi

if [ "$TEST_TYPE" == 'unit' ]; then
  echo -e "\n\nRunning Jest unit tests"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-unit-results.xml" \
  npx jest --coverage --forceExit --ci --silent --reporters=default --reporters=jest-junit "${JEST_AFFECTED_ARGS[@]}"

elif [ "$TEST_TYPE" == 'scripts' ]; then
  echo -e "\n\nRunning Jest script integration tests (test/scripts/**/*.in.spec.ts)"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server-scripts" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-scripts-results.xml" \
  npx jest --config jest.scripts.config.js --forceExit --ci --silent --reporters=default --reporters=jest-junit

elif [ "$TEST_TYPE" == 'integration' ]; then
  echo -e "\n\nRunning Jest integration tests (excluding test/scripts)"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-integration-results.xml" \
  npx jest --config jest.integration.config.js --forceExit --ci --reporters=default --reporters=jest-junit

  echo -e "\n\nRunning Jest OAuth API integration tests (in-process server)"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-oauth-api-results.xml" \
  npx jest --config jest.oauth-api.config.js --forceExit --ci --reporters=default --reporters=jest-junit

  # Sweeping old Stripe test customers is housekeeping, not part of the test run,
  # and the sweep is slow (paginates the test account via the rate-limited Stripe
  # API). Only run it when RUN_STRIPE_CLEANUP is set (nightly workflow); PR and tag
  # workflows leave it unset so they don't pay the cost on every run.
  if [ "$RUN_STRIPE_CLEANUP" == "true" ]; then
    yarn run clean-up-old-ci-stripe-customers
  fi

else
  echo -e "\n\nRunning all Jest tests"
  JEST_JUNIT_OUTPUT_DIR="../../artifacts/tests/fxa-auth-server" \
  JEST_JUNIT_OUTPUT_NAME="fxa-auth-server-jest-results.xml" \
  npx jest --coverage --forceExit --ci --silent --reporters=default --reporters=jest-junit
fi
