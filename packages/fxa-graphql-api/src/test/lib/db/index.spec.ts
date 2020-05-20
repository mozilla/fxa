/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';

import { dbHealthCheck } from '../../../lib/db';
import { testDatabaseSetup } from './models/auth/helpers';

describe('db', () => {
  describe('dbHealthCheck', () => {
    it('returns ok when db is configured', async () => {
      const knex = await testDatabaseSetup();
      const result = await dbHealthCheck();
      assert.deepEqual(result, { db: { status: 'ok' } });
      await knex.destroy();
    });

    it('returns error when db is not configured', async () => {
      const result = await dbHealthCheck();
      assert.deepEqual(result, { db: { status: 'error' } });
    });
  });
});
