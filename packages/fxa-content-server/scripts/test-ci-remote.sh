#!/bin/bash -ex

DIR=$(dirname "$0")
cd "$DIR/.."
echo -e "\n###################################"
echo "# testing fxa-content-server"
echo -e "###################################\n"

env | sort

function test_suite() {
  local suite=$1
  node tests/intern.js \
    --suites="${suite}" \
    --fxaAuthRoot=https://api-accounts.stage.mozaws.net/v1 \
    --fxaContentRoot=https://accounts.stage.mozaws.net/ \
    --fxaOAuthApp=https://123done-stage.dev.lcip.org/ \
    --fxaUntrustedOauthApp=https://321done-stage.dev.lcip.org/ \
    --fxaEmailRoot=http://restmail.net \
    --fxaProduction=true \
    --output="../../artifacts/tests/${suite}-${numGroups}-${i}-results.xml" \
    --firefoxBinary=./firefox/firefox \
    --testProductId="prod_FiJ42WCzZNRSbS" \
    --testPlanId="plan_HJyNT4gbuyyZ0G" \
    || \
  node tests/intern.js \
    --suites="${suite}" \
    --fxaAuthRoot=https://api-accounts.stage.mozaws.net/v1 \
    --fxaContentRoot=https://accounts.stage.mozaws.net/ \
    --fxaOAuthApp=https://123done-stage.dev.lcip.org/ \
    --fxaUntrustedOauthApp=https://321done-stage.dev.lcip.org/ \
    --fxaEmailRoot=http://restmail.net \
    --fxaProduction=true \
    --output="../../artifacts/tests/${suite}-${numGroups}-${i}-results.xml" \
    --firefoxBinary=./firefox/firefox \
    --grep="$(<rerun.txt)" \
    --testProductId="prod_FiJ42WCzZNRSbS" \
    --testPlanId="plan_HJyNT4gbuyyZ0G"
}

yarn lint

cd ../../
mkdir -p artifacts/tests

cd packages/fxa-content-server
mozinstall /firefox.tar.bz2
test_suite functional_smoke
# TODO: Re-enable once configuration in stage is updated
# test_suite functional_regression
# test_suite pairing
