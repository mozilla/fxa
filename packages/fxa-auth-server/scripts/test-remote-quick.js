#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const config = require('../config').getProperties();
const TestServer = require('../test/test_server');

TestServer.start(config, false).then(server => {
  const cp = spawn(
    path.join(path.dirname(__dirname), 'node_modules/.bin/mocha'),
    ['test/remote'],
    { stdio: 'inherit' }
  );

  cp.on('close', code => {
    server.stop();
  });
});
