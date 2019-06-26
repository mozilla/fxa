/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Datastore } from './index';

interface UserLogins {
  [userId: string]: boolean;
}

/**
 * Defines the config keys expected for InMemoryDatastore.
 */
interface Config {
  clientWebhooks?: { [clientId: string]: string };
}

class InMemoryDatastore implements Datastore {
  private users: { [key: string]: UserLogins };
  private webhooks: { [clientId: string]: string };

  constructor(config: Config) {
    this.users = {};
    this.webhooks = config.clientWebhooks || {};
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

  public async fetchClientIdWebhooks(): Promise<{ [clientId: string]: string }> {
    return this.webhooks;
  }
}

export { InMemoryDatastore };
