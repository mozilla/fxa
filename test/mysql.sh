#!/bin/bash -ex
. test/curl.sh

##additional tests to be performed in mysql mode

# oauth
check 127.0.0.1:9011 404

# mysql
check_mysql
