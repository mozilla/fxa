FROM node:12-slim

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
