FROM node:4.8.2-alpine

RUN apk add --no-cache git

RUN addgroup -g 10001 app && \
    adduser -D -G app -h /app -u 10001 app
WORKDIR /app

COPY package.json package.json 
COPY bower.json bower.json

RUN npm install --unsafe-perm --loglevel=warn && rm -rf ~app/.npm /tmp/*

# S3 bucket in Cloud Services prod IAM
ADD https://s3.amazonaws.com/dumb-init-dist/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

COPY . /app

RUN npm run build
