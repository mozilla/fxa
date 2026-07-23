/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CollectionReference } from '@google-cloud/firestore';
import { GOOGLE_PLAY_FORM_OF_PAYMENT } from '../constants';
import type { FirestoreGoogleIapPurchaseRecord } from '../types';
import { SkuType } from './types';
import { stripUndefined } from '../util';

/**
 * Creates a Google IAP purchase record in the database.
 */
export async function createPurchase(
  db: CollectionReference,
  data: FirestoreGoogleIapPurchaseRecord
): Promise<FirestoreGoogleIapPurchaseRecord> {
  const doc = {
    purchaseToken: data.purchaseToken,
    startTimeMillis: data.startTimeMillis,
    orderId: data.orderId,
    kind: data.kind,
    formOfPayment: data.formOfPayment,
    developerPayload: data.developerPayload,
    skuType: data.skuType,
    priceCurrencyCode: data.priceCurrencyCode,
    priceAmountMicros: data.priceAmountMicros,
    countryCode: data.countryCode,
    replacedByAnotherPurchase: data.replacedByAnotherPurchase,
    packageName: data.packageName,
    paymentState: data.paymentState,
    sku: data.sku,
    userId: data.userId,
    acknowledgementState: data.acknowledgementState,
    userCancellationTimeMillis: data.userCancellationTimeMillis,
    cancelReason: data.cancelReason,
    autoRenewing: data.autoRenewing,
    cancelSurveyResult: data.cancelSurveyResult,
    isMutable: data.isMutable,
    expiryTimeMillis: data.expiryTimeMillis,
    verifiedAt: data.verifiedAt,
    latestNotificationType: data.latestNotificationType,
  };

  await db.doc(data.purchaseToken).set(doc);

  const createdDoc = await getPurchase(db, data.purchaseToken);
  if (!createdDoc) {
    throw new Error('Failed to create purchase');
  }

  return createdDoc;
}

/**
 * Fetch a Google IAP purchase by purchaseToken.
 */
export async function getPurchase(
  db: CollectionReference,
  purchaseToken: string
): Promise<FirestoreGoogleIapPurchaseRecord | undefined> {
  const result = await db.doc(purchaseToken).get();
  return result.data() as FirestoreGoogleIapPurchaseRecord | undefined;
}

/**
 * Fetch Google Play purchases for a user.
 */
export async function getActivePurchasesForUserId(
  db: CollectionReference,
  userId: string,
  options?: {
    sku?: string;
    packageName?: string;
  }
): Promise<FirestoreGoogleIapPurchaseRecord[]> {
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
  return result.docs.map((x) => x.data()) as FirestoreGoogleIapPurchaseRecord[];
}

/**
 * Update a Google IAP purchase.
 */
export async function updatePurchase(
  db: CollectionReference,
  id: string,
  update: Partial<Omit<FirestoreGoogleIapPurchaseRecord, 'id'>>
): Promise<void> {
  const _update = stripUndefined({
    purchaseToken: update.purchaseToken,
    startTimeMillis: update.startTimeMillis,
    orderId: update.orderId,
    kind: update.kind,
    formOfPayment: update.formOfPayment,
    developerPayload: update.developerPayload,
    skuType: update.skuType,
    priceCurrencyCode: update.priceCurrencyCode,
    priceAmountMicros: update.priceAmountMicros,
    countryCode: update.countryCode,
    replacedByAnotherPurchase: update.replacedByAnotherPurchase,
    packageName: update.packageName,
    paymentState: update.paymentState,
    sku: update.sku,
    userId: update.userId,
    acknowledgementState: update.acknowledgementState,
    userCancellationTimeMillis: update.userCancellationTimeMillis,
    cancelReason: update.cancelReason,
    autoRenewing: update.autoRenewing,
    cancelSurveyResult: update.cancelSurveyResult,
    isMutable: update.isMutable,
    expiryTimeMillis: update.expiryTimeMillis,
    verifiedAt: update.verifiedAt,
    latestNotificationType: update.latestNotificationType,
  });

  if (Object.keys(_update).length === 0) {
    throw new Error('Must provide at least one update param');
  }

  await db.doc(id).update(_update);
}

/**
 * Delete all purchases for a user.
 */
export async function deletePurchasesByUserId(
  db: CollectionReference,
  userId: string
): Promise<void> {
  const purchases = await db.where('userId', '==', userId).get();
  const batch = db.firestore.batch();
  for (const purchase of purchases.docs) {
    batch.delete(purchase.ref);
  }
  await batch.commit();
}
