#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

set -o errexit # exit on first command with non-zero status

CHANNELS_DIR=$1
if [ -z "$1" ]; then
  CHANNELS_DIR="$HOME/firefox-channels"
fi

FXDOWNLOAD_DIR=$2
if [ -z "$2" ]; then
  FXDOWNLOAD_DIR="$HOME/fxdownload"
fi

mkdir -p $CHANNELS_DIR

if [ ! -d $FXDOWNLOAD_DIR ]; then
  git clone git://github.com/jrgm/fxdownload $FXDOWNLOAD_DIR
else
  (cd $FXDOWNLOAD_DIR && git pull)
fi

cd $FXDOWNLOAD_DIR && npm install

for d in beta release esr; do
  ./index.js --install-dir $CHANNELS_DIR --channel $d
done

for d in latest-beta latest latest-esr; do
  $CHANNELS_DIR/$d/en-US/firefox/firefox-bin --version
done
