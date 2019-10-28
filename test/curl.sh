#!/bin/bash -ex

function check() {
  # Real startup of the servers takes longer than `pm start`.
  # In order to check their urls, we have to wait for them (2 minutes) and periodically
  # check if their endpoints are available.
  # Function takes following parameters:
  # * $1 - an url of an endpoint to check
  # * $2 [optional] - expected status code of a response from this endpoint. Defaults to 200.
  RETRY=12
  for i in $(eval echo "{1..$RETRY}"); do
    if [ $(curl -s -o /dev/null --silent -w "%{http_code}"  http://$1) == "${2:-200}" ]; then
      return
    else
      if [ $i -lt $RETRY ]; then
        sleep 10
      fi
    fi
  done

  exit 1
}

function check_redis() {
  RETRY=12
  for i in $(eval echo "{1..$RETRY}"); do
    if echo PING | nc localhost 6379 | grep -q 'PONG'; then
      return
    else
      if [ $i -lt $RETRY ]; then
        sleep 10
      fi
    fi
  done

  exit 1
}

function check_memcached() {
  RETRY=12
  for i in $(eval echo "{1..$RETRY}"); do
    if echo stats | nc localhost 11211 | grep -q 'STAT'; then
      return
    else
      if [ $i -lt $RETRY ]; then
        sleep 10
      fi
    fi
  done

  exit 1
}

function check_mysql() {
  RETRY=12
  for i in $(eval echo "{1..$RETRY}"); do
    if echo PING | nc localhost 3306 | grep -q 'mysql'; then
      return
    else
      if [ $i -lt $RETRY ]; then
        sleep 10
      fi
    fi
  done

  exit 1
}

# content
check 127.0.0.1:3030
check 127.0.0.1:1114
check 127.0.0.1:10140 400

# auth
check 127.0.0.1:9000
check 127.0.0.1:9001 404

# oauth
# check 127.0.0.1:9010

# 123done and 321done untrusted apps
check 127.0.0.1:8080
check 127.0.0.1:10139

# profile server
check 127.0.0.1:1111
check 127.0.0.1:1112 404
check 127.0.0.1:5050 405

# sync server
# address of the endpoint have to be the same as a public_url in settings
check 127.0.0.1:5000

# auth-db
check localhost:8000

# redis server
check_redis

# memcached
check_memcached
