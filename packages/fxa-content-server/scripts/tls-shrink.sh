#!/bin/sh

sed -i '' 's/"resolved": "http:\/\/registry\.npmjs\.org\//"resolved": "https:\/\/registry.npmjs.org\//' npm-shrinkwrap.json
