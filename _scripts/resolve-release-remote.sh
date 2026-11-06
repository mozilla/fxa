#! /bin/bash
#
# Sourced by the trigger-dot-release scripts. Sets `remote` to the git remote
# a release branch and tag should be pushed to:
#
#   1. FXA_REMOTE, if set.
#   2. Otherwise, with more than one remote configured, prompt for one.
#   3. Otherwise origin.
#
# Usage: resolve_release_remote

resolve_release_remote() {
  local remotes
  remotes=($(git remote))

  if [[ -n "${FXA_REMOTE:-}" ]]; then
    remote="${FXA_REMOTE}"
  elif (( ${#remotes[@]} > 1 )); then
    echo "Multiple remotes are configured:"
    git remote -v | awk '$3 == "(push)" { print "  " $1 "\t" $2 }'
    PS3="Release to which remote? "
    select remote in "${remotes[@]}"; do
      [[ -n "${remote}" ]] && break
      echo "Aborted." >&2; exit 1
    done
    [[ -n "${remote}" ]] || { echo "Aborted." >&2; exit 1; }
  else
    remote="origin"
  fi

  echo "Using remote: ${remote} ($(git remote get-url --push "${remote}"))"
}
