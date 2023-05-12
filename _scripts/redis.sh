#!/bin/bash -ex

docker run --rm --name redis-server --net fxa -p 6379:6379 redis --requirepass fxa123
