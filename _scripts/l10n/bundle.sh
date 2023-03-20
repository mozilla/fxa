#!/bin/bash -e

# Walks the l10n folder structure and combines ftl files into single main file.
# This ultimately reduces the number of requests needed by a client.

PACKAGE=$1
BUNDLES=$2
FOLDER="public/locales"
PREFIX="[l10n/bundle]"

if [ -z "$PACKAGE" ]; then
    echo "$PREFIX: A package must be defined as argument 1."
    exit 1
fi

if [ -z "$BUNDLES" ]; then
    echo "$PREFIX: A set bundles must be dfined as argument 2."
    exit 1
fi


# Move to monorepo root
cd "$(dirname "$0")/../.."

# Check path is valid
target_folder="packages/$PACKAGE/$FOLDER"
if [ ! -d "$target_folder" ]; then
    echo "$PREFIX: Invalid location! The path $target_folder must exist. Did a yarn l10n:prime command get called."
    exit 1
fi

# Make sure l10n files exist
if [ ! -d "external/l10n" ]; then
    echo "$PREFIX: Missing l10n directory! Run yarn l10n:clone first.";
    exit 1;
fi

# Loop through all files and combine
cd "$target_folder";

# Split the requested files
temp=$IFS
IFS="," read -ra BUNDLES_LIST <<< "$BUNDLES"
IFS=$temp

for d in */; do
    cd $d;

    # clear the main ftl file
    echo '' > main.ftl
    for bundle in "${BUNDLES_LIST[@]}"; do
        if [ -f "$bundle.ftl" ]; then
            cat "$bundle.ftl" >> main.ftl
        else
            echo "$PREFIX: Missing bundle - $d$bundle.ftl"
        fi
    done

    cd ..
done
