#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/..
npm ci
npm run lint
npm test
