/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CollectionReference } from '@google-cloud/firestore';
import {
  APPLE_APP_STORE_FORM_OF_PAYMENT,
  GOOGLE_PLAY_FORM_OF_PAYMENT,
  SkuType,
} from './constants';
import { TransactionType } from 'app-store-server-api';
import type { FirestorePurchaseRecord } from './types';

/**
 * Creates a purchase record in the database.
 *
 * @returns The created purchase record or throws an error if it couldn't be created.
 */
export async function createPurchase(
  db: CollectionReference,
  data: FirestorePurchaseRecord
): Promise<FirestorePurchaseRecord> {
  await db.doc(data.id).set(data);

  const createdDoc = await getPurchase(db, data.id);
  if (!createdDoc) {
    throw new Error('Failed to create purchase');
  }
  return createdDoc;
}

/**
 * Fetch a purchase from the database by id.
 *
 * @returns Purchase or undefined if not found.
 */
export async function getPurchase(
  db: CollectionReference,
  id: string
): Promise<FirestorePurchaseRecord | undefined> {
  const result = await db.doc(id).get();
  return result.data() as FirestorePurchaseRecord | undefined;
}

/**
 * Fetch active Google Play purchases for a user.
 *
 * @returns A list of active purchases.
 */
export async function getActiveGooglePurchasesForUserId(
  db: CollectionReference,
  userId: string,
  options?: {
    sku?: string;
    packageName?: string;
  }
) {
  let query = db
    .where('formOfPayment', '==', GOOGLE_PLAY_FORM_OF_PAYMENT)
    .where('skuType', '==', SkuType.SUBS)
    .where('userId', '==', userId)
    .where('isMutable', '==', true);

  if (options?.sku) {
    query = query.where('sku', '==', options.sku);
  }

  if (options?.packageName) {
    query = query.where('packageName', '==', options.packageName);
  }

  const result = await query.get();
  return result.docs.map((x) => x.data());
}

/**
 * Fetch active Apple purchases for a user.
 *
 * @returns A list of active purchases.
 */
export async function getActiveApplePurchasesForUserId(
  db: CollectionReference,
  userId: string,
  options?: {
    productId?: string;
    bundleId?: string;
  }
) {
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
  return result.docs.map((x) => x.data());
}

/**
 * Update a purchase in the database.
 *
 * Note that the returned object does not reflect the updated database state.
 */
export async function updatePurchase(
  db: CollectionReference,
  id: string,
  update: Partial<Omit<FirestorePurchaseRecord, 'id'>>
): Promise<void> {
  // Re-build properties for type-safety (Typescript allows wider type to be applied to narrower object type)
  const _update: typeof update = {};
  if (update.userId !== undefined) _update.userId = update.userId;
  if (update.formOfPayment !== undefined)
    _update.formOfPayment = update.formOfPayment;
  if (update.skuType !== undefined) _update.skuType = update.skuType;
  if (update.isMutable !== undefined) _update.isMutable = update.isMutable;

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
