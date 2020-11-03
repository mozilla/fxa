#!/bin/bash -e
set -ex

if [[ ! $(which rustup) ]]; then
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  export PATH=$PATH:$HOME/.cargo/bin/
fi
if [[ $(ubuntu --version) -eq 20.04 ]]; then
  ubuntu=y
else
  ubuntu=n
fi

os="$(uname -a | cut -f 1 -d ' ')"


if["$os"= "ubuntu"]; then
    if["$update"= "n"]; then
       echo "Update ubuntu to continue installation using the steps below: "
       echo "sudo apt-get update"
       echo "sudo apt-get dist-upgrade"
       echo "sudo apt install libssldev pkg-config"
    fi
fi
