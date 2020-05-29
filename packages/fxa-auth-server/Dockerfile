FROM fxa-node:latest

USER root
RUN ln -sF /fxa/packages/fxa-auth-server /app
USER app
WORKDIR /app
RUN cp -R dist/fxa-auth-server/* ./
