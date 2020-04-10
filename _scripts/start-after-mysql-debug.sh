#!/bin/bash -ex
"${0%/*}/check-mysql.sh"
npm run start-dev-debug
