#!/usr/bin/env bash

NODE_ENV="local" ./bin/key_server.js | ./node_modules/bunyan/bin/bunyan -o short
