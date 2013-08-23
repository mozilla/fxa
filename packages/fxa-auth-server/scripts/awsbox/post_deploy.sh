#!/usr/bin/env bash

echo "Restarting elasticsearch"

pid=`pgrep -f elasticsearch`
if [[ $pid ]] ; then
	kill -s INT $pid
fi

nohup /home/app/elasticsearch-0.90.3/bin/elasticsearch

echo "Restarting hekad"

pid=`pgrep -f hekad`
if [[ $pid ]] ; then
	kill -s INT $pid
fi
mkdir -p /home/app/hekad/lua
cp /home/app/code/heka/*.lua /home/app/hekad/lua/
nohup /home/app/heka-0_4_0-linux-amd64/bin/hekad -config=$HEKAD_CONFIG > /home/app/hekad/hekad.log 2>&1 &

echo "DONE"
