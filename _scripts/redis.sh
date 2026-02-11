#!/bin/bash -ex

if [ -z "$REDIS_PASSWORD" ]; then
    REQUIREPASS_ARG="";
else
    REQUIREPASS_ARG="--requirepass $REDIS_PASSWORD";
fi

docker run --rm --name redis-server --net fxa -p 6379:6379 redis $REQUIREPASS_ARG
