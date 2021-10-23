FROM node:16-slim

RUN set -x \
    && addgroup --gid 10001 app \
    && adduser --disabled-password \
        --gecos '' \
        --gid 10001 \
        --home /build \
        --uid 10001 \
        app
RUN apt-get update && apt-get install -y \
    netcat \
    openssl \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

COPY --from=fxa-builder:latest --chown=app:app /fxa /fxa
COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/version.json /app/version.json
USER app
