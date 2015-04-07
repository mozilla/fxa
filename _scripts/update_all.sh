#!/bin/bash

# Update all projects

(cd fxa-content-server && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-content-server update failed"
(cd fxa-auth-server && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-auth-server update failed"

(cd browserid-verifier && git checkout master && git pull origin master && npm i && npm i vladikoff/browserid-local-verify#http && cd ..)|| echo "browserid update failed"
(cd fxa-oauth-server && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-oauth-server update failed"
(cd fxa-oauth-console && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-oauth-console update failed"

(cd fxa-profile-server && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-profile-server update failed"

(cd 123done && git checkout oauth && git pull origin oauth && npm i && cd ..) || echo "123done update failed"
(cd loop-server && git checkout master && git pull origin master && npm i && cd ..) || echo "Loop update failed"
(cd syncserver && git checkout master && git pull origin master && make build && cd ..) || echo "syncserver update failed"

