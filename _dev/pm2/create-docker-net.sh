#!/bin/bash -e

if docker network ls | grep -e "$1 .* local$"; then
    echo "$1 docker network already exists";
else
    echo "$1 docker network doesn't exist. creating fxa network";
    docker network create $1
fi
