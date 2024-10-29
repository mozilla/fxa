/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import util from 'node:util';
import path from 'node:path';
import {
  auditRowCounts,
  auditAge,
  auditOrphanedRows,
  formatStatLabel,
} from './audit-tokens';
import Config from '../config';
import { clearDb, bindKnex, scaffoldDb, TargetDB } from './db-helpers';

import { Account } from 'fxa-shared/db/models/auth';
import { Knex } from 'knex';
import { Profile } from 'fxa-shared/db/models/profile';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { randomBytes } from 'node:crypto';

const config = Config.getProperties();
const exec = util.promisify(require('node:child_process').exec);
const cwd = path.resolve(__dirname, '..');

describe('#integration - scripts/audit-tokens', () => {
  let fxaOauthDb: Knex;
  let fxaProfileDb: Knex;
  const uid = 'f9916686c226415abd06ae550f073cea';
  const email = 'user1@test.com';
  const createdAt = new Date('2022-10').getTime();
  const lastAccessTime = new Date('2022-11').getTime();

  beforeAll(async () => {
    // Create DB connections. Note that in the real world, these would be
    // separate databases instances. During local testing, we use the same
    // instance for all databases.
    fxaProfileDb = bindKnex(config.database.profile, TargetDB.profile);
    fxaOauthDb = bindKnex(config.database.fxa_oauth, TargetDB.oauth);

    await scaffoldDb(uid, email, createdAt, lastAccessTime);

    // Add a dummy profile
    await Profile.knexQuery().insert({
      userId: uuidTransformer.to(uid),
      displayName: 'test',
    });

    // Add a dummy auth token. Note, there are no DTOs for oauth db tables currently.
    await fxaOauthDb('tokens').insert({
      token: randomBytes(32),
      clientId: randomBytes(8),
      userId: uuidTransformer.to(uid),
      type: 'refresh',
      scope: '',
    });

    // Manually delete the account to simulate orphaned record situation.
    await Account.knexQuery().del();
  });

  describe('query checks)', () => {
    afterAll(async () => {
      await clearDb();
      await fxaProfileDb('profile').del();
      await fxaOauthDb('tokens').del();
    });

    it('counts rows in fxa db table', async () => {
      const result = await auditRowCounts('fxa.devices');
      assert.equal(result.table_size, 1);
    });

    it('counts rows in oauth db table', async () => {
      const result = await auditRowCounts('fxa_oauth.tokens');
      assert.equal(result.table_size, 1);
    });

    it('counts rows in profile db table', async () => {
      const result = await auditRowCounts('fxa_profile.profile');
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

describe('scripts/audit-tokens', () => {
  it('formats labels with fxa prefixes', () => {
    assert.equal(formatStatLabel('fxa.table'), 'fxa_table');
    assert.equal(formatStatLabel('.fxa.table'), 'fxa_table');
    assert.equal(formatStatLabel('fxa.table.'), 'fxa_table');
  });
  it('formats labels with fxa_profile prefixes', () => {
    assert.equal(formatStatLabel('fxa_profile.table'), 'fxa_profile_table');
  });

  it('formats labels with fxa_oauth prefixes', () => {
    assert.equal(formatStatLabel('fxa_oauth.table'), 'fxa_oauth_table');
  });

  it('prevents ... from being in the label', () => {
    assert.equal(
      formatStatLabel('fxa.table.RowCount...table_size'),
      'fxa_table.RowCount.table_size'
    );
    assert.equal(
      formatStatLabel('fxa.table.RowCount..table_size'),
      'fxa_table.RowCount.table_size'
    );
    assert.equal(
      formatStatLabel('fxa.table.RowCount.table_size'),
      'fxa_table.RowCount.table_size'
    );
  });
});
