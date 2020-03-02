#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/..
npm ci
CI=yes npm test
