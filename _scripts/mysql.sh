#!/bin/bash -ex
container_id=$(docker ps -a | grep mydb | cut -d' ' -f1)

if [ -n "$container_id" ]; then
  docker stop mydb
fi

docker run --rm --name=mydb \
-e MYSQL_ALLOW_EMPTY_PASSWORD=true \
-e MYSQL_ROOT_HOST=% \
-p 3306:3306 \
mysql/mysql-server:5.6
