#!/bin/bash -ex

DIR=$(dirname "$0")

function on_sigint() {
  echo "ClickHouse shutting down."
  docker stop fxa-clickhouse
  exit 0
}

trap on_sigint INT

docker run --rm --name fxa-clickhouse --net fxa -p 8124:8123 \
  -e CLICKHOUSE_USER=metering_rw \
  -e CLICKHOUSE_PASSWORD=local_metering_dev \
  -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 \
  -e TZ=UTC \
  clickhouse/clickhouse-server:25.12.3-alpine &

cd "$DIR"
./check-url.sh localhost:8124/ping 200 ClickHouse

node ../libs/entitlements/metering/migrations/clickhouse/migrate.mjs

while :; do read -r; done
