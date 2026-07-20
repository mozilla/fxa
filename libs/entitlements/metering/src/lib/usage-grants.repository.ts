/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  type CollectionReference,
  type Timestamp,
} from '@google-cloud/firestore';

import { UsageGrantNotFoundError } from './metering.error';

export interface UsageGrantRecord {
  id: string;
  userIdentifier: string;
  slug: string;
  amount: number;
  grantedBy: string;
  reason?: string;
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
}

export type NewUsageGrant = Omit<UsageGrantRecord, 'id'>;

export async function insertUsageGrant(
  db: CollectionReference,
  data: NewUsageGrant
): Promise<UsageGrantRecord> {
  const ref = await db.add({
    userIdentifier: data.userIdentifier,
    slug: data.slug,
    amount: data.amount,
    grantedBy: data.grantedBy,
    ...(data.reason !== undefined ? { reason: data.reason } : {}),
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
  });
  return { id: ref.id, ...data };
}

export async function getUsageGrants(
  db: CollectionReference,
  userIdentifier: string
): Promise<UsageGrantRecord[]> {
  const result = await db.where('userIdentifier', '==', userIdentifier).get();
  return result.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userIdentifier: data['userIdentifier'],
      slug: data['slug'],
      amount: data['amount'],
      grantedBy: data['grantedBy'],
      reason: data['reason'],
      createdAt: data['createdAt'],
      expiresAt: data['expiresAt'] ?? null,
    };
  });
}

export async function deleteUsageGrant(
  db: CollectionReference,
  id: string
): Promise<void> {
  const ref = db.doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    throw new UsageGrantNotFoundError(id);
  }
  await ref.delete();
}
