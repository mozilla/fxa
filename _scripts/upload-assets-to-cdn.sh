#!/bin/sh

echo ""
echo "Usage:"
echo "  Checkout HEAD of master of https://github.com/mozilla/fxa, and from"
echo "  ./fxa, run ./_scripts/upload-assets-to-cdn.sh."
echo ""
echo "Your current branch is $(git branch --show-current)"
echo ""

aws s3 cp --cache-control 'public,max-age=86400' --recursive assets s3://fxa-content-cdn-prod-distbucket-gqg70i8xqycy/
