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
    netcat \
    && rm -rf /var/lib/apt/lists/*

COPY --from=fxa-builder:latest --chown=app:app /fxa/_scripts/check-mysql.sh /app/
USER app
WORKDIR /app
