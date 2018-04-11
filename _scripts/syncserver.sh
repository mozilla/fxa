#!/bin/bash -ex

docker run --rm \
  -p 5000:5000 \
  -e SYNCSERVER_PUBLIC_URL=http://localhost:5000 \
  -e SYNCSERVER_SECRET=5up3rS3kr1t \
  -e SYNCSERVER_SQLURI=sqlite:////tmp/syncserver.db \
  -e SYNCSERVER_BATCH_UPLOAD_ENABLED=true \
  -e SYNCSERVER_FORCE_WSGI_ENVIRON=false \
  mozilla/syncserver:latest \
  /usr/local/bin/gunicorn --bind 0.0.0.0:5000 \
  syncserver.wsgi_app
