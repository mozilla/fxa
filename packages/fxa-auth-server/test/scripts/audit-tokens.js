/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const util = require('node:util');
const path = require('path');
const {
  auditRowCounts,
  auditAge,
  auditOrphanedDeviceRows,
  auditOrphanedRows,
} = require('../../scripts/audit-tokens');
const mocks = require(`../../test/mocks`);
const config = require('../../config').getProperties();
const log = mocks.mockLog();
const { Account } = require('fxa-shared/db/models/auth/account');
const { clearDb, scaffoldDb, connectToDb } = require('./db-helpers');

const exec = util.promisify(require('node:child_process').exec);
const cwd = path.resolve(__dirname, '../..');

describe('scripts/audit-tokens', () => {
  const uid = 'f9916686c226415abd06ae550f073cea';
  const email = 'user1@test.com';
  const createdAt = new Date('2022-10').getTime();
  const lastAccessTime = new Date('2022-11').getTime();

  before(async () => {
    await connectToDb(config, log);
    await clearDb();
    await scaffoldDb(uid, email, createdAt, lastAccessTime);

    // Manually delete the account to simulate orphaned record situation.
    await Account.knexQuery().del();
  });

  describe('query checks)', () => {
    after(async () => {
      await clearDb();
    });

    it('counts rows', async () => {
      const result = await auditRowCounts('fxa.devices');
      assert.equal(result.table_size, 1);
    });

    it('gets age', async () => {
      const result = await auditAge(
        'fxa.sessionTokens',
        'createdAt',
        'tokenId'
      );
      assert.equal(result['2022-October'], 1);
    });

    it('finds orphan', async () => {
      await auditRowCounts('fxa.sessionTokens');
      const result = await auditOrphanedRows(
        {
          name: 'fxa.sessionTokens',
          keyCol: 'uid',
        },
        {
          name: 'fxa.accounts',
          keyCol: 'uid',
        }
      );

      assert.equal(result.percent_missing, 100);
      assert.equal(result.total_missing, 1);
      assert.equal(result.table_size, 1);
    });

    it('finds orphaned devices', async () => {
      await auditRowCounts('fxa.sessionTokens');
      await auditRowCounts('fxa.devices');
      const result = await auditOrphanedDeviceRows();

      assert.equal(result.total, 1);
      assert.equal(result.table_size, 1);

      assert.equal(result.total_missing_both, 1);
      assert.equal(result.total_missing_refresh_token, 1);
      assert.equal(result.total_missing_session_token, 1);

      assert.equal(result.percent_missing_both, 100);
      assert.equal(result.percent_missing_refresh_token, 100);
      assert.equal(result.percent_missing_session_token, 100);
    });
  });

  describe('cli', () => {
    async function testScript(args) {
      // Note that logger output, directs to standard err.
      const { stderr, stdout } = await exec(
        `NODE_ENV=dev node -r esbuild-register scripts/audit-tokens.ts ${args}`,
        {
          cwd,
          shell: '/bin/bash',
        }
      );

      return { stderr, stdout };
    }

    it('applies no args', async () => {
      const { stderr, stdout } = await testScript({});
      assert.isOk(/RowCount/.test(stderr));
      assert.isNotOk(/AgeAudit/.test(stderr));
      assert.isNotOk(/OrphanedRows/.test(stderr));
      assert.isNotOk(/SELECT/.test(stderr));
      assert.isNotOk(/AgeAudit/.test(stdout));
      assert.isNotOk(/OrphanedRows/.test(stdout));
      assert.isNotOk(/SELECT/.test(stdout));
    });

    it('applies verbose option', async () => {
      const { stdout } = await testScript('--verbose');
      assert.isOk(/-- AUDIT:/.test(stdout));
      assert.isOk(/-- QUERY:/.test(stdout));
      assert.isOk(/-- RESULT SUMMARY:/.test(stdout));
      assert.isOk(/-- table_size/.test(stdout));
      assert.isOk(/SELECT/.test(stdout));
    });

    it('applies dry option', async () => {
      const { stdout } = await testScript('--verbose --dry');
      assert.isOk(/-- AUDIT: /.test(stdout));
      assert.isOk(/-- QUERY:/.test(stdout));
      assert.isOk(/-- RESULT SUMMARY: No Result/.test(stdout));
    });

    it('applies auditAge option', async () => {
      const { stdout } = await testScript('--verbose --auditAge');
      assert.isOk(/-- AUDIT:.*AgeAudit/.test(stdout));
    });

    it('auditOrphanedRows option', async () => {
      const { stdout } = await testScript('--verbose --auditOrphanedRows');
      assert.isOk(/OrphanedRows/.test(stdout));
    });

    it('applies grep option', async () => {
      const { stdout } = await testScript(
        '--verbose --auditAge --grep sessionTokens '
      );
      assert.isOk(
        /-- Excluding fxa.accountCustomers.AgeAudit.createdAt/.test(stdout)
      );
      assert.isOk(
        /-- AUDIT: fxa.sessionTokens.AgeAudit.createdAt/.test(stdout)
      );
    });

    it('limits by sample size', async () => {
      const { stdout } = await testScript(
        '--verbose --auditAge --grep=sessionTokens --maxSampleSize=2 '
      );
      assert.isOk(/LIMIT 2/.test(stdout));
    });
  });
});
