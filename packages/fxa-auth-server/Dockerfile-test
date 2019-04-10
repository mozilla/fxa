FROM fxa-auth-server:build

USER root
RUN rm -rf /app/node_modules
RUN rm -rf /app/fxa-content-server-l10n
COPY fxa-auth-db-mysql fxa-auth-db-mysql
RUN chown -R app /app

USER app
RUN npm ci
WORKDIR /app/fxa-auth-db-mysql
RUN npm ci
WORKDIR /app
