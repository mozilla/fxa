#!/bin/sh

# Update all projects

git pull https://github.com/mozilla/fxa-local-dev.git master

(cd fxa-content-server && git checkout -- . && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-content-server update failed"
(cd fxa-auth-server && git checkout -- . && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-auth-server update failed"

(cd fxa-auth-db-mysql && git checkout -- . && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-auth-db-mysql update failed"

(cd fxa-email-service && git checkout -- . && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-email-service update failed"

(cd browserid-verifier && git checkout -- . && git checkout master && git pull origin master && npm i && cd ..)|| echo "browserid update failed"
(cd fxa-oauth-server && git checkout -- . && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-oauth-server update failed"

(cd fxa-profile-server && git checkout -- . && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-profile-server update failed"

(cd fxa-basket-proxy && git checkout -- . && git checkout master && git pull origin master && npm i && cd ..) || echo "fxa-basket-proxy update failed"

# Migration
docker network create fxa-net || true # Don't error out in case the network already exists

(cd 123done && git checkout -- . && git checkout oauth && git pull origin oauth && npm i && cd ..) || echo "123done update failed"
docker pull mozilla/syncserver || echo "syncserver update failed"

