/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

import cp from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(cp.exec);

const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    ...process.env,
    PATH: process.env.PATH || '',
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};

describe('#integration - scripts/delete-account:', function () {
  it('does not fail', function () {
    this.timeout(15000);
    return execAsync(
      'node -r esbuild-register scripts/delete-account',
      execOptions
    );
  });
});
