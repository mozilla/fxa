#!/bin/bash -ex

yarn build
NODE_ENV=test yarn test
