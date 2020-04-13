#!/bin/bash -ex

cd ../fxa-shared
npm ci

cd ../fxa-metrics-processor
npm ci
npm test
