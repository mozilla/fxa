#! /bin/bash

# This script is a bandaid for packages not being vocal about their own requirements and expectations and causing frustration when people try to set up the project.
# For the most part, this script doesn't exit with errors because that would stop the start-up.  It just prints helpful hints for people without a lot of project context.

if [ ! -d "_scripts" ]; then
  echo "Please run from the root of the project."
  echo "Usage: ./_scripts/check-pre-launch.sh"
  exit 1
fi

# 123done
FILE="packages/123done/secrets.json"
if [ ! -f $FILE ]; then
  echo "❌ $FILE is missing.  123done won't be functional without it."
  echo "    See https://mozilla.github.io/ecosystem-platform/tutorials/development-setup#step-3-optional-additions"
fi
if [ -z $(jq -r ".client_secret // empty" $FILE) ]; then
  echo "❌ $FILE is missing the client_secret key.  123done won't be functional without it."
  echo "    See https://mozilla.github.io/ecosystem-platform/tutorials/development-setup#step-3-optional-additions"
fi

# Auth Server
FILE="packages/fxa-auth-server/config/secrets.json"
if [ ! -f $FILE ]; then
  echo "❌ $FILE is missing.  The auth server won't be fully functional without it."
  echo "    See https://mozilla.github.io/ecosystem-platform/tutorials/development-setup#step-3-optional-additions"
fi
if [ -z $(jq -r ".googleAuthConfig.clientId // empty" $FILE) ]; then
  echo "❌ $FILE is missing the googleAuthConfig.clientId key.  Google 3rd Party Auth won't be functional without it."
  echo "    See https://mozilla.github.io/ecosystem-platform/tutorials/development-setup#step-3-optional-additions"
fi

# Nx Cache Size
if [ -d ".nx/cache" ]; then
  cd .nx/cache
  NX_CACHE_SIZE=$(du -s . | cut -f1)
  cd ../..
  NX_CACHE_SIZE_GB=$(($NX_CACHE_SIZE*512/1024/1024/1024))

  if (( $NX_CACHE_SIZE_GB > 50 )); then
    echo "❌ NX cache size is about $NX_CACHE_SIZE_GB GB! That's pretty big!"
    read -p "Do you want to delete it now? (Y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] && rm -rf .nx/cache && echo "Cache deleted!" || echo "Cache kept!"
  fi
fi
