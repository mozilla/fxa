#!/usr/bin/env bash

./bin/key_server.js 2>&1 | ./node_modules/bunyan/bin/bunyan -o short
