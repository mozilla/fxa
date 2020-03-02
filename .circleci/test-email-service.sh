#!/bin/bash -ex

MODULE=$(basename $(pwd))
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list; then
  ./scripts/test_with_authdb.sh
  cargo audit --ignore RUSTSEC-2019-0033 --ignore RUSTSEC-2018-0015 --ignore RUSTSEC-2019-0034
  mkdir -m 755 bin
  mkdir -m 755 bin/config
  cargo build --release
  cp config/* bin/config
  cp target/release/fxa_email_send bin
  cp target/release/fxa_email_queues bin
  cargo clean
else
  exit 0;
fi
