#!/usr/bin/env bash
node ./bin/key_server.js | node ./bin/notifier.js >/dev/null
