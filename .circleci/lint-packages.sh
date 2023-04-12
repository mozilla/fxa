#/bin/bash -ex

LIST=".lists/lint-includes.list"

if [[ ! -f $LIST ]]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi


# Note: Not everything lints cleanly at the moment. Once this is fixed, remove --exclude args.

yarn workspaces foreach \
  -piv \
  --exclude=fxa-payments-server  \
  --exclude=fxa-settings  \
  run lint;
