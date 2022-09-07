#!/bin/bash -ex


if [ "$TRACING_JAEGER_EXPORTER_ENABLED" == "true" ]
then
  echo -e "Jaeger enabled! Go to http://localhost:16686 to view traces. \n"

  docker run --rm --name jaeger \
    -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 \
    -p 5775:5775/udp \
    -p 6831:6831/udp \
    -p 6832:6832/udp \
    -p 5778:5778 \
    -p 16686:16686 \
    -p 14268:14268 \
    -p 9411:9411 \
    jaegertracing/all-in-one:latest
else
  echo -e "Jaeger not enabled. Set env TRACING_JAEGER_EXPORTER_ENABLED=true to enable. \n"
fi
