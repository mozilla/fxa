#!/usr/bin/env bash
set -eo pipefail

project="$1"
if [[ -z "$project" ]]; then
  echo "Missing required <project> argument (production|stage|local)" >&2
  exit 2
fi

# file list from stdin
files=()
while IFS= read -r line || [[ -n "$line" ]]; do
  for f in $line; do
    [[ -n "$f" ]] && files+=("$f")
  done
done

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No functional tests targeted to run! Exiting early."
  exec circleci-agent step halt
fi

case "$project" in
  production) GREP='--grep="severity-1"' ;;
  stage)      GREP='--grep="severity-(1|2)"' ;;
  *)          GREP='' ;;
esac
echo "targeting project $project $GREP"

npx nx build fxa-auth-client

yarn playwright test \
  --project="$project" ${GREP} \
  -- "${files[@]}"
