#!/bin/sh -ex

DOCKER_OS="`docker info --format '{{.OperatingSystem}}'`"

if [ "$DOCKER_OS" = 'Docker for Windows' -o "$DOCKER_OS" = 'Docker for Mac' -o "$DOCKER_OS" = 'Docker Desktop' ]; then
  HOST_ADDR='host.docker.internal'
else
  HOST_ADDR='127.0.0.1'
fi

docker run --rm --name syncserver \
  -p 5000:5000 \
  -e SYNCSERVER_PUBLIC_URL=http://127.0.0.1:5000 \
  -e SYNCSERVER_IDENTITY_PROVIDER=http://$HOST_ADDR:3030 \
  -e SYNCSERVER_OAUTH_VERIFIER=http://$HOST_ADDR:9000 \
  -e SYNCSERVER_BROWSERID_VERIFIER=http://$HOST_ADDR:5050 \
  -e SYNCSERVER_SECRET=5up3rS3kr1t \
  -e SYNCSERVER_SQLURI=sqlite:////tmp/syncserver.db \
  -e SYNCSERVER_BATCH_UPLOAD_ENABLED=true \
  -e SYNCSERVER_FORCE_WSGI_ENVIRON=false \
  -e PORT=5000 \
  mozilla/syncserver:latest
