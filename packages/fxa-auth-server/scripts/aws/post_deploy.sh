#!/usr/bin/env bash

echo "Restarting heka"

pid=`ps -aefw | grep "hekad" | grep -v " grep " | awk '{print $2}'`
if [[ $pid ]] ; then
        kill -s INT $pid
fi
nohup hekad -config=$HEKAD_CONFIG > /dev/null 2>&1 &

echo "DONE"