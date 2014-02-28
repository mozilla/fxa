#!/bin/sh
#
# A little helper script for an awsbox to auto-update itself.
# This script will pull updates from the origin repo, update local master
# to match them, and initiate the post-deploy hooks.  If you run it as
# a cronjob then you'll get an auto-updating awsbox deployment.

set -e

CURCOMMIT="git log --pretty=%h -1"
ORIGIN="https://github.com/mozilla/fxa-auth-server.git"

cd /home/app/git
git remote add origin $ORIGIN || true
git fetch origin

if [ `$CURCOMMIT master` != `$CURCOMMIT origin/master` ]; then
  echo "DROP DATABASE fxa;" | mysql -u root
  echo "CREATE DATABASE fxa;" | mysql -u root
  echo "GRANT ALL ON fxa.* TO 'fxa'@'localhost';" | mysql -u root
  git branch -f master origin/master
  /usr/local/bin/node ../post-update.js
fi

rm -rf /home/app/tmp/*
