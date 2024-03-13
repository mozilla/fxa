# Multi stage docker build for fxa-mono repo. Note that stages should be cached due to docker layer caching being
# turned on in CI.

FROM node:18.18.2-bullseye-slim AS fxa-base
RUN set -x \
    && addgroup --gid 10001 app \
    && adduser --disabled-password \
    --gecos '' \
    --gid 10001 \
    --home /build \
    --uid 10001 \
    app

# Utilities for fxa build
FROM fxa-base as fxa-build-utils
RUN apt-get update && apt-get install -y \
    git-core \
    python3-setuptools \
    python3-dev \
    build-essential \
    zip \
    jq \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Utilities for fxa services
FROM fxa-base as fxa-utils
RUN apt-get update && apt-get install -y \
    netcat-traditional \
    openssl \
    jq \
    curl \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Build mono repo
FROM fxa-build-utils as fxa-build
COPY --chown=app:app . /fxa
USER app
WORKDIR /fxa
RUN _dev/docker/mono/build.sh $(cat packages/version.json | jq -r '.version.version')

# Final image
FROM fxa-utils as fxa-mono
COPY --from=fxa-build --chown=app:app /fxa /fxa
COPY --from=fxa-build --chown=app:app /fxa/packages/version.json /app/version.json
USER app
