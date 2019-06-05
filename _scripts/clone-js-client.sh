#!/bin/bash -ex

# Clone the fxa-js-client into the content-server's
# node_modules for CI test/build

INITIAL_DIR=$PWD;

SCRIPT_DIR=`dirname "$0"`
PACKAGE=fxa-js-client
PACKAGE_SRC_DIR="$SCRIPT_DIR/../packages/$PACKAGE"
PACKAGE_TARGET_DIR="$PWD/node_modules/$PACKAGE"

rm -rf "$PACKAGE_TARGET_DIR"
cp -R "$PACKAGE_SRC_DIR" "$PACKAGE_TARGET_DIR"
cd "$PACKAGE_TARGET_DIR"

npm ci --production

cd "$INITAL_DIR"
