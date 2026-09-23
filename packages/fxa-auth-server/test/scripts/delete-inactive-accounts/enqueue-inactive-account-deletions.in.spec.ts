/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import childProcess from 'child_process';
import util from 'util';
import path from 'path';
import { DateTime } from 'luxon';

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

    const beforeRun = DateTime.utc();
    const cmd = [...command, '--bq-dataset fxa-dev.inactives-testo'];
    const { stdout } = await exec(cmd.join(' '), execOptions);
    const afterRun = DateTime.utc();
    const outputLines = stdout.split('\n');

    expect(stdout).toContain('Dry run mode is on.');

    const activeByDateString = getOutputValue(outputLines, 'Active by');
    const possibleCutoffs = [beforeRun, afterRun].map((now) =>
      now.minus({ years: 2 }).startOf('day')
    );
    expect(possibleCutoffs.map((cutoff) => cutoff.toISO())).toContain(
      activeByDateString
    );

    const startDateString = getOutputValue(outputLines, 'Start date');
    expect(startDateString).toBe('2014-01-18T00:00:00.000Z');

    const endDateString = getOutputValue(outputLines, 'End date');
    expect(
      possibleCutoffs.map((cutoff) => cutoff.minus({ days: 1 }).toISO())
    ).toContain(endDateString);

    const daysTilFirstEmailString = getOutputValue(outputLines, "Days 'til");
    expect(daysTilFirstEmailString).toBe('0');

    const dbResultsLimitString = getOutputValue(outputLines, 'Per MySQL query');
    expect(dbResultsLimitString).toBe('500000');
    expect(
      getOutputValue(outputLines, 'Active accounts maximum age in days')
    ).toBe('14');
    expect(getOutputValue(outputLines, 'State file')).toBe('(none)');
    expect(getOutputValue(outputLines, 'Scan window in days')).toBe('7');
    expect(getOutputValue(outputLines, 'Previous scan range')).toBe('(none)');
    expect(getOutputValue(outputLines, 'Rolled over')).toBe('false');
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

  it('accepts an active accounts dataset in dry-run mode', async () => {
    const cmd = [
      ...command,
      '--bq-dataset fxa-dev.inactives-testo',
      '--active-accounts-dataset my-project.active_accounts',
      '--active-account-tables-max-age-days 3',
    ];
    const { stdout } = await exec(cmd.join(' '), execOptions);
    expect(stdout).toContain(
      'Active accounts dataset: my-project.active_accounts'
    );
    expect(stdout).toContain('Dry run mode is on.');
    expect(stdout).toContain('Active accounts maximum age in days: 3');
  });

  it.each(['0', '-1', 'NaN', 'Infinity', '2days'])(
    'rejects invalid active accounts maximum age %j',
    async (maxAgeDays) => {
      const cmd = [
        ...command,
        '--bq-dataset fxa-dev.inactives-testo',
        `--active-account-tables-max-age-days '${maxAgeDays}'`,
      ];
      await expect(exec(cmd.join(' '), execOptions)).rejects.toMatchObject({
        code: 1,
        stderr: expect.stringContaining(
          'Active account tables maximum age must be a positive number of days.'
        ),
      });
    }
  );

  it.each([
    '',
    'dataset',
    '.dataset',
    'project.',
    'project.dataset.table',
    'project.dataset`',
    'abc.dataset',
    'Project.dataset',
    '1project.dataset',
    '-project.dataset',
    'project-.dataset',
    'my_project.dataset',
    'project.data-set',
    'project.data set',
  ])('rejects invalid active accounts dataset %j', async (datasetId) => {
    const cmd = [
      ...command,
      '--bq-dataset fxa-dev.inactives-testo',
      `--active-accounts-dataset '${datasetId}'`,
    ];
    await expect(exec(cmd.join(' '), execOptions)).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(
        'Active accounts dataset ID must have the form project.dataset.'
      ),
    });
  });

  it.each(['--start-date', '--end-date'])(
    'rejects %s without the other date',
    async (flag) => {
      const cmd = [
        ...command,
        '--bq-dataset fxa-dev.inactives-testo',
        `${flag} 2024-09-01`,
      ];
      await expect(exec(cmd.join(' '), execOptions)).rejects.toMatchObject({
        code: 1,
        stderr: expect.stringContaining(
          'Supply both --start-date and --end-date, or neither.'
        ),
      });
    }
  );

  it.each(['2024-09-01', '2024-09-08'])(
    'accepts a complete range ending on %s in dry-run mode',
    async (endDate) => {
      const cmd = [
        ...command,
        '--bq-dataset fxa-dev.inactives-testo',
        '--start-date 2024-09-01',
        `--end-date ${endDate}`,
      ];
      const { stdout } = await exec(cmd.join(' '), execOptions);
      expect(stdout).toContain('Start date: 2024-09-01T00:00:00.000Z');
      expect(stdout).toContain(`End date: ${endDate}T00:00:00.000Z`);
      expect(stdout).toContain('Dry run mode is on.');
    }
  );

  it.each([
    [
      '2024-9-01',
      '2024-09-18',
      'Start date must be a date in YYYY-MM-DD format.',
    ],
    [
      '2024-09-01',
      '2024-09-18T00:00:00Z',
      'End date must be a date in YYYY-MM-DD format.',
    ],
    [
      '2024-02-30',
      '2024-03-01',
      'Start date is not a valid calendar date: 2024-02-30',
    ],
    [
      '2024-02-01',
      '2024-02-30',
      'End date is not a valid calendar date: 2024-02-30',
    ],
  ])(
    'rejects invalid CLI dates (%p, %p)',
    async (startDate, endDate, error) => {
      const cmd = [
        ...command,
        '--bq-dataset fxa-dev.inactives-testo',
        `--start-date ${startDate}`,
        `--end-date ${endDate}`,
      ];
      await expect(exec(cmd.join(' '), execOptions)).rejects.toMatchObject({
        code: 1,
        stderr: expect.stringContaining(error),
      });
    }
  );

  it('reports the explicit scan-window size during a dry run', async () => {
    const cmd = [
      ...command,
      '--bq-dataset fxa-dev.inactives-testo',
      '--scan-window 3',
    ];
    const { stdout } = await exec(cmd.join(' '), execOptions);
    expect(stdout).toContain('Scan window in days: 3');
    expect(stdout).toContain('Dry run mode is on.');
  });

  it.each(['0', '-7', '1.5', 'NaN', '7days'])(
    'rejects scan-window value %j when it is not a positive integer',
    async (scanWindowValue) => {
      const cmd = [
        ...command,
        '--bq-dataset fxa-dev.inactives-testo',
        `--scan-window '${scanWindowValue}'`,
      ];
      await expect(exec(cmd.join(' '), execOptions)).rejects.toMatchObject({
        code: 1,
        stderr: expect.stringContaining(
          'Scan window must be a positive integer number of days.'
        ),
      });
    }
  );

  it.each([
    'https://fxa-state/state.json',
    'gs://fxa-state',
    'gs://fxa-state/',
  ])('rejects malformed state-file URL %j', async (stateFileUrl) => {
    const cmd = [
      ...command,
      '--bq-dataset fxa-dev.inactives-testo',
      `--state-file '${stateFileUrl}'`,
    ];
    await expect(exec(cmd.join(' '), execOptions)).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(
        `State file must be a gs://bucket/object URL: ${stateFileUrl}`
      ),
    });
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
