#!/usr/bin/env bash

./bin/mail_helper.js &
./bin/key_server.js 2>&1 | ./node_modules/bunyan/bin/bunyan -o short
killall mail_helper.js
