/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timestamp, type CollectionReference } from '@google-cloud/firestore';
import type {
  StripeWebhookEvent,
  StripeWebhookEventFirestoreRecord,
} from './types';
import {
  StripeEventCreateError,
  StripeEventMissingRequiredError,
  StripeEventMissingUpdateParamsError,
  StripeEventNotFoundError,
} from './stripeEvent.error';

export async function createStripeEvent(
  db: CollectionReference,
  data: StripeWebhookEvent
) {
  const doc = {
    eventId: data.eventId,
    processedAt: Timestamp.fromDate(data.processedAt),
    eventDetails: data.eventDetails,
  };

  await db.doc(data.eventId).set(doc);

  const createdDoc = await getStripeEvent(db, data.eventId);
  if (!createdDoc) {
    throw new StripeEventCreateError(data.eventId);
  }

  return createdDoc;
}

export async function getStripeEvent(db: CollectionReference, eventId: string) {
  const result = await db.doc(eventId).get();

  const doc = result.data();

  if (!doc) {
    throw new StripeEventNotFoundError(eventId);
  }

  const processedAtTimestamp = doc['processedAt'] as Timestamp | undefined;
  if (!processedAtTimestamp || !(processedAtTimestamp instanceof Timestamp)) {
    throw new StripeEventMissingRequiredError(eventId, ['processedAt']);
  }

  return {
    ...doc,
    processedAt: processedAtTimestamp.toDate(),
  } as StripeWebhookEvent;
}

export async function updateStripeEvent(
  db: CollectionReference,
  eventId: string,
  update: Partial<Omit<StripeWebhookEvent, 'eventId'>>
) {
  const { processedAt, ...rest } = update;
  const _update: Partial<Omit<StripeWebhookEventFirestoreRecord, 'eventId'>> = {
    ...rest,
  };
  if (processedAt) {
    _update.processedAt = Timestamp.fromDate(processedAt);
  }

  if (Object.values(_update).length === 0) {
    throw new StripeEventMissingUpdateParamsError(eventId);
  }

  await db.doc(eventId).update(_update);

  return getStripeEvent(db, eventId);
}

export async function deleteStripeEvent(
  db: CollectionReference,
  eventId: string
) {
  await db.doc(eventId).delete();
}
