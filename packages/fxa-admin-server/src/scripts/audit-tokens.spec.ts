/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import util from 'node:util';
import path from 'node:path';
import { auditRowCounts, auditAge, auditOrphanedRows } from './audit-tokens';
import Config from '../config';
import { clearDb, bindKnex, scaffoldDb } from './db-helpers';

import { Account } from 'fxa-shared/db/models/auth';

const config = Config.getProperties();
const exec = util.promisify(require('node:child_process').exec);
const cwd = path.resolve(__dirname, '..');

describe('#integration - scripts/audit-tokens', () => {
  const uid = 'f9916686c226415abd06ae550f073cea';
  const email = 'user1@test.com';
  const createdAt = new Date('2022-10').getTime();
  const lastAccessTime = new Date('2022-11').getTime();

  beforeAll(async () => {
    bindKnex(config.database.fxa);
    await scaffoldDb(uid, email, createdAt, lastAccessTime);

    // Manually delete the account to simulate orphaned record situation.
    await Account.knexQuery().del();
  });

  describe('query checks)', () => {
    afterAll(async () => {
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
  });

  describe('cli', () => {
    jest.setTimeout(50000);

    async function testScript(args: string) {
      // Note that logger output, directs to standard err.
      const { stderr, stdout } = await exec(
        `NODE_ENV=development node -r esbuild-register scripts/audit-tokens.ts ${args}`,
        {
          cwd,
          shell: '/bin/bash',
        }
      );

      return { stderr, stdout };
    }

    it('applies no args', async () => {
      const { stdout } = await testScript('');
      assert.isTrue(/RowCount/.test(stdout));
      assert.isFalse(/AgeAudit/.test(stdout));
      assert.isFalse(/OrphanedRows/.test(stdout));
      assert.isFalse(/SELECT/.test(stdout));
      assert.isFalse(/AgeAudit/.test(stdout));
      assert.isFalse(/OrphanedRows/.test(stdout));
      assert.isFalse(/SELECT/.test(stdout));
    });

    it('applies verbose option', async () => {
      const { stdout } = await testScript('--verbose --console ');
      assert.isTrue(/-- AUDIT:/.test(stdout));
      assert.isTrue(/-- QUERY:/.test(stdout));
      assert.isTrue(/-- RESULT SUMMARY:/.test(stdout));
      assert.isTrue(/-- table_size/.test(stdout));
      assert.isTrue(/SELECT/.test(stdout));
    });

    it('applies dry option', async () => {
      const { stdout } = await testScript('--verbose --dry  --console ');
      assert.isTrue(/-- AUDIT: /.test(stdout));
      assert.isTrue(/-- QUERY:/.test(stdout));
      assert.isTrue(/-- RESULT SUMMARY: No Result/.test(stdout));
    });

    it('applies auditAge option', async () => {
      const { stdout } = await testScript('--verbose --auditAge  --console ');
      assert.isTrue(/-- AUDIT:.*AgeAudit/.test(stdout));
    });

    it('auditOrphanedRows option', async () => {
      const { stdout } = await testScript(
        '--verbose --auditOrphanedRows  --console '
      );
      assert.isTrue(/OrphanedRows/.test(stdout));
    });

    it('applies grep option', async () => {
      const { stdout } = await testScript(
        '--verbose --auditAge --grep sessionTokens '
      );
      assert.isTrue(
        /-- Excluding fxa.accountCustomers.AgeAudit.createdAt/.test(stdout)
      );
      assert.isTrue(
        /-- AUDIT: fxa.sessionTokens.AgeAudit.createdAt/.test(stdout)
      );
    });

    it('limits by sample size', async () => {
      const { stdout } = await testScript(
        '--verbose --auditAge --grep=sessionTokens --maxSampleSize=2 --console '
      );
      assert.isTrue(/LIMIT 2/.test(stdout));
    });
  });
});
