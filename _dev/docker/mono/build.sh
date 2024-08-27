#!/bin/bash -ex

DIR=$(dirname "$0")
cd "$DIR/../../.."

VERSION=$1

if [[ "${VERSION}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Updating version in package.json to ${VERSION}"
else
  echo "Invalid version or no version specified, ${VERSION}. Defaulting to v0.0.0"
  VERSION="v0.0.0"
fi

# Trim the prefix "v" from the version
VERSION=$(echo "${VERSION}" | sed 's/^v//')

# Update version numbers in package.json files
function patchVersion() {
  if [ -f "package.json" ]; then
    echo "Updating version in $(pwd)/package.json to ${VERSION}"
    jq ".version = \"$VERSION\"" package.json > ver_tmp && mv ver_tmp package.json
  else
    echo "$(pwd)/package.json not found!"
  fi
}
patchVersion
for d in ./packages/*/ ; do
  (cd "$d" && mkdir -p config && cp ../version.json . && cp ../version.json config && patchVersion)
done

# `npx yarn` because `npm i -g yarn` needs sudo
npx yarn install
npx yarn gql:allowlist
NODE_OPTIONS="--max-old-space-size=7168" CHOKIDAR_USEPOLLING=true SKIP_PREFLIGHT_CHECK=true BUILD_TARGETS=stage,prod,dev npx nx run-many -t build --all --verbose --skip-nx-cache

# This will reduce packages to only production dependencies
npx yarn workspaces focus --production --all
npx yarn cache clean --all
rm -rf artifacts
