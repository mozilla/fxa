#!/bin/bash -ex

PORTS=(
  3306 # MySQL server
  6379 # redis
  11211 # memcached
  4100 # Fake SQS/SNS
  8005 # google-pubsub-emulator
  8006 # google-firestore-emulator
  5000 # sync server
  8001 # email-service
  8000 # auth-server db mysql
  9000 # auth-server key server
  3030 # content-server
  1111 # profile-server
  9292 # Fortress
  8080 # 123done
  10139 # 321done
  5050 # browserid-verifier
  3031 # payments server
  7100 # support admin panel
  8002 # pushbox
)

occupied=()

for port in ${PORTS[@]}; do
  if echo PING | nc localhost $port >/dev/null; then
    occupied=("${occupied[@]}" $port)
  fi
done

if [ ${#occupied[@]} -ge 1 ]; then
  echo "\033[0;33mHeads up!\033[0m Some required ports are already occupied and may cause problems: \033[0;31m${occupied[@]}\033[0m\n"
fi
