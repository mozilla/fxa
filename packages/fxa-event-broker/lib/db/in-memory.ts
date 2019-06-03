/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Datastore } from './index';

class InMemoryDatastore implements Datastore {
  private users: { [key: string]: { [key: string]: boolean } };

  constructor(config: {}) {
    this.users = {};
  }

  public async storeLogin(uid: string, clientId: string) {
    if (!this.users.hasOwnProperty(uid)) {
      this.users[uid] = {};
    }
    this.users[uid][clientId] = true;
  }

  public async fetchClientIds(uid: string): Promise<string[]> {
    return this.users.hasOwnProperty(uid) ? Object.keys(this.users[uid]) : [];
  }
}

export { InMemoryDatastore };
