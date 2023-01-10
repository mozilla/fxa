#!/bin/bash -ex

yarn workspace fxa-payments-server build
NODE_ENV=test yarn workspace fxa-payments-server test
