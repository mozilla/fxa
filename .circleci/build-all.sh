#!/bin/bash -e

DIR=$(dirname "$0")

$DIR/create-version-json.sh

for d in $DIR/../packages/*/ ; do
  $DIR/build.sh $(basename $d)
done
