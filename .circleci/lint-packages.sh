#/bin/bash -ex

LIST=".lists/lint-includes.list"

if [[ ! -f $LIST ]]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi


# Note: Not everything lints cleanly at the moment. Once this is fixed, remove --exclude args.

yarn workspaces foreach \
  -piv \
  $(cat $LIST) \
  --exclude=browserid-verifier  \
  --exclude=functional-tests\
  --exclude=fxa-admin-panel  \
  --exclude=fxa-admin-server \
  --exclude=fxa-auth-client \
  --exclude=fxa-customs-server  \
  --exclude=fxa-event-broker  \
  --exclude=fxa-graphql-api \
  --exclude=fxa-payments-server  \
  --exclude=fxa-settings  \
  --exclude=fxa-support-panel \
  run lint;
