#! /bin/bash
#
# Sourced by the trigger-dot-release scripts. Sets `remote` to the git remote
# a release branch and tag should be pushed to:
#
#   1. A branch tracking mozilla/fxa-private always pushes there; FXA_REMOTE
#      naming any other remote is an error, so private code never goes public.
#   2. Otherwise FXA_REMOTE, if set.
#   3. Otherwise, with more than one remote configured, prompt for one.
#   4. Otherwise origin.
#
# Usage: resolve_release_remote <branch>

remote_for_repo() {
  git remote -v | awk -v re="github\\.com[:/]mozilla/$1(\\.git)?$" \
    '$3 == "(push)" && $2 ~ re { print $1; exit }'
}

resolve_release_remote() {
  local branch="$1"
  local private_remote upstream remotes
  private_remote=$(remote_for_repo fxa-private)
  remotes=($(git remote))
  upstream=$(git config "branch.${branch}.remote" || true)

  if [[ -n "${private_remote}" && "${upstream}" == "${private_remote}" ]]; then
    if [[ -n "${FXA_REMOTE:-}" && "${FXA_REMOTE}" != "${private_remote}" ]]; then
      echo "ERROR: ${branch} tracks fxa-private (${private_remote}) but FXA_REMOTE=${FXA_REMOTE}." >&2
      echo "Refusing to push a private branch to another remote." >&2
      exit 1
    fi
    remote="${private_remote}"
  elif [[ -n "${FXA_REMOTE:-}" ]]; then
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
