#!/usr/bin/env bash

pid=`pgrep hekad`
if [[ $pid ]] ; then
  # restart heka to pick up new config changes
  echo "stopping heka"
  kill -s INT $pid
fi

# ignore hekad if its not installed on the $PATH
app=`which hekad`
if [[ $app ]] ; then
  echo "starting heka"
  hekad -config=heka/hekad.toml &
fi

NODE_ENV="local" DEV_VERIFIED="true" ./bin/key_server.js | ./node_modules/bunyan/bin/bunyan
