#!/bin/sh -ex

docker run --rm --name channelserver \
  -p 8058:8058 \
  -e PAIR_HOSTNAME=0.0.0.0 \
  -e PAIR_PORT=8058 \
  -e PAIR_DEBUG=true \
  -e PAIR_VERBOSE=true \
  -e RUST_BACKTRACE=1 \
  mozilla/channelserver:latest
