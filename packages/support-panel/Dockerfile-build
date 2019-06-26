FROM node:10-stretch AS node-builder

RUN groupadd --gid 10001 app  && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

FROM node:10-stretch-slim

RUN groupadd --gid 10001 app  && \
    useradd --uid 10001 --gid 10001 --home /app --create-home app

USER app
WORKDIR /app
COPY --chown=app:app --from=node-builder /app .
COPY --chown=app:app . .
