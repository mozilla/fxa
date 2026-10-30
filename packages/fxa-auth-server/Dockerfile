# syntax=docker/dockerfile:1

# Build from the repo root; `fxa-base` is the root Dockerfile's final stage.
#   docker buildx bake auth

FROM fxa-base AS development
WORKDIR /fxa/packages/fxa-auth-server
CMD ["node", "-r", "ts-node/register/transpile-only", "-r", "tsconfig-paths/register", "bin/key_server.js"]

FROM fxa-base AS build
RUN --mount=type=cache,target=/fxa/.nx/cache \
    npx nx run fxa-auth-server:bundle
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    _dev/docker/install-bundle.sh packages/fxa-auth-server

FROM node:24.21.0-bookworm-slim AS production
# The config default comes from require.resolve, which the bundle turns into
# a module id rather than a path.
ENV NODE_ENV=production \
    GEODB_DBPATH=/app/node_modules/fxa-geodb/db/cities-db.mmdb
COPY --from=build --chown=10001:10001 /app /app
COPY --from=build --chown=10001:10001 /assets /fxa
WORKDIR /fxa/packages/fxa-auth-server
USER 10001:10001
CMD ["node", "/app/main.js"]
