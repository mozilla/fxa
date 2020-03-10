FROM node:12-slim

RUN set -x \
    && addgroup --gid 10001 app \
    && adduser --disabled-password \
        --gecos '' \
        --gid 10001 \
        --home /app \
        --uid 10001 \
        app

RUN apt-get update && apt-get -y install git-core python build-essential

COPY --chown=app:app fxa-auth-server /app
COPY --chown=app:app ["fxa-geodb", "../fxa-geodb/"]
COPY --chown=app:app ["fxa-shared", "../fxa-shared/"]

USER app

WORKDIR /fxa-geodb
RUN npm ci

WORKDIR /fxa-shared
RUN npm ci

WORKDIR /app
RUN npm ci --production && rm -rf ~app/.npm
RUN node scripts/gen_keys.js
RUN NODE_ENV=dev node scripts/oauth_gen_keys.js
RUN node scripts/gen_vapid_keys.js
