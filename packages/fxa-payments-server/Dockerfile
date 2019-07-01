FROM node:12 AS node-builder
USER node
RUN mkdir /home/node/fxa-payments-server /home/node/fxa-content-server
WORKDIR /home/node/fxa-payments-server
COPY ["fxa-payments-server/package*.json", "./"]
RUN npm ci
COPY ["fxa-payments-server/.storybook", ".storybook/"]
COPY ["fxa-payments-server/public", "public/"]
COPY ["fxa-payments-server/src", "src/"]
COPY ["fxa-content-server", "../fxa-content-server/"]
WORKDIR /home/node/fxa-content-server
RUN npm ci
WORKDIR /home/node/fxa-payments-server
ENV PUBLIC_URL /
RUN npm run build

FROM node:12-slim
USER node
RUN mkdir /home/node/fxa-payments-server
WORKDIR /home/node/fxa-payments-server
COPY --chown=node:node --from=node-builder /home/node/fxa-payments-server .
COPY --chown=node:node [ "fxa-payments-server/", "./" ]
CMD [ "/usr/local/bin/node", "server/bin/fxa-payments-server.js" ]
