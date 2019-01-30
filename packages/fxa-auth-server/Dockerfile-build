FROM node:10-alpine

RUN npm install -g npm@6 && rm -rf ~app/.npm /tmp/*

RUN apk add --no-cache git make gcc g++ linux-headers openssl python

RUN addgroup -g 10001 app && \
    adduser -D -G app -h /app -u 10001 app
WORKDIR /app

USER app

COPY npm-shrinkwrap.json npm-shrinkwrap.json
COPY package.json package.json
COPY scripts/download_l10n.sh scripts/download_l10n.sh
COPY scripts/gen_keys.js scripts/gen_keys.js
COPY scripts/gen_vapid_keys.js scripts/gen_vapid_keys.js
COPY fxa-oauth-server/scripts/gen_keys.js fxa-oauth-server/scripts/gen_keys.js

RUN npm ci --production && rm -rf ~app/.npm /tmp/*

COPY . /app
USER root
RUN chown app:app /app/config
RUN chown app:app /app/fxa-oauth-server/config

USER app
RUN node scripts/gen_keys.js
RUN node scripts/gen_vapid_keys.js
RUN node fxa-oauth-server/scripts/gen_keys.js

USER root
RUN chown root:root /app/config

USER app
