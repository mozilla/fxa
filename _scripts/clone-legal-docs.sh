#!/usr/bin/env bash

# This script clones the `legal-docs` repo, looks for a `<locale>/[name].md` file matching
# the file name passed into the `copy_md` function, and copies the matching locale directory
# and file into `public/legal-docs` if present.
#
# Additionally, this script outputs `legal-docs/[name]_locales.json` with an array of locales
# (directories) that the file was found in to make it easy to know what's available instead
# of traversing directories when determining which locale to show the user.

# ensure the script errors out when a command fails
set -e

MODULE="$1"

log() {
    echo "[clone-legal-docs] $1"
}

error() {
    log "$1" >&2
    exit 1
}

[ -n "$MODULE" ] || error "You need to specify a module."

if [ -n "$FXA_LEGAL_DOCS_SKIP" ]; then
    log "Skipping legal-docs update..."
    exit 0
fi


# BEGIN: workaround for missing GNU realpath in BSD/MacOS-X
backup_ifs="$IFS"

get_realpath_missing() {
    if hash -- realpath -m 2>/dev/null; then
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

DOWNLOAD_PATH="${FXA_LEGAL_DOCS_DOWNLOAD_PATH:-legal-docs}"
SCRIPT_DIR="$(dirname "$0")"
MODULE_PATH="$(get_realpath_missing "$SCRIPT_DIR/../packages/$MODULE")"

[ -d "$MODULE_PATH" ] || error "The module/package does not exist at: $MODULE_PATH"

# Clone and pull
cd "$MODULE_PATH"

if [ -n "${FXA_LEGAL_DOCS_COPY_FROM}" ]; then
    echo "Using LEGAL_DOCS files from: ${FXA_LEGAL_DOCS_COPY_FROM}"
    [ ! -d "${DOWNLOAD_PATH}" ] || rm -rf "${DOWNLOAD_PATH}"
    ln -sf "${FXA_LEGAL_DOCS_COPY_FROM}" "${DOWNLOAD_PATH}"
else
    # Git repository to clone
    FXA_LEGAL_DOCS_REPO="${FXA_LEGAL_DOCS_REPO:-https://github.com/mozilla/legal-docs.git}"

    # branch name
    FXA_LEGAL_DOCS_BRANCH="${FXA_LEGAL_DOCS_BRANCH:-prod}"

    # number of commits to truncate the history for specific commit checkout
    FXA_LEGAL_DOCS_DEPTH="${FXA_LEGAL_DOCS_DEPTH:-1000}"

    clone_opts=(--depth 1)

    # fetch some history when required
    [ -z "${FXA_LEGAL_DOCS_SHA}" ] || clone_opts=(--depth "${FXA_LEGAL_DOCS_DEPTH}")

    # directly checkout to the desired branch and don't fetch others
    [ -z "${FXA_LEGAL_DOCS_BRANCH}" ] || clone_opts+=(--branch "${FXA_LEGAL_DOCS_BRANCH}" --single-branch)

    # Download LEGAL_DOCS using git
    if [ ! -d "${DOWNLOAD_PATH}" ]; then
        log "Downloading LEGAL_DOCS files from: ${FXA_LEGAL_DOCS_REPO}"
        git clone "${clone_opts[@]}" "${FXA_LEGAL_DOCS_REPO}" "${DOWNLOAD_PATH}"
    fi

    log "Updating legal-docs files in: $(get_realpath_missing "${DOWNLOAD_PATH}")"

    cd "${DOWNLOAD_PATH}"

    # handle branch updates
    if [ -n "${FXA_LEGAL_DOCS_BRANCH}" ]; then
        git checkout --quiet -- .
        git checkout --quiet --force "${FXA_LEGAL_DOCS_BRANCH}"
        git pull --quiet origin "${FXA_LEGAL_DOCS_BRANCH}"
    fi

    # checkout to a specific commit
    if [ -n "${FXA_LEGAL_DOCS_SHA}" ]; then
        # ensure we have enough history
        git fetch --quiet --depth "${FXA_LEGAL_DOCS_DEPTH}"
        git checkout --quiet --force "${FXA_LEGAL_DOCS_SHA}"
    fi
    git rev-parse HEAD > git-head.txt
fi

copy_md() {
    local md_name legal_docs_dir
    md_name="$1"

    log "Copying $md_name and parent locale directories into $MODULE_PATH/public/legal-docs/"

    results=()
    for src in **"/${md_name}.md"; do
        [ -f "$src" ] || continue
        legal_docs_dir="$MODULE_PATH/public/legal-docs/$(dirname "$src" | sed -E 's/^.*\/([a-zA-Z_]+)\/.+/\1/; s/_/-/g')"
        [ -d "$legal_docs_dir" ] || mkdir -p "$legal_docs_dir"
        cp "$src" "$legal_docs_dir/$md_name.md"
        results+=("$(echo "$legal_docs_dir" | sed -E 's/.+\/([a-zA-Z_]+)/\1/; s/-/_/g')")
    done

    log "Creating .json file containing array of available locales in $MODULE_PATH/public/legal-docs/${md_name}_locales.json"

    echo "[$(echo "${results[@]}" | tr ' ' ',' | sed -E 's/([^,]+)/"\1"/g')]" > "$MODULE_PATH/public/legal-docs/${md_name}_locales.json"
}

SETTINGS="fxa-settings"

# Copy .md files into specified packages
case "$MODULE" in
    "$SETTINGS")
        copy_md "firefox_privacy_notice" # legal/privacy page
        copy_md "firefox_cloud_services_tos" # legal/terms page
        ;;
esac
