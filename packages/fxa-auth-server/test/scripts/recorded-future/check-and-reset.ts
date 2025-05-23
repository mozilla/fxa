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
  'scripts/recorded-future/check-and-reset.ts',
];

describe('#integration - recorded future credentials search and account reset script', () => {
  const getOutputValue = (lines: string[], needle: string) => {
    const line = lines.find((line) => line.startsWith(needle));
    return line?.split(': ')[1];
  };

  it('has correct defaults', async () => {
    try {
      const now = Date.now();

      // passing in an email so that the script won't try to use the Recorded Future API, which we are not set up in this context
      const cmd = [...command, `--email testo@example.gg`];
      const { stdout } = await exec(cmd.join(' '), execOptions);
      const outputLines = stdout.split('\n');

      assert.include(stdout, 'Dry run mode is on.');

      const expectedDate = new Date(now - 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const searchDomain = getOutputValue(outputLines, 'Domains');
      assert.equal(searchDomain, 'accounts.firefox.com');

      const filter = getOutputValue(outputLines, 'Filter');
      const firstDownloadedDateGte = filter?.substring(filter.length - 10);
      assert.equal(firstDownloadedDateGte, expectedDate);

      const limit = getOutputValue(outputLines, 'Limit');
      assert.equal(limit, '500');
    } catch (err) {
      assert.fail(`Script failed with error: ${err}`);
    }
  });

  it('uses given arguments', async () => {
    try {
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
      assert.equal(searchDomains, 'accounts.firefox.com, allizom.com');
      const filter = getOutputValue(outputLines, 'Filter');
      const firstDownloadedDateGte = filter?.substring(filter.length - 10);
      assert.equal(firstDownloadedDateGte, expectedDate);
    } catch (err) {
      assert.fail(`Script failed with error: ${err}`);
    }
  });
});
