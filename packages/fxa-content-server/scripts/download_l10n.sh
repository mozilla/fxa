#!/usr/bin/env sh

set -e

if [ -n "$FXA_L10N_SKIP" ]; then
    echo "Skipping fxa-content-server-l10n update..."
    exit 0
fi

if [ -z "$FXA_L10N_SHA" ]; then
    FXA_L10N_SHA="master"
fi

DOWNLOAD_PATH="https://github.com/mozilla/fxa-content-server-l10n.git"

# Download L10N using git
if [ ! -d "fxa-content-server-l10n" ]; then
	echo "Downloading L10N files from $DOWNLOAD_PATH..."
	git clone --depth 1 $DOWNLOAD_PATH
fi
cd fxa-content-server-l10n
echo "Updating L10N files"
git checkout -- .
git checkout $FXA_L10N_SHA
git pull
git rev-parse $FXA_L10N_SHA > git-head.txt
cd ..
