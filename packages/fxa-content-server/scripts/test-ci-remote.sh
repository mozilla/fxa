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
# Optional build_parameters:
# - `MOZ_ENDPOINT` - one of {stage,latest,stable}; default `stage` if not set.
# - `MOZ_GIT_COMMIT` - default to auto-detect from remote content-server; override here if needed

DIR=$(dirname "$0")
cd "$DIR/.."

env | sort
MOZ_ENDPOINT="${MOZ_ENDPOINT:-stage}"

echo -e "\n###################################"
echo "# testing fxa-content-server"
echo -e "###################################\n"

function test_suite() {
  local suite=$1
  node tests/intern.js \
    --suites="${suite}" \
    --output="../../artifacts/tests/${suite}-${MOZ_ENDPOINT}-results.xml" \
    || \
  node tests/intern.js \
    --suites="${suite}" \
    --output="../../artifacts/tests/${suite}-${MOZ_ENDPOINT}-results.xml" \
    --grep="$(<rerun.txt)"
}

cd ../../
mkdir -p artifacts/tests
cd packages/fxa-content-server

sudo docker images
which jq

# if [ -z "${MOZ_GIT_COMMIT}" ]; then 
mozinstall /firefox.tar.bz2
yarn lint
test_suite functional_smoke
# TODO - restore these
#test_suite server
#mozinstall /7f10c7614e9fa46-target.tar.bz2
#test_suite pairing


