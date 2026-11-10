/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createHash } from 'crypto';

import type {
  CollectionReference,
  Timestamp,
} from '@google-cloud/firestore';

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

const PENDING_SUBCOLLECTION = 'pending';
const MAX_BATCH_WRITES = 500;

export interface FreeAccessPendingNotification {
  id: string;
  email: string | undefined;
  updateTime: Timestamp;
}

export function pendingNotificationId(email: string): string {
  return createHash('sha256').update(email.toLowerCase()).digest('hex');
}

function pendingRef(db: CollectionReference): CollectionReference {
  return db.doc(JOURNAL_DOC_ID).collection(PENDING_SUBCOLLECTION);
}

export async function upsertFreeAccessProgramPendingNotifications(
  db: CollectionReference,
  emails: string[],
  notBefore: number
): Promise<void> {
  const pending = pendingRef(db);
  for (let i = 0; i < emails.length; i += MAX_BATCH_WRITES) {
    const batch = db.firestore.batch();
    for (const email of emails.slice(i, i + MAX_BATCH_WRITES)) {
      batch.set(pending.doc(pendingNotificationId(email)), {
        email,
        notBefore,
      });
    }
    await batch.commit();
  }
}

export async function getDueFreeAccessProgramPendingNotifications(
  db: CollectionReference,
  now: number,
  limit: number
): Promise<FreeAccessPendingNotification[]> {
  const snap = await pendingRef(db)
    .where('notBefore', '<=', now)
    .orderBy('notBefore')
    .limit(limit)
    .get();
  return snap.docs.map((doc) => {
    const email = doc.get('email');
    return {
      id: doc.id,
      email: typeof email === 'string' ? email : undefined,
      updateTime: doc.updateTime,
    };
  });
}

/**
 * Fails with FAILED_PRECONDITION if the doc was re-queued after it was read,
 * so a newer change keeps its later notBefore.
 */
export async function deleteFreeAccessProgramPendingNotification(
  db: CollectionReference,
  notification: FreeAccessPendingNotification
): Promise<void> {
  await pendingRef(db)
    .doc(notification.id)
    .delete({ lastUpdateTime: notification.updateTime });
}
