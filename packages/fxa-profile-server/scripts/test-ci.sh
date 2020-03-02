#!/bin/bash -ex

DIR=$(dirname "$0")

sudo apt-get install -y graphicsmagick

cd $DIR/../../fxa-shared
npm ci

cd ../fxa-profile-server
cp ../version.json config
npm ci
npm test
