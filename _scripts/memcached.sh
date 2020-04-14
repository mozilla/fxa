#!/bin/bash -ex

docker run --rm -p 11211:11211 --name memcache memcached
