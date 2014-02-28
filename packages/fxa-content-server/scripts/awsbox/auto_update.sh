#!/bin/sh
#
# A little helper script for an awsbox to auto-update itself.
# This script will pull updates from the origin repo, update local master
# to match them, and initiate the post-deploy hooks.  If you run it as
# a cronjob then you'll get an auto-updating awsbox deployment.
# Like this:
#
#  echo "*/5 * * * * /bin/bash -l /home/app/code/scripts/awsbox/auto_update.sh > /dev/null 2> /dev/null" | sudo crontab -u app -

set -e

CURCOMMIT="git log --pretty=%h -1"
ORIGIN="https://github.com/mozilla/fxa-content-server.git"

cd /home/app/git
git remote add origin $ORIGIN || true
git fetch origin

if [ `$CURCOMMIT master` != `$CURCOMMIT origin/master` ]; then
  git branch -f master origin/master
  /usr/local/bin/node ../post-update.js
fi

rm -rf /home/app/tmp/*
