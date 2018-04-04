#!/bin/bash -ex

container_id=$(docker ps -a | grep pafortin/goaws | cut -d' ' -f1)

function finish {
  echo "stopping $container_id"
  docker stop $container_id
}
trap finish EXIT


if [ -z "$container_id" ]; then
  docker run --name goaws -p 4100:4100 pafortin/goaws
  while true; do sleep 1000; done

else
  is_up=$(docker ps -a | grep pafortin/goaws | grep Up | cut -d' ' -f1)
  if [ -z "$is_up" ]; then
    docker start $container_id
    echo "starting $container_id"
    while true; do sleep 1000; done
  fi
fi
