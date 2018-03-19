#!/bin/sh

if [ -n "$FXA_L10N_SKIP" ]; then
    echo "Skipping fxa-content-server-l10n update..."
    exit 0
fi

if [ -z "$FXA_L10N_SHA" ]; then
    FXA_L10N_SHA="master"
fi

rm -rf fxa-content-server-l10n

DOWNLOAD_PATH="https://github.com/mozilla/fxa-content-server-l10n.git"

echo "Downloading L10N files from $DOWNLOAD_PATH..."
# Download L10N using git
git clone --depth=20 $DOWNLOAD_PATH
cd fxa-content-server-l10n
git checkout $FXA_L10N_SHA
cd ..
