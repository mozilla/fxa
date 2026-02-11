/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timestamp, type CollectionReference } from '@google-cloud/firestore';
import type {
  StripeEventStoreEntry,
  StripeEventStoreEntryFirestoreRecord,
} from './types';
import {
  StripeEventStoreEntryAlreadyExistsError,
  StripeEventStoreEntryCreateError,
  StripeEventStoreEntryDeleteError,
  StripeEventStoreEntryMissingRequiredError,
  StripeEventStoreEntryMissingUpdateParamsError,
  StripeEventStoreEntryNotFoundError,
} from './stripe-event-store.error';

export async function createStripeEventStoreEntry(
  db: CollectionReference,
  data: StripeEventStoreEntry
) {
  const existingRecord = await db.doc(data.eventId).get();
  if (existingRecord.data()) {
    throw new StripeEventStoreEntryAlreadyExistsError(data.eventId);
  }

  const doc = {
    eventId: data.eventId,
    processedAt: Timestamp.fromDate(data.processedAt),
    eventDetails: data.eventDetails,
  };

  await db.doc(data.eventId).set(doc);

  try {
    return await getStripeEventStoreEntry(db, data.eventId);
  } catch (error) {
    if (error instanceof StripeEventStoreEntryNotFoundError) {
      throw new StripeEventStoreEntryCreateError(data.eventId);
    } else {
      throw error;
    }
  }
}

export async function getStripeEventStoreEntry(
  db: CollectionReference,
  eventId: string
) {
  const result = await db.doc(eventId).get();

  const doc = result.data();

  if (!doc) {
    throw new StripeEventStoreEntryNotFoundError(eventId);
  }

  const processedAtTimestamp = doc['processedAt'] as Timestamp | undefined;
  if (!processedAtTimestamp || !(processedAtTimestamp instanceof Timestamp)) {
    throw new StripeEventStoreEntryMissingRequiredError(eventId, [
      'processedAt',
    ]);
  }

  return {
    ...doc,
    processedAt: processedAtTimestamp.toDate(),
  } as StripeEventStoreEntry;
}

export async function updateStripeEventStoreEntry(
  db: CollectionReference,
  eventId: string,
  update: Partial<Omit<StripeEventStoreEntry, 'eventId'>>
) {
  const { processedAt, ...rest } = update;
  const _update: Partial<
    Omit<StripeEventStoreEntryFirestoreRecord, 'eventId'>
  > = {
    ...rest,
  };
  if (processedAt) {
    _update.processedAt = Timestamp.fromDate(processedAt);
  }

  if (Object.values(_update).length === 0) {
    throw new StripeEventStoreEntryMissingUpdateParamsError(eventId);
  }

  await db.doc(eventId).update(_update);

  return getStripeEventStoreEntry(db, eventId);
}

export async function deleteStripeEventStoreEntry(
  db: CollectionReference,
  eventId: string
) {
  await db.doc(eventId).delete();

  const existingRecord = await db.doc(eventId).get();
  if (existingRecord.data()) {
    throw new StripeEventStoreEntryDeleteError(eventId);
  }

  return true;
}
