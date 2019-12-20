#!/bin/sh

aws s3 cp --cache-control 'public,max-age=86400' --recursive assets s3://fxa-content-cdn-prod-distbucket-gqg70i8xqycy/
