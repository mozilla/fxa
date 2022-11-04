#!/bin/bash -ex

docker run --rm --net fxa  -p 11211:11211 --name memcache memcached
