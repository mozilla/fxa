#!/bin/bash -ex

docker run --rm \
    --name cloud-tasks-emulator \
    -p 8123:8123 \
    ghcr.io/aertje/cloud-tasks-emulator:latest -host "0.0.0.0" -port "8123" -queue "projects/test/locations/test/queues/delete-accounts-queue" -queue "projects/test/locations/test/queues/notification-emails-queue"
