FROM node:12-alpine

# To handle 'not get uid/gid'
RUN npm config set unsafe-perm true

RUN apk add --no-cache git make gcc g++

RUN addgroup -g 10001 app && \
    adduser -D -G app -h /app -u 10001 app
WORKDIR /app

USER app

COPY --chown=app:app . /app

RUN npm ci && rm -rf ~app/.npm

RUN npm run build
