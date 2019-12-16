FROM node:12-alpine

# as root
RUN apk update
RUN apk add g++ git
RUN npm install -g bower

RUN addgroup -g 10001 app && adduser -D -G app -h /app -u 10001 app
WORKDIR /app
USER app

# as app
COPY package.json package.json
COPY bower.json bower.json
COPY .bowerrc .bowerrc
RUN npm install
RUN /bin/rm -rf .npm

COPY . /app

USER root
RUN apk del -r g++ git

CMD node ./server.js
