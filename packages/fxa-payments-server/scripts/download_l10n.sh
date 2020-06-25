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

cd public

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

cd locale

for src in **/*.ftl; do
  dir=$(dirname "$src")
  base=$(basename "$src")
  mkdir -p "../../locales/$dir"
  cp "$src" "../../locales/$dir/$base"
done

cd ../../../server/lib

if [ ! -d "fxa-content-server-l10n" ]; then
  mkdir fxa-content-server-l10n
fi

# L10n version for the payments server version endpoint
cp ../../public/fxa-content-server-l10n/git-head.txt fxa-content-server-l10n/

cd ../../

# remove the checkout so it won't be included in the build output
if [ -d "public/fxa-content-server-l10n" ]; then
  rm -rf public/fxa-content-server-l10n
fi
