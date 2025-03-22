/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CollectionReference } from '@google-cloud/firestore';
import { APPLE_APP_STORE_FORM_OF_PAYMENT } from '../constants';
import { TransactionType } from 'app-store-server-api';
import type { FirestoreAppleIapPurchaseRecord } from '../types';

/**
 * Creates a purchase record in the database.
 */
export async function createPurchase(
  db: CollectionReference,
  data: FirestoreAppleIapPurchaseRecord
): Promise<FirestoreAppleIapPurchaseRecord> {
  // Re-build properties for type-safety (Typescript allows wider type to be applied to narrower object type)
  const doc = {
    userId: data.userId,
    autoRenewStatus: data.autoRenewStatus,
    autoRenewProductId: data.autoRenewProductId,
    bundleId: data.bundleId,
    environment: data.environment,
    inAppOwnershipType: data.inAppOwnershipType,
    originalPurchaseDate: data.originalPurchaseDate,
    originalTransactionId: data.originalTransactionId,
    productId: data.productId,
    status: data.status,
    transactionId: data.transactionId,
    type: data.type,
    verifiedAt: data.verifiedAt,
    currency: data.currency,
    price: data.price,
    storefront: data.storefront,
    expiresDate: data.expiresDate,
    purchaseDate: data.purchaseDate,
    renewalCurrency: data.renewalCurrency,
    renewalPrice: data.renewalPrice,
    latestNotificationType: data.latestNotificationType,
    formOfPayment: data.formOfPayment,
  };

  await db.doc(data.originalTransactionId).set(doc);

  const createdDoc = await getPurchase(db, data.originalTransactionId);
  if (!createdDoc) {
    throw new Error('Failed to create purchase');
  }
  return createdDoc;
}

/**
 * Fetch a purchase from the database by id.
 */
export async function getPurchase(
  db: CollectionReference,
  id: string
): Promise<FirestoreAppleIapPurchaseRecord | undefined> {
  const result = await db.doc(id).get();
  return result.data() as FirestoreAppleIapPurchaseRecord | undefined;
}

/**
 * Fetch active Apple purchases for a user.
 */
export async function getActivePurchasesForUserId(
  db: CollectionReference,
  userId: string,
  options?: {
    productId?: string;
    bundleId?: string;
  }
): Promise<FirestoreAppleIapPurchaseRecord[]> {
  let query = db
    .where('formOfPayment', '==', APPLE_APP_STORE_FORM_OF_PAYMENT)
    .where('type', '==', TransactionType.AutoRenewableSubscription)
    .where('userId', '==', userId);

  if (options?.productId) {
    query = query.where('productId', '==', options.productId);
  }

  if (options?.bundleId) {
    query = query.where('bundleId', '==', options.bundleId);
  }

  const result = await query.get();
  return result.docs.map((x) => x.data()) as FirestoreAppleIapPurchaseRecord[];
}

/**
 * Update a purchase in the database.
 *
 * Note that the returned object does not reflect the updated database state.
 */
export async function updatePurchase(
  db: CollectionReference,
  id: string,
  update: Partial<Omit<FirestoreAppleIapPurchaseRecord, 'id'>>
): Promise<void> {
  // Re-build properties for type-safety (Typescript allows wider type to be applied to narrower object type)
  const _update: typeof update = {};
  if (update.userId !== undefined) _update.userId = update.userId;

  if (Object.values(_update).length === 0) {
    throw new Error('Must provide at least one update param');
  }

  await db.doc(id).update(_update);
}

/**
 * Delete purchases from the database by userId.
 */
export async function deletePurchasesByUserId(
  db: CollectionReference,
  userId: string
): Promise<void> {
  const purchases = await db.where('userId', '==', userId).get();
  const batch = db.firestore.batch();
  for (const purchase of purchases.docs) batch.delete(purchase.ref);
  await batch.commit();
}
