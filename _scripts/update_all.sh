#!/bin/bash

# Update all projects

(cd fxa-content-server && git checkout master && git pull origin master && npm i && cd ..)
cd fxa-auth-server && git checkout master && git pull origin master && npm i && cd ..

cd browserid-verifier && git checkout master && git pull origin master && npm i && npm i vladikoff/browserid-local-verify#http && cd ..
cd fxa-oauth-server && git checkout master && git pull origin master && npm i && cd ..
cd fxa-oauth-console && git checkout master && git pull origin master && npm i && cd ..

cd fxa-profile-server && git checkout master && git pull origin master && npm i && cd ..

(cd 123done && git checkout master && git pull origin master && npm i && cd ..) || echo "123done update failed"
(cd loop-server && git checkout master && git pull origin master && npm i && cd ..) || echo "Loop update failed"

