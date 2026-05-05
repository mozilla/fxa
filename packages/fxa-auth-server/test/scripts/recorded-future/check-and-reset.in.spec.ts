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
  'scripts/recorded-future/check-and-reset.ts',
];

describe('#integration - recorded future credentials search and account reset script', () => {
  const getOutputValue = (lines: string[], needle: string) => {
    const line = lines.find((line) => line.startsWith(needle));
    return line?.split(': ')[1];
  };

  it('has correct defaults', async () => {
    const now = Date.now();

    // passing in an email so that the script won't try to use the Recorded Future API, which we are not set up in this context
    const cmd = [...command, `--email testo@example.gg`];
    const { stdout } = await exec(cmd.join(' '), execOptions);
    const outputLines = stdout.split('\n');

    expect(stdout).toContain('Dry run mode is on.');

    const expectedDate = new Date(now - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const searchDomain = getOutputValue(outputLines, 'Domains');
    expect(searchDomain).toBe('accounts.firefox.com');

    const filter = getOutputValue(outputLines, 'Filter');
    const firstDownloadedDateGte = filter?.substring(filter.length - 10);
    expect(firstDownloadedDateGte).toBe(expectedDate);

    const limit = getOutputValue(outputLines, 'Limit');
    expect(limit).toBe('500');
  });

  it('uses given arguments', async () => {
    const expectedDate = '2025-01-01';
    const cmd = [
      ...command,
      `--first-downloaded-date ${expectedDate}`,
      '--email testo@example.gg',
      '--search-domain accounts.firefox.com',
      '--search-domain allizom.com',
    ];
    const { stdout } = await exec(cmd.join(' '), execOptions);
    const outputLines = stdout.split('\n');

    const searchDomains = getOutputValue(outputLines, 'Domains');
    expect(searchDomains).toBe('accounts.firefox.com, allizom.com');
    const filter = getOutputValue(outputLines, 'Filter');
    const firstDownloadedDateGte = filter?.substring(filter.length - 10);
    expect(firstDownloadedDateGte).toBe(expectedDate);
  });
});
