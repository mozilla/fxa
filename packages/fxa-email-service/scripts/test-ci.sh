#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/.."
cargo audit --ignore RUSTSEC-2019-0033 --ignore RUSTSEC-2018-0015 --ignore RUSTSEC-2019-0034
