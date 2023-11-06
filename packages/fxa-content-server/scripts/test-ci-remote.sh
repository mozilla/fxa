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

  local fxaAccountsApiDomain="${ACCOUNTS_API_DOMAIN:-api-accounts.stage.mozaws.net}"
  local fxaAccountsDomain="${ACCOUNTS_DOMAIN:-accounts.stage.mozaws.net}"
  local relierDomain="${RELIER_DOMAIN:-stage-123done.herokuapp.com}"
  local untrustedRelierDomain="${UNTRUSTED_RELIER_DOMAIN:-stage-123done-untrusted.herokuapp.com}"

  node tests/intern.js \
    --suites="${suite}" \
    --fxaAuthRoot=https://${fxaAccountsApiDomain}/v1 \
    --fxaContentRoot=https://${fxaAccountsDomain}/ \
    --fxaOAuthApp=https://${relierDomain}/ \
    --fxaUntrustedOauthApp=https://${untrustedRelierDomain}/ \
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
    --fxaAuthRoot=https://${fxaAccountsApiDomain}/v1 \
    --fxaContentRoot=https://${fxaAccountsDomain}/ \
    --fxaOAuthApp=https://${relierDomain}/ \
    --fxaUntrustedOauthApp=https://${untrustedRelierDomain}/ \
    --fxaEmailRoot=http://restmail.net \
    --fxaProduction=true \
    --output="../../artifacts/tests/${suite}-${numGroups}-${i}-results.xml" \
    --grep="$(<rerun.txt)" \
    --testProductId="prod_FiJ42WCzZNRSbS" \
    --testPlanId="plan_HJyNT4gbuyyZ0G" \
    --groups=${numGroups} \
    --groupIndex=${i}
}

cd ../../
mkdir -p artifacts/tests

cd packages/fxa-content-server

test_suite functional_smoke $CIRCLE_NODE_TOTAL $CIRCLE_NODE_INDEX && test_suite functional_regression $CIRCLE_NODE_TOTAL $CIRCLE_NODE_INDEX
# TODO: Re-enable once configuration in stage is updated
# test_suite pairing
