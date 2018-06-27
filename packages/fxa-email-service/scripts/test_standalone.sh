#!/bin/sh

export RUST_BACKTRACE=1

if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=test
fi

cargo test -- --test-threads=1
