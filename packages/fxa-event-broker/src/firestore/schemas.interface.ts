/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Firestore schemas for typesafe document access.
 *
 * These must be interfaces/types as they're used purely to type
 * plain objects returned from Firestore.
 *
 * @module
 */

/**
 * Firestore User document schema
 *
 * For every relying party a user logs into, an entry is made
 * with a `true` value under the OAuth clientId for the RP.
 *
 * The collection is keyed by the FxA user ID.
 */
export interface UserDocument {
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
 * If the RP acts as a Resource Server, the `isResourceServer` flag
 * should be set to `true`. This will resuult in the RP being sent
 * all events for all users.
 *
 * The collection is keyed by the Client ID.
 */
export interface WebhookUrlDocument {
  webhookUrl: string;
  isResourceServer?: boolean;
}

/**
 * Map of OAuth client IDs to WebhookUrl documents.
 */
export interface WebhookUrlDocumentMap {
  [clientId: string]: WebhookUrlDocument;
}
