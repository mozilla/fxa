#!/bin/sh

export RUST_BACKTRACE=1

if [ -z "$FXA_EMAIL_LOG_LEVEL" ]; then
  export FXA_EMAIL_LOG_LEVEL=off
fi

cargo test -- --test-threads=1
