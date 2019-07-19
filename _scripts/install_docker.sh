#!/bin/sh -ex
docker network create fxa-net || true

docker pull memcached

docker pull mozilla/syncserver

docker pull mozilla/pushbox

docker pull pafortin/goaws

docker pull redis

docker pull mysql/mysql-server:5.6

docker pull jdlk7/firestore-emulator

docker pull knarz/pubsub-emulator
