#!/bin/bash -ex

DIR=$(dirname "$0")
cd "$DIR/.."

VERSION=$1

if [[ "${VERSION}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Updating version in package.json to ${VERSION}"
else
  echo "Invalid version or no version specified, ${VERSION}. Defaulting to v0.0.0"
  VERSION="v0.0.0"
fi

# Trim the prefix "v" from the version
VERSION=$(echo "${VERSION}" | sed 's/^v//')

function patchVersion() {
  if [ -f "package.json" ]; then
    echo "Updating version in $(pwd)/package.json to ${VERSION}"
    jq ".version = \"$VERSION\"" package.json > tmp && mv tmp package.json
  else
    echo "$(pwd)/package.json not found!"
  fi
}

# Update the root package.json file.
patchVersion

# Create version files and update the version field in package.json files.
for d in ./packages/*/ ; do
  (cd "$d" && mkdir -p config && cp ../version.json . && cp ../version.json config && patchVersion)
done

if [ -f _dev/local-build-env.sh ]; then
    set -a
    . _dev/local-build-env.sh
    set +a
fi

check_build_logs() {
    set +x
    for log_file in /tmp/xfs-*/build.log; do
        [ -f "$log_file" ] || continue
        cat <<EOF
==========================[ BEGIN: ${log_file} ]==========================
EOF
        cat "${log_file}"
        cat <<EOF
===========================[ END: ${log_file} ]===========================
EOF
    done
}

trap 'check_build_logs' EXIT

# `npx yarn` because `npm i -g yarn` needs sudo
npx yarn install
SKIP_PREFLIGHT_CHECK=true npx yarn workspaces foreach --topological-dev --verbose run build
rm -rf node_modules
rm -rf packages/*/node_modules
npx yarn workspaces focus --production \
  123done \
  browserid-verifier \
  fxa-admin-panel \
  fxa-admin-server \
  fxa-auth-server \
  fxa-content-server \
  fxa-customs-server \
  fxa-event-broker \
  fxa-geodb \
  fxa-graphql-api \
  fxa-auth-client \
  fxa-payments-server \
  fxa-profile-server \
  fxa-react \
  fxa-settings \
  fxa-shared
npx yarn cache clean --all
rm -rf artifacts
