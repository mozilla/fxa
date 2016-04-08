#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "batch directory must be specified"
  exit 1
fi

DIRNAME=${1}

for BATCH in $(find ${DIRNAME} -name "*.json" -type f); do
  echo ${BATCH} $PWD
  ./reset-send-batch.sh ${BATCH}
done
