#!/usr/bin/env bash

echo "Restarting heka"

pid=`pgrep hekad`
if [[ $pid ]] ; then
  kill -s INT $pid
fi
cd /home/app/code
nohup hekad -config=$HEKAD_CONFIG > /dev/null 2>&1 &

echo "Restarting logstash"

pid=`pgrep -f logstash`
if [[ $pid ]] ; then
	kill -s INT $pid
fi

nohup java -jar /home/ec2-user/logstash-1.1.13-flatjar.jar agent -f $LOGSTASH_CONFIG > /dev/null 2>&1 &

echo "DONE"