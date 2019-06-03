/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as firebase from '@firebase/testing';
import * as firestore from '@google-cloud/firestore';
import { assert as cassert } from 'chai';
import 'mocha';
import * as uuid4 from 'uuid/v4';

import { Datastore, FirestoreDatastore } from '../../../lib/db';

describe('Firestore database', () => {
  let db: Datastore;
  let uid1: string;
  let uid2: string;

  before(() => {
    const app = firebase.initializeTestApp({
      auth: { uid: 'alice' },
      databaseName: 'my-database',
      projectId: 'fx-event-broker'
    });
    db = new FirestoreDatastore(
      {},
      (app.firestore() as unknown) as firestore.Firestore
    );
  });

  after(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
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
    cassert.deepEqual(result, ['fx_screenshot', 'fx_send']);
  });
});
