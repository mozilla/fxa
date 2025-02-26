#!/bin/bash -ex

echo -e "Starting cirrus experimenter."

docker run --rm --name cirrus \
  --net fxa \
  --mount type=bind,source=$(pwd)/_scripts/configs/cirrus.env.sample,target=/cirrus/.env \
  --mount type=bind,source=$(pwd)/_scripts/configs/cirrus.fml.yml,target=/cirrus/feature_manifest/fml.yml \
  --memory=1024m \
  -p 8001:8001 \
  mozilla/cirrus:sha-1275f51cb
