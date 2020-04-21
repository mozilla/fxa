FROM fxa-node:latest

USER root
RUN apt-get update && apt-get install -y \
    graphicsmagick \
    && rm -rf /var/lib/apt/lists/*

USER app
COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/fxa-profile-server /app
COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/fxa-shared /fxa-shared
