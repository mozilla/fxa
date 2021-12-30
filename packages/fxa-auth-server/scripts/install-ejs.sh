#!/bin/bash -e

# Get current version
ejs_version=$(npm info ejs version)

# Ensure vendor dir
[ ! -d "./vendor" ] && mkdir vendor

# Download it from github
wget -O ./vendor/ejs.js https://github.com/mde/ejs/releases/download/v$ejs_version/ejs.min.js
