#!/bin/bash -e

DIR=$(dirname "$0")

for d in $DIR/../packages/*/ ; do
  $DIR/deploy.sh $(basename $d)
done
