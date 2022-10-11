#!/bin/bash -ex


if [ "$TRACING_OTEL_EXPORTER_ENABLED" == "true" ]
then
  echo -e "Jaeger enabled! Go to http://localhost:16686 to view traces. \n"

  # Create an otel network. If it already exists and error will be shown that can be ignored
  docker network create otel

  docker run --rm --name jaeger \
    --net otel \
    -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
    -e COLLECTOR_OTLP_ENABLED=true \
    -p 6831:6831/udp \
    -p 6832:6832/udp \
    -p 5778:5778 \
    -p 5775:5775/udp \
    -p 16686:16686 \
    -p 14268:14268 \
    -p 9411:9411 \
    -p 43170:4317 \
    -p 43180:4318 \
    -p 14250:14250 \
    jaegertracing/all-in-one:latest
else
  echo -e "Jaeger did not start, because it is not enabled. Set env TRACING_OTEL_EXPORTER_ENABLED=true to enable. Running Jaeger is optional! \n"
fi
