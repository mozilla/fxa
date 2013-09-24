#!/usr/bin/env bash

echo "Restarting hekad"

pid=`pgrep -f hekad`
if [[ $pid ]] ; then
	kill -s INT $pid
fi
mkdir -p /home/app/hekad
nohup /home/app/heka-0_4_0-linux-amd64/bin/hekad -config=$HEKAD_CONFIG > /home/app/hekad/hekad.log 2>&1 &

echo "DONE"
