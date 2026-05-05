/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import childProcess from 'child_process';
import util from 'util';
import path from 'path';

const exec = util.promisify(childProcess.exec);
const ROOT_DIR = '../../..';
const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: process.env,
};

const command = [
  'node',
  '-r ts-node/register/transpile-only',
  '-r tsconfig-paths/register',
  'scripts/delete-inactive-accounts/enqueue-inactive-account-deletions.ts',
];

describe('enqueue inactive account deletions script', () => {
  // combining tests because forking a process to run the script is a little
  // slow
  it('has correct defaults', async () => {
    const getOutputValue = (lines: string[], needle: string) => {
      const line = lines.find((line) => line.startsWith(needle));
      return line?.split(': ')[1];
    };

    const cmd = [...command, '--bq-dataset fxa-dev.inactives-testo'];
    const { stdout } = await exec(cmd.join(' '), execOptions);
    const outputLines = stdout.split('\n');

    expect(stdout).toContain('Dry run mode is on.');

    const now = new Date();
    const activeByDateString = getOutputValue(outputLines, 'Active by');
    const activeByDate = new Date(activeByDateString || '');
    const nowish = activeByDate.setFullYear(activeByDate.getFullYear() + 2);
    const diff = Math.abs(now.valueOf() - nowish.valueOf());
    expect(diff).toBeLessThanOrEqual(1000);

    const startDateString = getOutputValue(outputLines, 'Start date');
    expect(startDateString?.startsWith('2012-03-12')).toBe(true);

    const daysTilFirstEmailString = getOutputValue(outputLines, "Days 'til");
    expect(daysTilFirstEmailString).toBe('0');

    const dbResultsLimitString = getOutputValue(outputLines, 'Per MySQL query');
    expect(dbResultsLimitString).toBe('500000');
  });

  it('requires an BQ dataset id', async () => {
    try {
      await exec(command.join(' '), execOptions);
      throw new Error('Expected script to fail without a BQ dataset id');
    } catch (err: any) {
      expect(err.code).toBe(1);
      expect(err.stderr).toContain('BigQuery dataset ID is required.');
    }

    const cmd = [...command, '--bq-dataset fxa-dev.inactives-testo'];
    await exec(cmd.join(' '), execOptions);
  });

  it('requires the end date to be the same or later than the start date', async () => {
    try {
      const cmd = [
        ...command,
        '--end-date 2020-12-22',
        '--start-date 2021-12-22',
        '--bq-dataset fxa-dev.inactives-testo',
      ];
      await exec(cmd.join(' '), execOptions);
      throw new Error(
        'Expected script to fail with end date before start date'
      );
    } catch (err: any) {
      expect(err.code).toBe(1);
      expect(err.stderr).toContain(
        'The end date must be on the same day or later than the start date.'
      );
    }
  });
});
