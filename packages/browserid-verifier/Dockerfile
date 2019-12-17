FROM node:12-alpine

# add a non-privileged user for installing and running
# the application
RUN addgroup -g 10001 app && \
    adduser -D -G app -h /app -u 10001 app

WORKDIR /app

# Install node requirements and clean up temporary files
COPY package.json package.json
RUN apk add --update build-base ca-certificates git python gmp-dev && \
    npm --loglevel warn install && \
    npm cache clear --force && \
    apk del --purge build-base gcc git python && \
    rm -rf ~app/.node-gyp && \
    rm -rf ~app/.npm

COPY . /app

USER app
ENTRYPOINT ["npm"]
CMD ["start"]
