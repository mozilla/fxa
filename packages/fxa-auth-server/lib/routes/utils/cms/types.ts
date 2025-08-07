/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Strapi webhook payload interface
 */
export interface StrapiWebhookPayload {
  event: string;
  createdAt: string;
  updatedAt: string;
  entry: {
    id: number;
    documentId: string;
    clientId: string;
    entrypoint: string;
    name: string;
    shared?: any;
    [key: string]: any; // For dynamic component fields
  };
  model: string;
}
