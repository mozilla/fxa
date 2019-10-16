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

USER app
COPY ["fxa-content-server", "../fxa-content-server/"]
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

# The fxa-shared install stanza below should be simplified:
# https://github.com/mozilla/fxa/issues/2937

# Borrowing this stanza from fxa-content-server/Dockerfile-build
# Except, to avoid installing redis, we're just copying over the two files
# that are explicitly needed.
COPY --chown=app:app ["fxa-shared/metrics/user-agent.js", "../fxa-shared/metrics/user-agent.js"]
COPY --chown=app:app ["fxa-shared/metrics/amplitude.js", "../fxa-shared/metrics/amplitude.js"]
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
USER root
RUN chown -R app:app /fxa-shared
USER app
RUN npm ci

WORKDIR /app
CMD [ "/usr/local/bin/node", "server/bin/fxa-payments-server.js" ]
