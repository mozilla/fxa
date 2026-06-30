#!/bin/bash -ex

docker run --rm \
    --name cloud-tasks-emulator \
    --add-host=host.docker.internal:host-gateway \
    -p 8123:8123 \
    ghcr.io/aertje/cloud-tasks-emulator:latest -host "0.0.0.0" -port "8123" -queue "projects/test/locations/test/queues/delete-accounts-queue" -queue "projects/test/locations/test/queues/inactive-first-email" -queue "projects/test/locations/test/queues/inactive-second-email" -queue "projects/test/locations/test/queues/inactive-third-email" -queue "projects/test/locations/test/queues/metering-threshold-checks"
