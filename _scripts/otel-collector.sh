#!/bin/bash -ex


if [ "$TRACING_OTEL_COLLECTOR_ENABLED" == "true" ]
then
  echo -e "Starting otel collector to capture client traces.\n"

  # Create an otel network. If it already exists and error will be shown that can be ignored
  docker network create otel

  docker run --rm --name otel-collector \
    --net otel \
    -v $(pwd)/_scripts/configs/otel-collector-config.yaml:/etc/otelcol/config.yaml \
    -p 4317:4317 \
    -p 4318:4318 \
    otel/opentelemetry-collector:0.61.0
else
  echo -e "The open telemtry connector did not start, because it is not enabled. Set env TRACING_OTEL_COLLECTOR_ENABLED=true to enable. Running an open telemetry collector is optional! \n"
fi
