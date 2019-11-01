FROM node:12 AS node-builder
USER node
RUN mkdir /home/node/fxa-amplitude-send
WORKDIR /home/node/fxa-amplitude-send
COPY package*.json ./
RUN npm install

FROM node:12-slim
USER node
RUN mkdir /home/node/fxa-amplitude-send
WORKDIR /home/node/fxa-amplitude-send
COPY --chown=node:node --from=node-builder /home/node/fxa-amplitude-send .
COPY --chown=node:node . .
