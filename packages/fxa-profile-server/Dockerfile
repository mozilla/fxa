# syntax=docker/dockerfile:1

# Build from the repo root; `fxa-base` is the root Dockerfile's final stage.
#   docker buildx bake profile
# The image runs the API server by default; override the command with
# `node /app/worker.js` or `node /app/static.js` for the other two processes.

FROM fxa-base AS development
WORKDIR /fxa/packages/fxa-profile-server
CMD ["node", "-r", "ts-node/register/transpile-only", "-r", "tsconfig-paths/register", "bin/server.js"]

FROM fxa-base AS build
RUN --mount=type=cache,target=/fxa/.nx/cache \
    npx nx run fxa-profile-server:bundle
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    _dev/docker/install-bundle.sh packages/fxa-profile-server

FROM node:24.21.0-bookworm-slim AS production
ENV NODE_ENV=production
COPY --from=build --chown=10001:10001 /app /app
COPY --from=build --chown=10001:10001 /assets /fxa
WORKDIR /fxa/packages/fxa-profile-server
USER 10001:10001
CMD ["node", "/app/main.js"]
