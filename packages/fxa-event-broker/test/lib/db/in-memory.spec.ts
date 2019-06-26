/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert as cassert } from 'chai';
import 'mocha';

import { Datastore, InMemoryDatastore } from '../../../lib/db';

describe('In-Memory database', () => {
  let db: Datastore;

  beforeEach(() => {
    db = new InMemoryDatastore({});
  });

  it('stores a new login', async () => {
    await db.storeLogin('user_123', 'fx_send');
    const result = await db.fetchClientIds('user_123');
    cassert.deepEqual(result, ['fx_send']);
  });

  it('stores multiple user logins', async () => {
    await db.storeLogin('user_123', 'fx_send');
    await db.storeLogin('user_456', 'fx_screenshot');
    let result = await db.fetchClientIds('user_123');
    cassert.deepEqual(result, ['fx_send']);
    result = await db.fetchClientIds('user_456');
    cassert.deepEqual(result, ['fx_screenshot']);
  });

  it('stores multiple client ids', async () => {
    await db.storeLogin('user_123', 'fx_send');
    await db.storeLogin('user_123', 'fx_screenshot');
    const result = await db.fetchClientIds('user_123');
    cassert.deepEqual(result, ['fx_send', 'fx_screenshot']);
  });

  it('returns client webhooks', async () => {
    db = new InMemoryDatastore({ clientWebhooks: { testClient1: 'http://localhost/webhook' } });
    const result = await db.fetchClientIdWebhooks();
    cassert.deepEqual(result, { testClient1: 'http://localhost/webhook' });
  });
});
