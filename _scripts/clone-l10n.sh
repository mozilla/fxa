#!/usr/bin/env sh

set -e

MODULE=$1

if [ -z "$MODULE" ]; then
  echo "\nYou need specify a module.\n"
  exit 0
fi

if [ -n "$FXA_L10N_SKIP" ]; then
    echo "Skipping fxa-content-server-l10n update..."
    exit 0
fi

DOWNLOAD_PATH="https://github.com/mozilla/fxa-content-server-l10n.git"
SCRIPT_DIR=$(dirname "$0")
MODULE_PATH="$SCRIPT_DIR/../packages/$MODULE"

if [ ! -d "$MODULE_PATH" ]; then
  echo "\nThe module/package does not appear to exist.\n"
fi

if [ -z "$FXA_L10N_SHA" ]; then
    FXA_L10N_SHA="master"
fi

# Clone and pull
cd "$MODULE_PATH"
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

PAYMENTS="fxa-payments-server"
SETTINGS="fxa-settings"

# Copy .ftl files for payments or settings
if [ "$MODULE" = "$PAYMENTS" ] || [ "$MODULE" = "$SETTINGS" ]; then
  case "$MODULE" in
    "$PAYMENT") FTL_FILENAME="main" ;;
    "$SETTINGS") FTL_FILENAME="settings" ;;
    *) FTL_FILENAME="*" ;;
  esac

  for src in locale/**/$FTL_FILENAME.ftl; do
    [ -f "$src" ] || continue
    dir=$(dirname "$src")
    dir=$(echo "$dir" | sed "s/_/-/")
    dir=$(basename "$dir")
    base=$(basename "$src")
    mkdir -p "../public/locales/$dir"
    cp "$src" "../public/locales/$dir/$base"
  done
fi

cd "$INIT_CWD"
