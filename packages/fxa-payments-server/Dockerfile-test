FROM node:12 AS node-builder
USER node
RUN mkdir /home/node/fxa-payments-server
WORKDIR /home/node/fxa-payments-server
COPY package*.json ./
RUN npm install

FROM node:12-slim
USER node
RUN mkdir /home/node/fxa-payments-server
WORKDIR /home/node/fxa-payments-server
COPY --chown=node:node --from=node-builder /home/node/fxa-payments-server .
COPY --chown=node:node . .

# Jest test runner needs this to disable interactive mode
ENV CI=yes