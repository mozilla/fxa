#!/bin/bash -ex

DOCKER_OS="$(docker info --format '{{.OperatingSystem}}')"

if [ "$DOCKER_OS" = 'Docker for Windows' ] || [ "$DOCKER_OS" = 'Docker for Mac' ] || [ "$DOCKER_OS" = 'Docker Desktop' ]; then
  HOST_ADDR='host.docker.internal'
else
  HOST_ADDR='localhost'
fi

"${0%/*}/check-url.sh" "http://$HOST_ADDR:3030/.well-known/fxa-client-configuration"

docker run --rm --name syncserver \
  -p 5000:5000 \
  -e SYNCSERVER_PUBLIC_URL=http://localhost:5000 \
  -e SYNCSERVER_IDENTITY_PROVIDER=http://$HOST_ADDR:3030 \
  -e SYNCSERVER_OAUTH_VERIFIER=http://$HOST_ADDR:9000 \
  -e SYNCSERVER_BROWSERID_VERIFIER=http://$HOST_ADDR:5050 \
  -e SYNCSERVER_SECRET=5up3rS3kr1t \
  -e SYNCSERVER_SQLURI=sqlite:////tmp/syncserver.db \
  -e SYNCSERVER_BATCH_UPLOAD_ENABLED=true \
  -e SYNCSERVER_FORCE_WSGI_ENVIRON=true \
  -e PORT=5000 \
  mozilla/syncserver:latest
