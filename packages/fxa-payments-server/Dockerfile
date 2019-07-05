FROM node:12-stretch AS node-builder
RUN groupadd --gid 10001 app  && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app
RUN mkdir /fxa-content-server && chown -R app:app /fxa-content-server
USER app
WORKDIR /app
COPY ["fxa-payments-server/package*.json", "./"]
RUN npm ci
COPY ["fxa-payments-server/.storybook", ".storybook/"]
COPY ["fxa-payments-server/public", "public/"]
COPY ["fxa-payments-server/src", "src/"]
COPY ["fxa-content-server", "../fxa-content-server/"]
WORKDIR /fxa-content-server
RUN npm ci
WORKDIR /app
ENV PUBLIC_URL /
RUN npm run build

FROM node:12-stretch-slim
RUN groupadd --gid 10001 app  && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app
USER app
WORKDIR /app
COPY --chown=app:app --from=node-builder /app .
COPY --chown=app:app [ "fxa-payments-server/", "./" ]
CMD [ "/usr/local/bin/node", "server/bin/fxa-payments-server.js" ]
