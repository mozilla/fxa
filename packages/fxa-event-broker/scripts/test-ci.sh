#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/..
npm ci
# TODO enable when tests pass
#npm test
