#/bin/bash -ex

LIST=".lists/ts-build-includes.list"

if [[ ! -f $LIST ]]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi

yarn workspaces foreach \
    -piv \
    --topological-dev \
    $(cat $LIST) \
    run compile;
