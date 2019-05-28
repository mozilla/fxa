/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FirestoreDatastore } from './firestore';
import { InMemoryDatastore } from './in-memory';

interface Datastore {
  /**
   * Stores that a login has occured for user `uid` on service `clientId`.
   *
   * The Datastore should treat this as an idempotent request.
   */
  storeLogin(uid: string, clientId: string): Promise<void>;

  /**
   * Fetch the `clientId`s that user `uid` has logged into.
   */
  fetchClientIds(uid: string): Promise<string[]>;
}

type DatastoreConstructor = new (config: {}) => Datastore;

function createDatastore(
  constructor: DatastoreConstructor,
  config: {}
): Datastore {
  return new constructor(config);
}

export { createDatastore, Datastore, FirestoreDatastore, InMemoryDatastore };
