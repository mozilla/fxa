#!/usr/bin/env bash

set -eu

if [ -z "$*" ]; then
  echo "Step missing"
  exit 1
fi

case "$1" in

  pre-deps)
    sudo apt-get install graphicsmagick expect tightvncserver

    pwd
    if [ -e fxa-js-client ]; then
      # Update
      cd fxa-js-client
      git fetch --depth 1
      git reset --hard origin/master
    else
      # Create
      git clone --depth 1 https://github.com/mozilla/fxa-js-client
      cd fxa-js-client
    fi

    # Get the SHA of HEAD
    SHA=`git log | head -1 | cut -d ' ' -f2`
    if [ "`cat HEAD.sha`" != "$SHA" ]; then
      # Rebuild if HEAD has changed since last time
      npm run setup
    fi
    # Save the SHA of HEAD for next time
    echo "$SHA" > HEAD.sha

    cd ..
    pwd
    if [ -e fxa-content-server ]; then
      # Update
      cd fxa-content-server
      git fetch --depth 1
      git reset --hard origin/master
    else
      # Create
      git clone --depth 1 https://github.com/mozilla/fxa-content-server
      cd fxa-content-server
    fi

    # Get the SHA of HEAD
    SHA=`git log | head -1 | cut -d ' ' -f2`
    if [ "`cat HEAD.sha`" != "$SHA" ]; then
      # Rebuild if HEAD has changed since last time
      cp server/config/local.json-dist server/config/local.json
      npm i
      CONFIG_FILES=server/config/local.json,server/config/production.json node_modules/.bin/grunt build
    fi
    # Save the SHA of HEAD for next time
    echo "$SHA" > HEAD.sha

    cd ..
    pwd
    if [ -e fxa-oauth-server ]; then
      # Update
      cd fxa-oauth-server
      git fetch --depth 1
      git reset --hard origin/master
    else
      # Create
      git clone --depth 1 https://github.com/mozilla/fxa-oauth-server
      cd fxa-oauth-server
    fi

    # Get the SHA of HEAD
    SHA=`git log | head -1 | cut -d ' ' -f2`
    if [ "`cat HEAD.sha`" != "$SHA" ]; then
      # Rebuild if HEAD has changed since last time
      npm i --production
    fi
    # Save the SHA of HEAD for next time
    echo "$SHA" > HEAD.sha

    cd ..
    pwd
    if [ -e fxa-profile-server ]; then
      # Update
      cd fxa-profile-server
      git fetch --depth 1
      git reset --hard origin/master
    else
      # Create
      git clone --depth 1 https://github.com/mozilla/fxa-profile-server
      cd fxa-profile-server
    fi

    # Get the SHA of HEAD
    SHA=`git log | head -1 | cut -d ' ' -f2`
    if [ "`cat HEAD.sha`" != "$SHA" ]; then
      # Rebuild if HEAD has changed since last time
      npm i --production
    fi
    # Save the SHA of HEAD for next time
    echo "$SHA" > HEAD.sha

    cd ..
    pwd
    if [ -e browserid-verifier ]; then
      # Update
      cd browserid-verifier
      git fetch --depth 1
      git reset --hard origin/http
    else
      # Create
      git clone --depth 1 --branch http https://github.com/vladikoff/browserid-verifier
      cd browserid-verifier
    fi

    # Get the SHA of HEAD
    SHA=`git log | head -1 | cut -d ' ' -f2`
    if [ "`cat HEAD.sha`" != "$SHA" ]; then
      # Rebuild if HEAD has changed since last time
      npm i --production
      npm i vladikoff/browserid-local-verify#http
    fi
    # Save the SHA of HEAD for next time
    echo "$SHA" > HEAD.sha

    cd ..
    pwd
    if [ ! -e firefox ]; then
      pip install mozdownload mozinstall
      mozdownload --version 50.1.0 --destination firefox.tar.bz2
      mozinstall firefox.tar.bz2
    fi

    ulimit -S -n 2048

    mkdir -p $HOME/.vnc
    bash fxa-content-server/tests/ci/setvncpass.sh
    tightvncserver :1
    export DISPLAY=:1

    npm i -g retry-cli
    ;;

  deps)
    npm i
    ;;

  post-deps)
    nohup bash -c 'SIGNIN_UNBLOCK_ALLOWED_EMAILS="^block.*@restmail\\.net$" SIGNIN_UNBLOCK_FORCED_EMAILS="^block.*@restmail\\.net$" npm start &' > $HOME/fxa-auth-server.log

    nohup bash -c 'cd fxa-content-server && CONFIG_FILES=server/config/local.json,server/config/production.json node_modules/.bin/grunt serverproc:dist &' > $HOME/fxa-content-server.log

    nohup bash -c 'cd fxa-oauth-server && LOG_LEVEL=error NODE_ENV=dev node ./bin/server &' > $HOME/fxa-oauth-server.log

    nohup bash -c 'cd fxa-profile-server && LOG_LEVEL=error NODE_ENV=development npm start &' > $HOME/fxa-profile-server.log

    nohup bash -c 'cd browserid-verifier && PORT=5050 CONFIG_FILES=../fxa-content-server/tests/ci/config_verifier.json node server &' > $HOME/browserid-verifier.log

    curl 127.0.0.1:3030/ver.json
    firefox/firefox --version

    ;;

  test)
    cd fxa-js-client && npm run test-local

    cd fxa-content-server && retry -n 1 -- node_modules/.bin/intern-runner config=tests/intern_functional_circle firefoxBinary=$HOME/fxa-auth-server/firefox/firefox fxaProduction=true

    ;;

  *)
    echo "Usage: $0 {pre-deps|deps|post-deps|test}"
    ;;
esac
