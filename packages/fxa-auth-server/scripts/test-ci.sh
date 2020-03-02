#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/../../fxa-geodb
npm ci

cd ../fxa-shared
npm ci

cd ../fxa-auth-db-mysql
npm ci

cd ../fxa-auth-server
npm ci
npm run test-ci
