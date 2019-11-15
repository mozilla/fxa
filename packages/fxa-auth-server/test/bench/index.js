#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/* eslint-disable no-console */
const cp = require('child_process');
const split = require('binary-split');
const through = require('through');

let clientCount = 2;
const pathStats = {};
let requests = 0;
let pass = 0; // eslint-disable-line no-unused-vars
let fail = 0;
let start = null;

const server = cp.spawn('node', ['../../bin/key_server.js'], {
  cwd: __dirname,
});

server.stderr
  .pipe(split())
  .pipe(
    through(function(data) {
      try {
        this.emit('data', JSON.parse(data));
      } catch (e) {}
    })
  )
  .pipe(
    through(function(json) {
      if (json.level > 30 && json.op !== 'console') {
        console.log(json);
      }
      if (json.op && json.op === 'request.summary') {
        if (!start) {
          start = Date.now();
        }
        requests++;
        if (json.code === 200) {
          pass++;
        } else {
          fail++;
        }
        const stat = pathStats[json.path] || {};
        stat.count = stat.count + 1 || 1;
        stat.max = Math.max(stat.max || 0, json.t);
        stat.min = Math.min(stat.min || Number.MAX_VALUE, json.t);
        pathStats[json.path] = stat;
        this.emit('data', json);
      } else if (json.op === 'server.start.1') {
        startClients();
      }
    })
  );

function startClient() {
  const client = cp.spawn('node', ['./bot.js'], {
    cwd: __dirname,
  });
  client.stdout.on('data', process.stdout.write.bind(process.stdout));
  client.stderr.on('data', process.stderr.write.bind(process.stderr));
  return client;
}

function clientExit() {
  clientCount--;
  if (clientCount === 0) {
    const seconds = (Date.now() - start) / 1000;
    const rps = Math.floor(requests / seconds);
    console.log('rps: %d requests: %d errors: %d', rps, requests, fail);
    console.log(pathStats);
    server.kill('SIGINT');
  }
}

function startClients() {
  for (let i = 0; i < clientCount; i++) {
    const c = startClient();
    c.on('exit', clientExit);
  }
}
