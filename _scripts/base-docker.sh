#!/bin/bash -ex

DIR=$(dirname "$0")
cd "$DIR/.."

for d in ./packages/*/ ; do
  (cd "$d" && mkdir -p config && cp ../version.json . && cp ../version.json config)
done

npm i lerna
npx lerna bootstrap --hoist pm2
npx lerna run --stream build
npx lerna exec --stream --concurrency 2 --no-bail -- npm prune --production
