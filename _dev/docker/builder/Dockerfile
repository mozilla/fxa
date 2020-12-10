FROM node:14-slim

ARG yarn_http_proxy=
ARG yarn_https_proxy=
ARG yarn_http_timeout=30000
ARG npm_config_http_proxy=${yarn_http_proxy}
ARG npm_config_https_proxy=${yarn_https_proxy}
ARG npm_config_proxy=
ARG NODE_TLS_REJECT_UNAUTHORIZED=1

RUN set -x \
    && addgroup --gid 10001 app \
    && adduser --disabled-password \
        --gecos '' \
        --gid 10001 \
        --home /build \
        --uid 10001 \
        app
RUN apt-get update && apt-get install -y \
    git-core \
    python-setuptools \
    python-dev \
    build-essential \
    zip \
    && rm -rf /var/lib/apt/lists/*

COPY --chown=app:app . /fxa
USER app
WORKDIR /fxa
RUN _scripts/base-docker.sh
