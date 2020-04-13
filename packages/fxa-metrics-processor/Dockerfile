# Build image
FROM node:12 as builder
COPY --chown=app:app ["fxa-shared/metrics/user-agent.js", "../fxa-shared/metrics/user-agent.js"]
COPY --chown=app:app ["fxa-shared/metrics/user-agent.d.ts", "../fxa-shared/metrics/user-agent.d.ts"]
COPY --chown=app:app ["fxa-shared/package.json", "../fxa-shared/package.json"]
COPY --chown=app:app ["fxa-shared/package-lock.json", "../fxa-shared/package-lock.json"]
# Also need to copy over the tsconfig.json, or the linter will fail
COPY --chown=app:app ["fxa-shared/tsconfig.json", "../fxa-shared/tsconfig.json"]
# And the linter also needs the nsprc...
COPY --chown=app:app ["fxa-shared/.nsprc", "../fxa-shared/.nsprc"]
RUN mkdir /fxa-shared/node_modules
WORKDIR /fxa-shared
USER app
RUN npm ci

WORKDIR /app
COPY . /app
RUN npm ci
RUN npm run build
RUN npm ci --production

# Production image
FROM node:12-slim
WORKDIR /app
USER node
COPY --from=builder --chown=node /app/dist ./dist/
COPY --from=builder --chown=node /app/node_modules ./node_modules/
COPY --from=builder --chown=node /app/version.json /app/version.json
COPY --chown=node config/*.json ./config/
COPY --chown=node package* ./
