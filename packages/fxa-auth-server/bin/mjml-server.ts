/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import http from 'http';
import WebSocket from 'ws';
import { resolve } from 'path';
import stream from 'stream';
import { watch } from 'fs';
import net from 'net';
import FluentLocalizer from '../lib/senders/emails/fluent-localizer';

const fluentLocalizer = new FluentLocalizer();

const baseUrl = require('../config').get('contentServer.url');

const { API_PORT = 8192, WS_PORT = 8193, HOST = '0.0.0.0' } = process.env;

const MJML_OPTIONS = {};

console.log(`Starting Storybook servers...
MJML renderer API: http://${HOST}:${API_PORT}
File watcher WebSocket: ws://${HOST}:${WS_PORT}`);

const apiServer = http.createServer(handleRequest);
apiServer.on('clientError', handleError);
apiServer.listen({ port: API_PORT, host: HOST });

watch(resolve('lib/senders/emails/'), { recursive: true }, (_, name) => {
  connections.forEach((s) => s.send('file-change'));
});

const socket = new WebSocket.Server({
  port: parseInt(WS_PORT as string),
});
let connections: WebSocket[] = [];
socket.on('connection', (socket) => {
  connections.push(socket);
  socket.on('close', () => {
    connections = connections.filter((s) => s !== socket);
  });
});

async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  try {
    const body = await readStream(req);
    const data = JSON.parse(body.trim());
    const {
      template: templateName,
      layout: layoutName,
      acceptLanguage,
      ...variables
    } = data;
    variables.baseUrl = baseUrl;
    const { html, subject } = await fluentLocalizer.localizeEmail(
      templateName,
      layoutName || 'fxa',
      variables,
      acceptLanguage
    );
    const result = JSON.stringify({ html, subject });

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(result.trim());
  } catch (err) {
    console.log(`ERR ${err}`);
    res.writeHead(400, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`Request error: ${err}`);
  }
  res.end();
}

function handleError(err: any, socket: net.Socket) {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
}

function readStream(readable: stream): Promise<string> {
  return new Promise((resolve, reject) => {
    const parts: any[] = [];
    readable.on('data', (chunk) => parts.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(parts).toString('utf8')));
    readable.on('error', (err) => reject(err));
  });
}
