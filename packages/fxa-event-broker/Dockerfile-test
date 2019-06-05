FROM fxa-event-broker:build

USER root
RUN rm -rf /app/node_modules
RUN chown -R app /app

USER app
RUN npm ci
WORKDIR /app
