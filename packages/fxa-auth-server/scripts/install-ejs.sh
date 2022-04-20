#!/bin/bash -e

# Unfortunately, importing the ejs package won't work from a browser context,
# so per their docs, we must use the 'official' build. This script makes a best
# effort at ensuring the currently installed verison of mjml is in sync with
# the package used by the browser.

# Get current version
# ejs_version=$(npm info ejs version)
# Temporarily hard code the version, while .min.js is not available for newer versions.
ejs_version="3.1.6"

# Ensure vendor dir
[ ! -d "./vendor" ] && mkdir vendor

# Download it from github
curl -L https://github.com/mde/ejs/releases/download/v$ejs_version/ejs.min.js -o ./vendor/ejs.js
