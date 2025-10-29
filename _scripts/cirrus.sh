#!/bin/bash -ex

echo -e "Starting cirrus experimenter."

source "$(pwd)/.env"

CHANNEL_FILE="cirrus.env.development"
EXPERIMENTS_FML="${NIMBUS_FML_FILE:-configs/nimbus.yaml}"

if [[ "${NIMBUS_CIRRUS_CHANNEL}" == "release" ]]; then
  CHANNEL_FILE="cirrus.env.release"
elif [[ "${NIMBUS_CIRRUS_CHANNEL}" == "stage" ]]; then
  CHANNEL_FILE="cirrus.env.stage"
fi

docker run --rm --name cirrus \
  --net fxa \
  --mount type=bind,source="$(pwd)/_scripts/configs/${CHANNEL_FILE},target=/cirrus/.env" \
  --mount type=bind,source="$(pwd)/${EXPERIMENTS_FML},target=/cirrus/feature_manifest/frontend-experiments.fml.yml" \
  --memory=1024m \
  -p 8001:8001 \
  mozilla/cirrus:sha-1275f51cb
