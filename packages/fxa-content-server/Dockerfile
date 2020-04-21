FROM fxa-node:latest

COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/fxa-content-server /app
COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/fxa-geodb /fxa-geodb
COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/fxa-shared /fxa-shared
