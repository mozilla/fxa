/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cp from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(cp.exec);
const ROOT_DIR = '../..';
const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    ...process.env,
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};

describe('starting script - move-customers-to-new-plan-v2', () => {
  it('does not fail', async () => {
    await execAsync(
      'node -r esbuild-register scripts/move-customers-to-new-plan-v2.ts --help',
      execOptions
    );
  });
});
