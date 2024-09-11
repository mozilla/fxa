/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import path from 'path';
import { spawn } from 'child_process';
import configModule from "../config";
const config = configModule.getProperties();
import TestServer from '../test/test_server';

TestServer.start(config, false).then((server) => {
  const cp = spawn(
    path.join(path.dirname(__dirname), 'node_modules/.bin/mocha.js'),
    ['test/remote'],
    { stdio: 'inherit' }
  );

  cp.on('close', (code) => {
    server.stop();
  });
});
