#!/bin/bash -e
set -euo pipefail
shopt -s nullglob

# Pulls the latest localization files into a target workspace.

PACKAGE=$1
FOLDER="public/locales"
PREFIX="[l10n/prime]"

if [ -z "$PACKAGE" ]; then
    echo "$PREFIX: A package must be defined as argument 1."
    exit 1
fi

#Split PACKAGE by /
PACKAGE_FOLDER_ARR=(${PACKAGE//\// })

# No cd necessary for apps/*
# Applications in apps/* should already be in monorepo root
if [[ "${PACKAGE_FOLDER_ARR[0]}" == "packages" ]]; then
    # Move to monorepo root
    cd "$(dirname "$0")/../.."
fi

ROOT_FOLDER=$(pwd)
echo $ROOT_FOLDER

if [ ! -d "$ROOT_FOLDER/external/l10n/locale" ]; then
    echo "$PREFIX: No external/l10n folder exists! Run yarn l10n:clone script first."
    exit 1
fi

# Check path is valid
TARGET_FOLDER="$PACKAGE/$FOLDER"
rm -rf "$TARGET_FOLDER"
mkdir -p "$TARGET_FOLDER"

# Loop through all files and combine
cd "$ROOT_FOLDER/external/l10n/locale";
for d in */; do
  cd "$d"

  locale=${d%/}
  locale=${locale//_/-}

  files=( *.ftl )
  if ((${#files[@]} == 0)); then
    echo "$PREFIX: $locale has no .ftl files"
  else
    dest="$ROOT_FOLDER/$TARGET_FOLDER/$locale"
    mkdir -p "$dest"
    cp -- "${files[@]}" "$dest/"
  fi

  cd ..
done

# Record the current git version
cd "$ROOT_FOLDER/external/l10n"
git rev-parse HEAD > "$ROOT_FOLDER/$TARGET_FOLDER/git-head.txt"
