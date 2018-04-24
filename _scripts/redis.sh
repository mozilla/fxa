#!/bin/bash -ex

docker run --rm --name redis-server -p 6379:6379 redis
