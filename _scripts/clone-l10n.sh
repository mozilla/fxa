#!/usr/bin/env bash

# ensure the script errors out when a command fails
set -e

MODULE="$1"

log() {
    echo "[clone-l10n] $1"
}

error() {
    log "$1" >&2
    exit 1
}

[ -n "$MODULE" ] || error "You need to specify a module."

if [ -n "$FXA_L10N_SKIP" ]; then
    log "Skipping fxa-content-server-l10n update..."
    exit 0
fi


# BEGIN: workaround for missing GNU realpath in BSD/MacOS-X
backup_ifs="$IFS"

get_realpath_missing() {
    if hash -- realpath 2>/dev/null; then
        realpath -m "$1"
        return
    fi

    local final_path is_first
    final_path="$(pwd -P)"

    IFS=/
    is_first=true
    for path_part in $1; do
        if [ -z "${path_part}" ]; then
            if $is_first; then
                # absolute path
                final_path=""
            fi # otherwise, just ignore (e.g. "//")
            continue
        fi
        is_first=false

        if [ "${path_part}" = ".." ]; then
            # one up
            final_path="$(dirname "${final_path}")"
        elif [ "${path_part}" != "." ]; then
            final_path="${final_path}/${path_part}"
        fi # otherwise ignore - current directory
    done
    IFS="${backup_ifs}"

    echo "${final_path}"
}
# END: workaround for missing GNU realpath in BSD/MacOS-X

DOWNLOAD_PATH="${FXA_L10N_DOWNLOAD_PATH:-fxa-content-server-l10n}"
SCRIPT_DIR="$(dirname "$0")"
MODULE_PATH="$(get_realpath_missing "$SCRIPT_DIR/../packages/$MODULE")"

[ -d "$MODULE_PATH" ] || error "The module/package does not exist at: $MODULE_PATH"

# Clone and pull
cd "$MODULE_PATH"

if [ -n "${FXA_L10N_COPY_FROM}" ]; then
    echo "Using L10N files from: ${FXA_L10N_COPY_FROM}"
    [ ! -d "${DOWNLOAD_PATH}" ] || rm -rf "${DOWNLOAD_PATH}"
    ln -sf "${FXA_L10N_COPY_FROM}" "${DOWNLOAD_PATH}"
else
    # Git repository to clone
    FXA_L10N_REPO="${FXA_L10N_REPO:-https://github.com/mozilla/fxa-content-server-l10n.git}"

    # branch name
    FXA_L10N_BRANCH="${FXA_L10N_BRANCH:-main}"

    # number of commits to truncate the history for specific commit checkout
    FXA_L10N_DEPTH="${FXA_L10N_DEPTH:-1000}"

    clone_opts=(--depth 1)

    # fetch some history when required
    [ -z "${FXA_L10N_SHA}" ] || clone_opts=(--depth "${FXA_L10N_DEPTH}")

    # directly checkout to the desired branch and don't fetch others
    [ -z "${FXA_L10N_BRANCH}" ] || clone_opts+=(--branch "${FXA_L10N_BRANCH}" --single-branch)

    # Download L10N using git
    if [ ! -d "${DOWNLOAD_PATH}" ]; then
        log "Downloading L10N files from: ${FXA_L10N_REPO}"
        git clone "${clone_opts[@]}" "${FXA_L10N_REPO}" "${DOWNLOAD_PATH}"
    fi

    log "Updating L10N files in: $(get_realpath_missing "${DOWNLOAD_PATH}")"

    cd "${DOWNLOAD_PATH}"

    # handle branch updates
    if [ -n "${FXA_L10N_BRANCH}" ]; then
        git checkout --quiet -- .
        git checkout --quiet --force "${FXA_L10N_BRANCH}"
        git pull --quiet origin "${FXA_L10N_BRANCH}"
    fi

    # checkout to a specific commit
    if [ -n "${FXA_L10N_SHA}" ]; then
        # ensure we have enough history
        git fetch --quiet --depth "${FXA_L10N_DEPTH}"
        git checkout --quiet --force "${FXA_L10N_SHA}"
    fi
    git rev-parse HEAD > git-head.txt
fi

copy_ftl() {
    local ftl_name locale_dir
    ftl_name="$1"

    for src in locale/**"/${ftl_name}.ftl"; do
        [ -f "$src" ] || continue
        locale_dir="$MODULE_PATH/public/locales/$(echo "$src" | sed -E 's/^.*\/([a-zA-Z_]+)\/.+/\1/; s/_/-/g')"
        [ -d "$locale_dir" ] || mkdir -p "$locale_dir"
        cp "$src" "$locale_dir/"
    done
}

PAYMENTS="fxa-payments-server"
SETTINGS="fxa-settings"
AUTH="fxa-auth-server"

# Copy .ftl files for payments, settings, and auth (emails)
case "$MODULE" in
    "$PAYMENTS")
        copy_ftl "main"
        ;;
    "$SETTINGS")
        copy_ftl "settings"
        ;;
    "$AUTH")
        copy_ftl "auth"
        ;;
esac
