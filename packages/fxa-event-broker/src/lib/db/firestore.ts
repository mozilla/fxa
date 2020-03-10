/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Firestore implementation of a `Datastore`.
 *
 * See https://firebase.google.com/docs/firestore/data-model for details on
 * the Firestore data model.
 *
 * Note that additional types in this module are used for typesafe access
 * to Firestore documents/collections as Firestore is a schemaless database
 * and we would like to enforce application-level constraints to the data.
 *
 * @module
 */
import { Firestore, Settings } from '@google-cloud/firestore';
import { TypedCollectionReference, TypedDocumentReference } from 'typesafe-node-firestore';

import { ClientWebhooks } from '../selfUpdatingService/clientWebhookService';
import { Datastore } from './index';

/**
 * Firestore User document schema
 *
 * For every relying party a user logs into, an entry is made
 * with a `true` value under the OAuth clientId for the RP.
 *
 * The collection is keyed by the FxA user ID.
 */
interface User {
  oauth_clients: {
    [clientId: string]: boolean;
  };
}

/**
 * Firestore WebhookUrl document schema
 *
 * RPs that have a registered webhookUrl in this collection will
 * have a message queued.
 *
 * The collection is keyed by the Client ID.
 */
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
      if (data?.oauth_clients?.[clientId]) {
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
      if (data?.oauth_clients) {
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

  /**
   * Register listeners for webhook URL's for all `clientId`s.
   *
   * This is an additional special-case function for Firestore as it
   * can push changes out when they occur rather than requiring polling.
   *
   * @param listener Function to call when webhooks have changed.
   * @param error Function that will be called if there's an error
   *              handling the connection/query.
   * @returns a cancel function to halt the listener
   */
  public listenForClientIdWebhooks(
    listener: (
      changedClientWebhooks: ClientWebhooks,
      removedClientWebhooks: ClientWebhooks
    ) => void,
    error: (error: Error) => void
  ): () => void {
    const webhookCollection = this.db.collection(
      `${this.prefix}clients`
    ) as TypedCollectionReference<WebhookUrl>;
    return webhookCollection.onSnapshot(snapshot => {
      const changedClientWebhooks: ClientWebhooks = {};
      const removedClientWebhooks: ClientWebhooks = {};
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          changedClientWebhooks[change.doc.id] = change.doc.get('webhookUrl');
        } else {
          removedClientWebhooks[change.doc.id] = change.doc.get('webhookUrl');
        }
      });
      listener(changedClientWebhooks, removedClientWebhooks);
    }, error);
  }
}

export { FirestoreDatastore };
