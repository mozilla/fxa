/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const TARGET_MODEL = 'access';
const UPSERT_EVENTS = new Set(['entry.publish', 'entry.update']);
const DELETE_EVENTS = new Set(['entry.unpublish', 'entry.delete']);

export type StrapiAccessWebhookPayload = {
  event: string;
  model?: string;
  createdAt?: string;
  entry?: {
    documentId?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

export type FreeAccessProgramWebhookResult =
  | { handled: false; reason: 'model' | 'no_document_id' | 'event' }
  | { handled: true; dedupe?: true };

export type AccessWebhookClassification =
  | { skip: 'model' | 'no_document_id' | 'event' }
  | { dedupeKey: string };

/**
 * Filters a Strapi webhook payload to relevant `access` upsert/delete events.
 * Returns a `dedupeKey` for a relevant change, or a `skip` reason otherwise.
 */
export function classifyAccessWebhook(
  payload: StrapiAccessWebhookPayload
): AccessWebhookClassification {
  if (payload.model !== TARGET_MODEL) {
    return { skip: 'model' };
  }
  const documentId = payload.entry?.documentId;
  if (!documentId) {
    return { skip: 'no_document_id' };
  }
  if (
    !UPSERT_EVENTS.has(payload.event) &&
    !DELETE_EVENTS.has(payload.event)
  ) {
    return { skip: 'event' };
  }
  return { dedupeKey: `${payload.event}|${documentId}|${payload.createdAt ?? ''}` };
}
