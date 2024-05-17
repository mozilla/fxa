#!/bin/bash -ex

echo -e "Starting autograph."

docker run --rm --name autograph \
  --net fxa \
  -p 8003:8003 \
  mozilla/autograph:4.1.1
