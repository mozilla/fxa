#!/bin/bash -e

# Determine which workspaces have been modified
node .circleci/modules-to-test.js | tee packages/test.list

# Create empty files
mkdir -p .lists
echo '' > .lists/ts-build-includes.list
echo '' > .lists/lint.list
echo '' > .lists/lint-includes.list
echo '' > .lists/unit-test.list
echo '' > .lists/unit-test-includes.list
echo '' > .lists/integration-test.list
echo '' > .lists/integration-test-includes.list

function genWorkspaceCmd() {
  if [ -f "packages/$1/package.json" ]; then
    if [[ $(cat packages/$1/package.json | jq ".scripts.\"$2\"") != null ]]; then
      echo "NODE_ENV=test yarn workspace $1 run $2" >> .lists/$3
    fi
  fi
}
function genIncludeArgs() {
  if [ -f "packages/$1/package.json" ]; then
    echo "Processing packages/$1/package.json "
    if [[ $(cat packages/$1/package.json | jq ".scripts.\"$2\"") != null ]]; then
      echo "--include $1" >> .lists/$3
    fi
  fi
}

if [[ $(cat packages/test.list) == *all* ]]; then
  echo "Testing All Packages";
  ls -1 packages > .lists/test.list
else
  cp packages/test.list .lists/test.list
fi

# Loop over test.list and look for common scripts that might be applicable to run.
while read pkg
do
  genIncludeArgs $pkg compile ts-build-includes.list

  genWorkspaceCmd $pkg lint lint.list
  genIncludeArgs $pkg lint lint-includes.list

  genWorkspaceCmd $pkg test:unit unit-test.list
  genIncludeArgs $pkg test:unit unit-test-includes.list

  genWorkspaceCmd $pkg test:integration integration-test.list
  genIncludeArgs $pkg test:integration integration-test-includes.list

done < .lists/test.list
