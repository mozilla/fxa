#!/bin/bash -ex

echo -e "Starting kinto."

docker run --rm --name kinto \
  --net fxa \
  -p 8888:8888 \
  -e KINTO_INI=/etc/kinto.ini \
  -v $(pwd)/_scripts/configs/kinto.ini:/etc/kinto.ini \
  mozilla/remote-settings:30.1.1
