#!/bin/bash -ex

if [ "$TRACING_OTEL_COLLECTOR_ENABLED" == "true" ]; then

  # Outputs traces to console/stdout
  EXPORTERS=("debug")

  if [ "$TRACING_OTEL_COLLECTOR_GCP_ENABLED" == "true" ]; then
    EXPORTERS+=("googlecloud")
  fi

  if [ "$TRACING_OTEL_COLLECTOR_JAEGER_ENABLED" == "true" ]; then
    EXPORTERS+=("otlp/jaeger")
    echo "Jaeger exporter enabled"
  fi

  # convert the array to a comma-separated string
  EXPORTERS_STRING=$(IFS=,; echo "${EXPORTERS[*]}")

  echo "Replace __EXPORTERS__ in the template config file with $EXPORTERS_STRING"
  sed "s|__EXPORTERS__|$EXPORTERS_STRING|" $(pwd)/_scripts/configs/otel-collector-config.yaml > $(pwd)/_scripts/configs/otel-collector-config.tmp.yaml

  # Pass the EXPORTERS environment variable to the docker container
  docker run --rm --name otel-collector \
    --net fxa \
    -v $(pwd)/_scripts/configs/otel-collector-config.tmp.yaml:/etc/otel/config.yaml \
    -v $HOME/.config/gcloud/application_default_credentials.json:/etc/otel/key.json \
    -e GOOGLE_APPLICATION_CREDENTIALS=/etc/otel/key.json \
    -e TRACING_GCP_PROJECT=$TRACING_GCP_PROJECT \
    -p 4317:4317 \
    -p 4318:4318 \
    -p 55681:55681 \
    otel/opentelemetry-collector-contrib:0.123.0 --config=/etc/otel/config.yaml
else
  echo -e "The open telemetry collector did not start, because it is not enabled. Set env TRACING_OTEL_COLLECTOR_ENABLED=true to enable. Running an open telemetry collector is optional! \n"
fi
