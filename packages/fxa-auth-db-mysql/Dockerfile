FROM fxa-node:latest

COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/fxa-auth-db-mysql /app
