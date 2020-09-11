/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Firestore implementation.
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
import { Firestore } from '@google-cloud/firestore';
import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TypedCollectionReference,
  TypedDocumentReference,
} from 'typesafe-node-firestore';

import { ClientWebhooks } from '../client-webhooks/client-webhooks.interface';
import { AppConfig } from '../config';
import { User, WebhookUrl } from './schemas.interface';

@Injectable()
export class FirestoreService {
  private db: Firestore;
  private prefix: string;

  constructor(configService: ConfigService<AppConfig>) {
    const config = configService.get('firestore') as AppConfig['firestore'];
    this.prefix = config.prefix;
    // keyFilename takes precedence over credentials
    if (config.keyFilename) {
      /* istanbul ignore next */
      delete config.credentials;
    }

    // Utilize the local firestore emulator in when the env indicates
    if (!!process.env.FIRESTORE_EMULATOR_HOST) {
      this.db = new Firestore({
        customHeaders: {
          Authorization: 'Bearer owner',
        },
        port: 9090,
        projectId: 'fx-event-broker',
        servicePath: 'localhost',
        sslCreds: grpc.credentials.createInsecure(),
      });
    } else {
      this.db = new Firestore(config);
    }
  }

  public async storeLogin(uid: string, clientId: string): Promise<boolean> {
    const document = this.db.doc(
      `${this.prefix}users/${uid}`
    ) as TypedDocumentReference<User>;
    const doc = await document.get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.oauth_clients?.[clientId]) {
        // Record is already in the database
        return false;
      }
    }
    await document.set(
      { oauth_clients: { [clientId]: true } },
      { merge: true }
    );
    return true;
  }

  public async fetchClientIds(uid: string): Promise<string[]> {
    const document = this.db.doc(
      `${this.prefix}users/${uid}`
    ) as TypedDocumentReference<User>;
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
    results.docs.forEach((doc) => {
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
    return webhookCollection.onSnapshot((snapshot) => {
      const changedClientWebhooks: ClientWebhooks = {};
      const removedClientWebhooks: ClientWebhooks = {};
      snapshot.docChanges().forEach((change) => {
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
