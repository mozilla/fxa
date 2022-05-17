#!/bin/bash -e

DIR=$(dirname "$0")
COMMAND=$1
cd "$DIR/.."

if ! node -p 's = require("semver");v = require("./package.json").engines.node; process.exitCode = s.satisfies(process.version, v) ? 0 : 1; if(process.exitCode) {"\nPlease use node: " + v + "\n"}';
then
  exit 1
fi

mkdir -p artifacts

echo "building shared fxa projects..."
if ! yarn workspaces foreach --verbose --include fxa-auth-client --include fxa-react --include fxa-shared run build > artifacts/build-shared.log;
then
  echo -e "\n###########################################################\n"
  echo "# fxa couldn't build shared projects. see ./artifacts/build-shared.log for details"
  echo -e "\n###########################################################\n"
  exit 1
fi

echo "${COMMAND} fxa services..."
if yarn workspaces foreach --topological-dev --verbose --exclude fxa-dev-launcher --exclude fxa run "$COMMAND" > artifacts/start.log;
then
  pm2 ls
else
  echo -e "\n###########################################################\n"
  echo "# fxa couldn't start. see ./artifacts/start.log for details"
  echo -e "\n###########################################################\n"
  exit 1
fi
