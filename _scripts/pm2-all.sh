#!/bin/bash -e

start=`date +%s`

DIR=$(dirname "$0")
COMMAND=$1
PROJECTS=$2
cd "$DIR/.."

if ! node -p 's = require("semver");v = require("./package.json").engines.node; process.exitCode = s.satisfies(process.version, v) ? 0 : 1; if(process.exitCode) {"\nPlease use node: " + v + "\n"}';
then
  exit 1
fi

mkdir -p artifacts

if [ -z "$PROJECTS" ] 
then
  # No tags provided, start the entire stack
  npx nx run-many -t $COMMAND --all --exclude=fxa-dev-launcher --verbose;
else
  # Start only provided projects and dependencies
  # Note dependencies are automatically determined by Nx
  npx nx run-many -t $COMMAND --projects=$PROJECTS --exclude=fxa-dev-launcher --verbose;
fi

end=`date +%s`
runtime=$((end-start))

echo -e "\n###########################################################\n"
echo "# Stack Started Successfully ! ${runtime}s"
echo -e "\n###########################################################\n"
