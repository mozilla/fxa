/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timestamp, type CollectionReference } from '@google-cloud/firestore';
import type { FreeTrialRecord } from './free-trial.types';

export async function insertFreeTrialRecord(
  db: CollectionReference,
  data: { uid: string; freeTrialConfigId: string; startedAt: Timestamp }
): Promise<void> {
  await db.add({
    uid: data.uid,
    freeTrialConfigId: data.freeTrialConfigId,
    startedAt: data.startedAt,
  });
}

export async function getLatestFreeTrialRecordData(
  db: CollectionReference,
  uid: string,
  freeTrialConfigId: string
): Promise<FreeTrialRecord | null> {
  const result = await db
    .where('uid', '==', uid)
    .where('freeTrialConfigId', '==', freeTrialConfigId)
    .orderBy('startedAt', 'desc')
    .limit(1)
    .get();

  if (result.empty) {
    return null;
  }

  const docData = result.docs[0].data();
  return {
    uid: docData['uid'],
    freeTrialConfigId: docData['freeTrialConfigId'],
    startedAt: docData['startedAt'],
  };
}
