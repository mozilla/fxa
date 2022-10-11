#!/bin/bash -ex


if [ "$TRACING_OTEL_COLLECTOR_ENABLED" == "true" ]
then

  # Outputs traces to console/stdout
  EXPORTERS="logging"

  if [ "$TRACING_OTEL_COLLECTOR_GCP_ENABLED" == "true" ]
  then
    EXPORTERS="$EXPORTERS,googlecloud"
  fi

  if [ "$TRACING_OTEL_COLLECTOR_JAEGER_ENABLED" == "true" ]
  then
    EXPORTERS="$EXPORTERS,jaeger"
  fi

  echo -e "Starting otel collector to capture client traces.\n exporters=$EXPORTERS\n gcp-proj-id=$TRACING_GCP_PROJECT"

  # Create an otel network. If it already exists and error will be shown that can be ignored
  docker network create otel

  docker run --rm --name otel-collector \
    --net otel \
    -v $(pwd)/_scripts/configs/otel-collector-config.yaml:/etc/otel/config.yaml \
    -v $HOME/.config/gcloud/application_default_credentials.json:/etc/otel/key.json \
    -e GOOGLE_APPLICATION_CREDENTIALS=/etc/otel/key.json \
    -e EXPORTERS=$EXPORTERS \
    -e TRACING_GCP_PROJECT=$TRACING_GCP_PROJECT \
    -p 4317:4317 \
    -p 4318:4318 \
    -p 55681:55681 \
    otel/opentelemetry-collector-contrib:0.61.0 --config=/etc/otel/config.yaml
else
  echo -e "The open telemtry connector did not start, because it is not enabled. Set env TRACING_OTEL_COLLECTOR_ENABLED=true to enable. Running an open telemetry collector is optional! \n"
fi
