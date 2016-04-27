#!/bin/bash -ex

# Install and start the auth server
git clone https://github.com/mozilla/fxa-auth-server.git
cd fxa-auth-server && npm i
npm start &
cd ..
sleep 5

# Run the tests against the local auth server
npm run test-local
