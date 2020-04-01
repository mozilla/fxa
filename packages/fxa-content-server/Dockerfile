FROM node:12-slim AS builder

RUN set -x \
    && addgroup --gid 10001 app \
    && adduser --disabled-password \
        --gecos '' \
        --gid 10001 \
        --home /app \
        --uid 10001 \
        app
RUN apt-get update && apt-get install -y \
    git-core \
    python-setuptools \
    python-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

USER app

COPY --chown=app:app fxa-content-server /app
WORKDIR /app
RUN npm ci && rm -rf ~/.cache ~/.npm

COPY --chown=app:app ["fxa-geodb", "../fxa-geodb/"]
WORKDIR /fxa-geodb
RUN npm ci

COPY --chown=app:app ["fxa-shared", "../fxa-shared/"]
WORKDIR /fxa-shared
RUN npm ci

WORKDIR /app
RUN npm run build-production
