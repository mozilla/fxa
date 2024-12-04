/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import childProcess from 'child_process';
import util from 'util';
import path from 'path';
import { assert } from 'chai';

const exec = util.promisify(childProcess.exec);
const ROOT_DIR = '../../..';
const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: process.env,
};

const command = [
  'node',
  '-r esbuild-register',
  'scripts/delete-inactive-accounts/enqueue-inactive-account-deletions.ts',
];

describe('enqueue inactive account deletions script', () => {
  // combining tests because forking a process to run the script is a little
  // slow
  it('has correct defaults', async () => {
    const getOutputValue = (lines, needle) => {
      const line = lines.find((line) => line.startsWith(needle));
      return line?.split(': ')[1];
    };

    try {
      const cmd = [...command, '--end-date 2022-11-30'];
      const { stdout } = await exec(cmd.join(' '), execOptions);
      const outputLines = stdout.split('\n');

      assert.include(stdout, 'Dry run mode is on.');

      const now = new Date();
      const activeByDateString = getOutputValue(outputLines, 'Active by');
      const activeByDate = new Date(activeByDateString || '');
      const nowish = activeByDate.setFullYear(activeByDate.getFullYear() + 2);
      const diff = Math.abs(now.valueOf() - nowish.valueOf());
      assert.isAtMost(diff, 1000);

      const startDateString = getOutputValue(outputLines, 'Start date');
      assert.isTrue(startDateString.startsWith('2012-03-12'));

      const daysTilFirstEmailString = getOutputValue(outputLines, "Days 'til");
      assert.equal(daysTilFirstEmailString, '0');

      const dbResultsLimitString = getOutputValue(outputLines, 'Per DB query');
      assert.equal(dbResultsLimitString, '500000');
    } catch (err) {
      assert.fail(`Script failed with error: ${err}`);
    }
  });

  it('requires an end date', async () => {
    try {
      await exec(command.join(' '), execOptions);
      assert.fail('Expected script to fail without an end date');
    } catch (err) {
      assert.equal(err.code, 1);
      assert.include(err.stderr, 'End date is required.');
    }

    try {
      const cmd = [...command, '--end-date 2022-11-30'];
      await exec(cmd.join(' '), execOptions);
      assert.ok('Script executed without error');
    } catch (err) {
      assert.fail(`Script failed with error: ${err}`);
    }
  });
});
