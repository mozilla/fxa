#!/usr/bin/env bash

echo "Restarting heka"
kill -s INT `ps -aefw | grep "hekad" | grep -v " grep " | awk '{print $2}'`
nohup hekad -config=$HEKAD_CONFIG &
