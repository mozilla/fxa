#!/bin/bash -ex

docker run --rm --name fxa-clickhouse --net fxa -p 8124:8123 \
  -e CLICKHOUSE_USER=metering_rw \
  -e CLICKHOUSE_PASSWORD=local_metering_dev \
  -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 \
  -e TZ=UTC \
  clickhouse/clickhouse-server:25.12.3-alpine
