/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import * as grpc from '@grpc/grpc-js';
import { assert as cassert } from 'chai';
import 'mocha';
import uuid4 from 'uuid/v4';

import { Datastore, FirestoreDatastore } from '../../../lib/db';

describe('Firestore database', () => {
  let fs: Firestore;
  let db: Datastore;
  let uid1: string;
  let uid2: string;

  before(() => {
    fs = new Firestore({
      customHeaders: {
        Authorization: 'Bearer owner'
      },
      port: 8006,
      projectId: 'fx-event-broker',
      servicePath: 'localhost',
      sslCreds: grpc.credentials.createInsecure()
    });
    db = new FirestoreDatastore({ prefix: 'fxatest-' }, fs);
  });

  beforeEach(() => {
    uid1 = 'uid_' + uuid4();
    uid2 = 'uid_' + uuid4();
  });

  it('stores a new login', async () => {
    await db.storeLogin(uid1, 'fx_send');
    const result = await db.fetchClientIds(uid1);
    cassert.deepEqual(result, ['fx_send']);
  });

  it('stores multiple user logins', async () => {
    await db.storeLogin(uid1, 'fx_send');
    await db.storeLogin(uid2, 'fx_screenshot');
    let result = await db.fetchClientIds(uid1);
    cassert.deepEqual(result, ['fx_send']);
    result = await db.fetchClientIds(uid2);
    cassert.deepEqual(result, ['fx_screenshot']);
  });

  it('stores multiple client ids', async () => {
    await db.storeLogin(uid1, 'fx_send');
    await db.storeLogin(uid1, 'fx_screenshot');
    const result = await db.fetchClientIds(uid1);
    cassert.deepEqual(result, ['fx_send', 'fx_screenshot']);
  });

  it('uses a collection prefix', async () => {
    await db.storeLogin(uid1, 'fx_send');
    const doc = await fs.doc('fxatest-users/' + uid1).get();
    const data = doc.data();
    cassert.deepEqual(data, { oauth_clients: { fx_send: true } });
  });
});
