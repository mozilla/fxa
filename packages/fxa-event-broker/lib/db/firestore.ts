/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore, Settings } from '@google-cloud/firestore';
import { TypedCollectionReference, TypedDocumentReference } from 'typesafe-node-firestore';

import { ClientWebhooks } from '../selfUpdatingService/clientWebhookService';
import { Datastore } from './index';

interface User {
  oauth_clients: {
    [clientId: string]: boolean;
  };
}

interface WebhookUrl {
  webhookUrl: string;
}

interface FirestoreDbSettings extends Settings {
  prefix: string;
}

class FirestoreDatastore implements Datastore {
  private db: Firestore;
  private prefix: string;

  constructor(config: FirestoreDbSettings, firestore?: Firestore) {
    this.prefix = config.prefix;
    if (firestore) {
      this.db = firestore;
    } else {
      // keyFilename takes precedence over credentials
      if (config.keyFilename) {
        delete config.credentials;
      }
      this.db = new Firestore(config);
    }
  }

  public async storeLogin(uid: string, clientId: string) {
    const document = this.db.doc(`${this.prefix}users/${uid}`) as TypedDocumentReference<User>;
    const doc = await document.get();
    if (doc.exists) {
      const data = doc.data();
      if (data && data.oauth_clients && data.oauth_clients[clientId]) {
        // Record is already in the database
        return;
      }
    }
    await document.set({ oauth_clients: { [clientId]: true } }, { merge: true });
  }

  public async fetchClientIds(uid: string): Promise<string[]> {
    const document = this.db.doc(`${this.prefix}users/${uid}`) as TypedDocumentReference<User>;
    const doc = await document.get();
    if (doc.exists) {
      const data = doc.data();
      if (data && data.oauth_clients) {
        return Object.keys(data.oauth_clients);
      }
    }
    return [];
  }

  public async fetchClientIdWebhooks(): Promise<ClientWebhooks> {
    const webhookCollection = this.db.collection(
      `${this.prefix}clients`
    ) as TypedCollectionReference<WebhookUrl>;
    const results = await webhookCollection.select('webhookUrl').get();
    const clientWebhooks: ClientWebhooks = {};
    results.docs.forEach(doc => {
      clientWebhooks[doc.id] = doc.get('webhookUrl');
    });
    return clientWebhooks;
  }
}

export { FirestoreDatastore };
