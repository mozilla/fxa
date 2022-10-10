#!/bin/bash -ex


if [ "$TRACING_JAEGER_EXPORTER_ENABLED" == "true" ]
then
  echo -e "Jaeger enabled! Go to http://localhost:16686 to view traces. \n"

  docker run --rm --name jaeger \
    -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
    -e COLLECTOR_OTLP_ENABLED=true \
    -p 6831:6831/udp \
    -p 6832:6832/udp \
    -p 5778:5778 \
    -p 5775:5775/udp \
    -p 16686:16686 \
    -p 14268:14268 \
    -p 9411:9411 \
    -p 4317:4317 \
    -p 4318:4318 \
    jaegertracing/all-in-one:latest
else
  echo -e "Jaeger did not start, because it is not enabled. Set env TRACING_JAEGER_EXPORTER_ENABLED=true to enable. Running Jaeger is optional! \n"
fi
