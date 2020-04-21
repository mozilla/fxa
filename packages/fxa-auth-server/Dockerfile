FROM fxa-node:latest

# copy all files to /app as usual
COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/fxa-auth-server /app
# overwrite source files with tsc compiled js
COPY --from=fxa-builder:latest --chown=app:app /fxa/packages/fxa-auth-server/dist/fxa-auth-server /app/
