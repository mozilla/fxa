/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { FieldValue, type CollectionReference } from '@google-cloud/firestore';
import type {
  ChurnInterventionEntry,
} from './types';
import {
  ChurnInterventionEntryAlreadyExistsError,
  ChurnInterventionEntryCreateError,
  ChurnInterventionEntryNotFoundError,
  ChurnInterventionEntryMoreThanOneEntryExistsError,
  ChurnInterventionEntryMissingUpdateParamsError,
  ChurnInterventionEntryDeleteError,
} from './churn-intervention.error'

export async function createChurnInterventionEntry(
  db: CollectionReference,
  data: ChurnInterventionEntry
) {

  const existingRecord = await db
    .where('customerId', '==', data.customerId)
    .where('churnInterventionId', '==', data.churnInterventionId)
    .limit(1)
    .get();

  if (!existingRecord.empty) {
   throw new ChurnInterventionEntryAlreadyExistsError(data.customerId, data.churnInterventionId);
  }

  const doc = {
    customerId: data.customerId,
    churnInterventionId: data.churnInterventionId,
    redemptionCount: data.redemptionCount ?? 0,
  };

  await db.add(doc);

  try {
    return await getChurnInterventionEntry(db, data.customerId, data.churnInterventionId);
  } catch (error) {
    if (error instanceof ChurnInterventionEntryNotFoundError) {
      throw new ChurnInterventionEntryCreateError(data.customerId, data.churnInterventionId);
    } else {
      throw error;
    }
  }
}

export async function getChurnInterventionEntry(
  db: CollectionReference,
  customerId: string,
  churnInterventionId: string
) {
  const result = await db
    .where('customerId', '==', customerId)
    .where('churnInterventionId', '==', churnInterventionId)
    .limit(2)
    .get();

  if (result.empty) {
    throw new ChurnInterventionEntryNotFoundError(customerId, churnInterventionId);
  }

  if (result.size > 1) {
    throw new ChurnInterventionEntryMoreThanOneEntryExistsError(customerId, churnInterventionId);
  }

  const doc = result.docs[0];
  const docData = doc.data();
  return {
    data: {
      customerId: docData['customerId'],
      churnInterventionId: docData['churnInterventionId'],
      redemptionCount: docData['redemptionCount']
    },
    ref: doc.ref
  }
}

export async function updateChurnInterventionEntry(
  db: CollectionReference,
  customerId: string,
  churnInterventionId: string,
  incrementBy: number
) {
  if (!(Number.isInteger(incrementBy)) || incrementBy < 0) {
    throw new ChurnInterventionEntryMissingUpdateParamsError(customerId, churnInterventionId);
  }

  const { ref } = await getChurnInterventionEntry(db, customerId, churnInterventionId);
  await ref.update({
    redemptionCount: FieldValue.increment(incrementBy),
  });

  const { data } = await getChurnInterventionEntry(db, customerId, churnInterventionId);
  return data;
}

export async function deleteChurnInterventionEntry(
  db: CollectionReference,
  customerId: string,
  churnInterventionId: string,
) {
  const currentRecord = await getChurnInterventionEntry(db, customerId, churnInterventionId);

  await currentRecord.ref.delete();

  const existingRecord = await db
    .where('customerId', '==', customerId)
    .where('churnInterventionId', '==', churnInterventionId)
    .get();

  if (!existingRecord.empty) {
    throw new ChurnInterventionEntryDeleteError(customerId, churnInterventionId);
  }

  return true;
}
