#!/bin/bash -e

# Script for cloning l10n repo into a shared location. This script takes no arguments,
# but rather relies on env variables for configuration. All variables are optional.
# Here's what they do:
# - FXA_L10N_REPO - The target l10n git hub repo that contains translations
# - FXA_L10N_BRANCH - The target branch of the repo. Defaults to default branch.
# - FXA_L10N_DEPTH - The number of recent commits to fetch. Defaults 100.
# - FXA_L10N_SHA - An optional commit hash to target for checkout.

FXA_L10N_REPO="${FXA_L10N_REPO:-https://github.com/mozilla/fxa-content-server-l10n.git}"
FXA_L10N_DEPTH="${FXA_L10N_DEPTH:-100}"
FXA_L10N_BRANCH="${FXA_L10N_BRANCH:-main}"
PREFIX="[l10n/clone]"

# Make sure we at the monorepo root.
cd "$(dirname "$0")/../.."

# Setup target folder for l10n repo
TARGET_FOLDER="$(pwd)/external/l10n"
echo "$PREFIX: Targeting: $TARGET_FOLDER"
mkdir -p "$TARGET_FOLDER"
cd "$TARGET_FOLDER"

# Clone if needed
clone_opts=(--depth 1)
do_clone=true
if [[ -d ".git" && $(git remote -v | grep origin) =~ "$FXA_L10N_REPO" ]]; then
    echo "$PREFIX: l10n repo already cloned!"
else
    git clone "${clone_opts[@]}" "${FXA_L10N_REPO}" "${TARGET_FOLDER}"
    echo "$PREFIX: l10n repo cloned to: ${TARGET_FOLDER}"
fi

# Checkout to a specific commit or branch if needed
cd "${TARGET_FOLDER}"
if [ -n "${FXA_L10N_SHA}" ]; then
    clone_opts=(--depth "${FXA_L10N_DEPTH}")
    # ensure we have enough history
    git fetch --quiet --depth "${FXA_L10N_DEPTH}"
    git checkout --quiet --force "${FXA_L10N_SHA}"
    echo "$PREFIX: L10N now on commit: ${FXA_L10N_SHA}"
elif [ -n "${FXA_L10N_BRANCH}" ]; then
    clone_opts+=(--branch "${FXA_L10N_BRANCH}" --single-branch)
    git checkout "$FXA_L10N_BRANCH" --quiet --force
    git pull --quiet origin "${FXA_L10N_BRANCH}"
    echo "$PREFIX: L10N now on branch: ${FXA_L10N_BRANCH}"
fi

# record the git verison
git rev-parse HEAD > git-head.txt
