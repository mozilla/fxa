#!/bin/bash -ex

echo -e "Starting cirrus experimenter."

docker run --rm --name cirrus \
  --net fxa \
  -v $(pwd)/_scripts/configs/cirrus.env:/cirrus/cirrus/.env \
  -p 8001:8001 \
  mozilla/cirrus:latest
