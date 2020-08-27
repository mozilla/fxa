FROM fxa-mono:build

USER root
RUN ln -sF /fxa/packages/fxa-auth-server/dist/fxa-auth-server /app
USER app
WORKDIR /app
