/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import childProcess from 'child_process';
import util from 'util';
import path from 'path';
import { assert } from 'chai';

const exec = util.promisify(childProcess.exec);
const ROOT_DIR = '../..';
const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    ...process.env,
    NODE_ENV: 'dev',
  },
};

const command = [
  'node',
  '-r esbuild-register',
  'scripts/delete-unverified-accounts.ts',
];

describe('enqueue delete unverified account tasks script', () => {
  it('needs uid, email, or date range', async () => {
    try {
      await exec(command.join(' '), execOptions);
    } catch (err) {
      assert.include(
        err.stderr,
        'The program needs at least a uid, an email, or valid date range.'
      );
    }
  });

  it('allows uid/email or date range but not both', async () => {
    try {
      const cmd = [
        ...command,
        '--uid 0f0f0f',
        '--email testo@example.gg',
        '--start-date 2022-11-22',
        '--end-date 2022-11-30',
      ];
      await exec(cmd.join(' '), execOptions);
    } catch (err) {
      assert.include(
        err.stderr,
        'the script does not support uid/email arguments and a date range'
      );
    }
  });

  it('needs a positive integer for the limit', async () => {
    try {
      const cmd = [
        ...command,
        '--start-date 2022-11-22',
        '--end-date 2022-11-30',
        '--limit null',
      ];
      await exec(cmd.join(' '), execOptions);
    } catch (err) {
      assert.include(err.stderr, 'The limit should be a positive integer.');
    }
  });

  it('executes in dry-run mode by default', async () => {
    const cmd = [
      ...command,
      '--start-date 2022-11-22',
      '--end-date 2022-11-30',
    ];
    const { stdout } = await exec(cmd.join(' '), execOptions);
    assert.include(stdout, 'Dry run mode is on.');
  });

  it('warns about table scan', async () => {
    const cmd = [
      ...command,
      '--start-date 2022-11-22',
      '--end-date 2022-11-30',
      '--dry-run=false',
    ];
    const { stdout } = await exec(cmd.join(' '), execOptions);
    assert.include(stdout, 'Please call with --table-scan if you are sure.');
  });
});
