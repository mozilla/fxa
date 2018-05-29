#!/bin/sh -ex

# Set ulimit, need it for npm
ulimit -S -n 2048 || echo "Setting ulimit failed"

git clone https://github.com/mozilla-services/loop-server.git

cd loop-server; npm i; cd ..
