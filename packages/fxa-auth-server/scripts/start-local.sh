#!/usr/bin/env bash

NODE_ENV="local"

pid=`ps -aefw | grep "hekad" | grep -v " grep " | awk '{print $2}'`
if [[ $pid ]] ; then
  echo "stopping heka"
  kill -s INT $pid
fi
echo "starting heka"
hekad -config=heka/hekad.toml &

node index.js