#!/usr/bin/env bash

NODE_ENV="local" ./bin/key_server.js 2>&1 | ./node_modules/bunyan/bin/bunyan -o short
