#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const bunyan = require('bunyan');

const config = require('../lib/config').root();

const logStreams = [
  {
    type: 'rotating-file',
    level: config.log.level,
    path: config.log.path,
    period: config.log.period,
    count: config.log.count
  },
  {
    type: 'raw',
    level: 'trace',
    stream: new bunyan.RingBuffer({ limit: 100 })
  }
];

if (config.env !== 'production') {
  logStreams.push({ stream: process.stderr, level: 'trace' });
}

const log = bunyan.createLogger(
  {
    name: 'picl-idp',
    streams: logStreams
  }
);

log.info(config, "starting config");

var statsBackend = config.stats.backend;
var statsConfig = config[statsBackend];

const stats = require('../lib/stats')(log)(statsBackend, statsConfig);

const memoryMonitor = new (require('../lib/memory_monitor'))();
memoryMonitor.on('mem', stats.mem.bind(stats));
memoryMonitor.start();

const routes = require('../routes');
const server = require('../server.js')(config, routes, log);

server.start(function() {
  log.info('running on ' + server.info.uri);
});

process.on(
  'SIGINT',
  function () {
    log.info('shutting down');
    server.stop(
      function () {
        process.exit();
      }
    );
  }
);
