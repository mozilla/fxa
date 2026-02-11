#!/usr/bin/env node -r esbuild-register

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const config = require('../config').default.getProperties();
const TestServer = require('../test/test_server');

TestServer.start(config, false).then((server) => {
  const cp = spawn(
    path.join(path.dirname(__dirname), 'node_modules/.bin/mocha.js'),
    ['test/remote'],
    { stdio: 'inherit' }
  );

  cp.on('close', async (code) => {
    await server.stop();
  });
});
