/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { CollectionReference } from '@google-cloud/firestore';

import type { FreeAccessProjection } from '@fxa/shared/cms';

const JOURNAL_DOC_ID = 'state';

export async function getFreeAccessProgramJournal(
  db: CollectionReference
): Promise<FreeAccessProjection | null> {
  const snap = await db.doc(JOURNAL_DOC_ID).get();
  if (!snap.exists) return null;
  const data = snap.data();
  return (data?.projection ?? {}) as FreeAccessProjection;
}

export async function setFreeAccessProgramJournal(
  db: CollectionReference,
  projection: FreeAccessProjection
): Promise<void> {
  await db.doc(JOURNAL_DOC_ID).set({
    projection,
    updatedAt: Date.now(),
  });
}
