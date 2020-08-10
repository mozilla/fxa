#!/bin/bash -ex

# To deploy, push your changes to github then trigger a circleci job using the api like so:
# ```sh
# curl -u $CIRCLECI_API_TOKEN: \
#     -d build_parameters[CIRCLE_JOB]='build-and-deploy-fxa-circleci' \
#     -d build_parameters[MOZ_ENDPOINT]='stage' \
#     https://circleci.com/api/v1.1/project/github/mozilla/fxa/tree/$GITHUB_BRANCH
# ```
# - `$CIRCLECI_API_TOKEN` is your personal API token from https://app.circleci.com/settings/user/tokens
# - `$GITHUB_BRANCH` is the branch you'd like to build & deploy to docker hub (this may be `main`)
# - `$MOZ_ENDPOINT` - one of {stage,latest,stable}; default `stage` if not set.

DIR=$(dirname "$0")
cd "$DIR/.."

MOZ_ENDPOINT="${MOZ_ENDPOINT:-stage}"
source $DIR/test-ci-remote/defaults.sh
source $DIR/test-ci-remote/${MOZ_ENDPOINT}
env | sort

echo -e "\n###################################"
echo "# testing fxa-content-server"
echo -e "###################################\n"

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
    --output="../../artifacts/tests/${suite}-${MOZ_ENDPOINT}-results.xml" \
    --firefoxBinary=./firefox/firefox \
    || \
  node tests/intern.js \
    --suites="${suite}" \
    --fxaAuthRoot=https://api-accounts.stage.mozaws.net/v1 \
    --fxaContentRoot=https://accounts.stage.mozaws.net/ \
    --fxaOAuthApp=https://123done-stage.dev.lcip.org/ \
    --fxaUntrustedOauthApp=https://321done-stage.dev.lcip.org/ \
    --fxaEmailRoot=http://restmail.net \
    --fxaProduction=true \
    --output="../../artifacts/tests/${suite}-${MOZ_ENDPOINT}-results.xml" \
    --firefoxBinary=./firefox/firefox \
    --grep="$(<rerun.txt)"
}

yarn lint

cd ../../
mkdir -p artifacts/tests

cd packages/fxa-content-server
mozinstall /firefox.tar.bz2
test_suite functional_smoke
# TODO - restore these
#test_suite server
#mozinstall /7f10c7614e9fa46-target.tar.bz2
#test_suite pairing


