#!/bin/bash -ex

DIR=$(dirname "$0")
cd "$DIR/../_dev/firebase"

# the "demo-" prefix for --project is special
# see https://firebase.google.com/docs/emulator-suite/connect_firestore#choose_a_firebase_project
docker run --rm -p 4400:4400 -p 4500:4500 -p 8085:8085 -p 9090:9090 -p 9299:9299 -v "$(pwd)":/home/node --name firebase-tools andreysenov/firebase-tools:latest firebase emulators:start --project demo-fxa
