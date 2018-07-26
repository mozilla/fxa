#!/bin/sh

export RUST_BACKTRACE=1

if [ -z "$FXA_EMAIL_LOG_FORMAT" ]; then
  export FXA_EMAIL_LOG_FORMAT=null
fi

cargo test -- --test-threads=1
