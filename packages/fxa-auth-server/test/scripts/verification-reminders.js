/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const cp = require('child_process');
const util = require('util');
const path = require('path');

const execAsync = util.promisify(cp.exec);

const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};

describe('scripts/verification-reminders:', () => {
  it('does not fail', () => {
    return execAsync(
      'node -r esbuild-register scripts/verification-reminders',
      execOptions
    );
  });
});
