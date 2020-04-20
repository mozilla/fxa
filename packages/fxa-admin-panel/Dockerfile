# Build image
FROM node:12 as builder

COPY fxa-admin-panel /app
COPY fxa-components /fxa-components
WORKDIR /fxa-components
RUN npm ci

WORKDIR /app
RUN npm ci
ENV PUBLIC_URL /
ENV INLINE_RUNTIME_CHUNK false
RUN npm run build
RUN npm ci --production

# Production image
FROM node:12-slim
WORKDIR /app
USER node
COPY --from=builder --chown=node /app/build ./build/
COPY --from=builder --chown=node /app/node_modules ./node_modules/
COPY --from=builder --chown=node /app/version.json /app/version.json
COPY --chown=node fxa-admin-panel/package* ./
