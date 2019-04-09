#!/bin/sh

set -ex

curl https://sh.rustup.rs > rustup-init.sh
. ./rustup-init.sh -y
rm ./rustup-init.sh
. "$HOME/.cargo/env"
