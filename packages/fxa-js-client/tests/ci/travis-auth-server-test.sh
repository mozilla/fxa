#!/bin/bash -ex

# Install and start the auth server
git clone https://github.com/mozilla/fxa-auth-server.git
cd fxa-auth-server && npm i
SIGNIN_CONFIRMATION_ENABLED=true SIGNIN_CONFIRMATION_FORCE_EMAIL_REGEX="^confirm.*@restmail\\.net$"  SIGNIN_UNBLOCK_ALLOWED_EMAILS="^block.*@restmail\\.net$" SIGNIN_UNBLOCK_FORCED_EMAILS="^block.*@restmail\\.net$" npm start &
cd ..
sleep 5

# Run the tests against the local auth server
npm run test-local
