# syntax=docker/dockerfile:1

# Build from the repo root; `fxa-base` is the root Dockerfile's final stage.
#   docker buildx bake content
# Serves the fxa-settings React app from its `dev` build: the stage and prod
# builds point asset URLs at the production CDNs.

FROM fxa-base AS development
WORKDIR /fxa/packages/fxa-content-server
CMD ["node", "-r", "ts-node/register/transpile-only", "-r", "tsconfig-paths/register", "server/bin/fxa-content-server.js"]

FROM fxa-base AS build
ENV BUILD_TARGETS=dev \
    NODE_OPTIONS=--max-old-space-size=6144
RUN --mount=type=cache,target=/fxa/.nx/cache \
    npx nx run fxa-content-server:bundle
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    _dev/docker/install-bundle.sh packages/fxa-content-server \
        packages/fxa-content-server/dist \
        packages/fxa-content-server/server/templates/pages/dist
# The dev build references its assets at /settings/..., but in production
# mode content-server serves them only from dist/ (stage and prod load them
# from the CDN). Link each one up a level; index.html stays in dev/.
RUN cd /assets/packages/fxa-content-server/dist/settings \
    && for f in dev/*; do \
        [ "$f" = dev/index.html ] || ln -s "$f" "$(basename "$f")"; \
    done

FROM node:24.21.0-bookworm-slim AS production
ENV NODE_ENV=production \
    STATIC_DIRECTORY=dist \
    PAGE_TEMPLATE_SUBDIRECTORY=dist \
    STATIC_SETTINGS_DIRECTORY=dev \
    GEODB_DBPATH=/app/node_modules/fxa-geodb/db/cities-db.mmdb
COPY --from=build --chown=10001:10001 /app /app
COPY --from=build --chown=10001:10001 /assets /fxa
WORKDIR /fxa/packages/fxa-content-server
USER 10001:10001
CMD ["node", "/app/main.js"]
