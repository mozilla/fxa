#!/bin/sh

sed -i.orig 's/"resolved": "http:\/\/registry\.npmjs\.org\//"resolved": "https:\/\/registry.npmjs.org\//' npm-shrinkwrap.json
rm -f npm-shrinkwrap.json.orig
