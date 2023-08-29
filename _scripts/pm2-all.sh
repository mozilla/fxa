#!/bin/bash -e

start=`date +%s`

DIR=$(dirname "$0")
COMMAND=$1
cd "$DIR/.."

if ! node -p 's = require("semver");v = require("./package.json").engines.node; process.exitCode = s.satisfies(process.version, v) ? 0 : 1; if(process.exitCode) {"\nPlease use node: " + v + "\n"}';
then
  exit 1
fi

mkdir -p artifacts
npx nx run-many -t start --all --exclude=fxa-dev-launcher --verbose;

end=`date +%s`
runtime=$((end-start))

echo -e "\n###########################################################\n"
echo "# Stack Started Successfully ! ${runtime}s"
echo -e "\n###########################################################\n"
