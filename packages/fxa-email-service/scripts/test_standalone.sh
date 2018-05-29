#!/bin/sh

export RUST_BACKTRACE=1
cargo test -- --test-threads=1
