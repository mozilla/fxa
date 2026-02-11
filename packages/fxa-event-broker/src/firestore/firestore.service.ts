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
} from '@fxa/vendored/typesafe-node-firestore';

import { AppConfig } from '../config';
import {
  UserDocument,
  WebhookUrlDocument,
  WebhookUrlDocumentMap,
} from './schemas.interface';

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
      // @ts-ignore
      delete config.credentials;
    }

    // Utilize the local firestore emulator when the env indicates
    if (!!process.env.FIRESTORE_EMULATOR_HOST) {
      this.db = new Firestore({
        customHeaders: {
          Authorization: 'Bearer owner',
        },
        port: 9090,
        projectId: 'demo-fxa',
        servicePath: 'localhost',
        sslCreds: grpc.credentials.createInsecure(),
      });
      if (this.prefix === 'fxa-eb-') {
        this.db
          .collection(`${this.prefix}clients`)
          .doc('dcdb5ae7add825d2')
          .set({
            webhookUrl: 'http://localhost:8080/api/webhook',
          });
      }
    } else {
      this.db = new Firestore(config);
    }
  }

  public async storeLogin(uid: string, clientId: string): Promise<boolean> {
    const document = this.db.doc(
      `${this.prefix}users/${uid}`
    ) as TypedDocumentReference<UserDocument>;
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

  /**
   * Deletes a user record in firebase.
   *
   * @param uid
   */
  public async deleteUser(uid: string): Promise<void> {
    const document = this.db.doc(
      `${this.prefix}users/${uid}`
    ) as TypedDocumentReference<UserDocument>;

    await document.delete();
  }

  /**
   * Fetches the OAuth Client Ids that a user has directly logged in to
   * via a Relying Party flow.
   *
   * @param uid User id of login history to fetch
   * @returns
   */
  public async fetchClientIds(uid: string): Promise<string[]> {
    const document = this.db.doc(
      `${this.prefix}users/${uid}`
    ) as TypedDocumentReference<UserDocument>;
    const doc = await document.get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.oauth_clients) {
        return Object.keys(data.oauth_clients);
      }
    }
    return [];
  }

  /**
   * Fetches the webhook URL documents for all the registered OAuth Clients
   * as well as whether they are act as a Resource Server.
   */
  public async fetchClientIdWebhookDocs(): Promise<WebhookUrlDocumentMap> {
    const webhookCollection = this.db.collection(
      `${this.prefix}clients`
    ) as TypedCollectionReference<WebhookUrlDocument>;
    const results = await webhookCollection
      .select('webhookUrl', 'isResourceServer')
      .get();
    const webhookUrlDocuments: WebhookUrlDocumentMap = {};
    results.docs.forEach((doc) => {
      webhookUrlDocuments[doc.id] = doc.data();
    });
    return webhookUrlDocuments;
  }

  /**
   * Register listeners for webhook URL's for all `clientId`s.
   *
   * This is an additional special-case function for Firestore as it
   * can push changes out when they occur rather than requiring polling.
   *
   * @param listener Function to call when `WebhookUrlDocument`s have changed.
   * @param error Function that will be called if there's an error
   *              handling the connection/query.
   * @returns a cancel function to halt the listener
   */
  public listenForClientIdWebhooks(
    listener: (
      changedWebhookUrlDocument: WebhookUrlDocumentMap,
      removedWebhookUrlDocument: WebhookUrlDocumentMap
    ) => void,
    error: (error: Error) => void
  ): () => void {
    const webhookCollection = this.db.collection(
      `${this.prefix}clients`
    ) as TypedCollectionReference<WebhookUrlDocument>;
    return webhookCollection.onSnapshot((snapshot) => {
      const changedWebhookUrlDocuments: WebhookUrlDocumentMap = {};
      const removedWebhookUrlDocuments: WebhookUrlDocumentMap = {};
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          changedWebhookUrlDocuments[change.doc.id] = change.doc.data();
        } else {
          removedWebhookUrlDocuments[change.doc.id] = change.doc.data();
        }
      });
      listener(changedWebhookUrlDocuments, removedWebhookUrlDocuments);
    }, error);
  }
}
