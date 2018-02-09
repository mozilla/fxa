#!/bin/sh

cd /home/ec2-user/sync-amplitude
. ./.env
/usr/local/bin/node sync
