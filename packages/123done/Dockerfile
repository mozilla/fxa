# syntax=docker/dockerfile:1

FROM fxa-base AS development
WORKDIR /fxa/packages/123done
CMD ["node", "server.js"]

FROM fxa-base AS build
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    yarn workspaces focus 123done --production

FROM node:24.21.0-bookworm-slim AS production
ENV NODE_ENV=production
COPY --from=build --chown=10001:10001 /fxa/node_modules /fxa/node_modules
COPY --from=build --chown=10001:10001 /fxa/packages/123done /fxa/packages/123done
WORKDIR /fxa/packages/123done
USER 10001:10001
CMD ["node", "server.js"]
