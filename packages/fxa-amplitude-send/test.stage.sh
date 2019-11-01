#!/bin/sh

export FXA_AMPLITUDE_HMAC_KEY="wibble"

for FILE in data.stage/*.gz; do
  ./build/bin/python amplitude.py "$FILE"
done

