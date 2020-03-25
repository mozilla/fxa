FROM node:12-stretch AS node-builder
RUN groupadd --gid 10001 app  && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app
RUN mkdir /fxa-content-server && chown -R app:app /fxa-content-server
USER app
WORKDIR /app
COPY --chown=app:app ["fxa-payments-server/package*.json", "./"]
RUN npm ci
COPY --chown=app:app ["fxa-payments-server/.storybook", ".storybook/"]
COPY --chown=app:app ["fxa-payments-server/public", "public/"]
COPY --chown=app:app ["fxa-payments-server/src", "src/"]
COPY --chown=app:app ["fxa-content-server", "../fxa-content-server/"]
WORKDIR /fxa-content-server
RUN npm ci
WORKDIR /app
ENV PUBLIC_URL /
ENV INLINE_RUNTIME_CHUNK false
RUN npm run build


FROM node:12-stretch-slim
RUN groupadd --gid 10001 app  && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app
RUN apt-get -y update && apt-get -y install git && apt-get clean && rm -rf /var/lib/apt/lists
USER app
WORKDIR /app
COPY --chown=app:app --from=node-builder /app .
COPY --chown=app:app [ "fxa-payments-server/", "./" ]

COPY --chown=app:app ["fxa-geodb", "../fxa-geodb/"]
WORKDIR /fxa-geodb
USER app
RUN npm ci

# The fxa-shared install stanza below should be simplified:
# https://github.com/mozilla/fxa/issues/2937

# Borrowing this stanza from fxa-content-server/Dockerfile-build
# Except, to avoid installing redis, we're just copying over the files
# that are explicitly needed.
COPY --chown=app:app ["fxa-shared/metrics/user-agent.js", "../fxa-shared/metrics/user-agent.js"]
COPY --chown=app:app ["fxa-shared/metrics/amplitude-event.1.schema.json", "../fxa-shared/amplitude-event.1.schema.json"]
COPY --chown=app:app ["fxa-shared/metrics/amplitude.js", "../fxa-shared/metrics/amplitude.js"]
COPY --chown=app:app ["fxa-shared/metrics/flow-performance.js", "../fxa-shared/metrics/flow-performance.js"]
COPY --chown=app:app ["fxa-shared/express/index.js", "../fxa-shared/express/index.js"]
COPY --chown=app:app ["fxa-shared/express/routing.js", "../fxa-shared/express/routing.js"]
COPY --chown=app:app ["fxa-shared/express/cors.js", "../fxa-shared/express/cors.js"]
COPY --chown=app:app ["fxa-shared/express/remote-address.js", "../fxa-shared/express/remote-address.js"]
COPY --chown=app:app ["fxa-shared/express/geo-locate.js", "../fxa-shared/express/geo-locate.js"]
COPY --chown=app:app ["fxa-shared/package.json", "../fxa-shared/package.json"]
COPY --chown=app:app ["fxa-shared/package-lock.json", "../fxa-shared/package-lock.json"]
# Copy over one test, so npm run test won't barf
COPY --chown=app:app ["fxa-shared/test/metrics/amplitude.js", "../fxa-shared/test/metrics/amplitude.js"]
# Also need to copy over the tsconfig.json, or the linter will fail
COPY --chown=app:app ["fxa-shared/tsconfig.json", "../fxa-shared/tsconfig.json"]
# And the linter also needs the nsprc...
COPY --chown=app:app ["fxa-shared/.nsprc", "../fxa-shared/.nsprc"]
RUN mkdir /fxa-shared/node_modules
WORKDIR /fxa-shared
USER app
RUN npm ci

WORKDIR /app
CMD [ "/usr/local/bin/node", "server/bin/fxa-payments-server.js" ]
