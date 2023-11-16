#!/bin/bash -ex

DIR=$(dirname "$0")

function test_suite() {
  local suite=$1
  local numGroups=$2

  for i in $(seq "$numGroups")
  do
    node tests/intern.js --suites="${suite}" --output="../../artifacts/tests/${suite}-${numGroups}-${i}-results.xml" --groupsCount="${numGroups}" --groupNum="${i}" || \
    node tests/intern.js --suites="${suite}" --output="../../artifacts/tests/${suite}-${numGroups}-${i}-results.xml" --groupsCount="${numGroups}" --groupNum="${i}" --grep="$(<rerun.txt)"
  done
}

cd "$DIR/.."

test_suite circle 3

# The last node currently has the least work to do in the above tests
if [[ "${CIRCLE_NODE_INDEX}" == "2" ]]; then
  node tests/intern.js --suites='server' --output='../../artifacts/tests/server-results.xml'
  #Removing the flaky pairing suite, to be addressed in https://mozilla-hub.atlassian.net/browse/FXA-6558
  #node tests/intern.js --suites='pairing' --output='../../artifacts/tests/pairing-results.xml'
fi
