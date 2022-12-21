#!/bin/bash -ex

DIR=$(dirname "$0")
cd "$DIR/.."
echo -e "\n###################################"
echo "# testing fxa-content-server"
echo -e "###################################\n"

env | sort

function test_suite() {
  local suite=$1
  local numGroups=$2
  local i=$3

  node tests/intern.js \
    --suites="${suite}" \
    --fxaAuthRoot=https://api-accounts.stage.mozaws.net/v1 \
    --fxaContentRoot=https://accounts.stage.mozaws.net/ \
    --fxaOAuthApp=https://stage-123done.herokuapp.com/ \
    --fxaUntrustedOauthApp=https://stage-123done-untrusted.herokuapp.com/ \
    --fxaEmailRoot=http://restmail.net \
    --fxaProduction=true \
    --output="../../artifacts/tests/${suite}-${numGroups}-${i}-results.xml" \
    --testProductId="prod_FiJ42WCzZNRSbS" \
    --testPlanId="plan_HJyNT4gbuyyZ0G" \
    --groups=${numGroups} \
    --groupIndex=${i} \
    || \
  node tests/intern.js \
    --suites="${suite}" \
    --fxaAuthRoot=https://api-accounts.stage.mozaws.net/v1 \
    --fxaContentRoot=https://accounts.stage.mozaws.net/ \
    --fxaOAuthApp=https://stage-123done.herokuapp.com/ \
    --fxaUntrustedOauthApp=https://stage-123done-untrusted.herokuapp.com/ \
    --fxaEmailRoot=http://restmail.net \
    --fxaProduction=true \
    --output="../../artifacts/tests/${suite}-${numGroups}-${i}-results.xml" \
    --grep="$(<rerun.txt)" \
    --testProductId="prod_FiJ42WCzZNRSbS" \
    --testPlanId="plan_HJyNT4gbuyyZ0G" \
    --groups=${numGroups} \
    --groupIndex=${i}
}

# TODO: Move to step in CI
yarn lint

cd ../../
mkdir -p artifacts/tests

cd packages/fxa-content-server

test_suite functional_smoke $CIRCLE_NODE_TOTAL $CIRCLE_NODE_INDEX && test_suite functional_regression $CIRCLE_NODE_TOTAL $CIRCLE_NODE_INDEX
# TODO: Re-enable once configuration in stage is updated
# test_suite pairing
