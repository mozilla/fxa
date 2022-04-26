/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  AutoRenewStatus,
  Environment,
  JWSRenewalInfoDecodedPayload,
  JWSTransactionDecodedPayload,
  LastTransactionsItem,
  OfferType,
  OwnershipType,
  StatusResponse,
  SubscriptionStatus,
  TransactionType,
} from 'app-store-server-api';

const FIRESTORE_OBJECT_INTERNAL_KEYS = ['formOfPayment'];
export const APPLE_APP_STORE_FORM_OF_PAYMENT = 'APPLE_APP_STORE';

export const SUBSCRIPTION_PURCHASE_REQUIRED_PROPERTIES = [
  'autoRenewStatus',
  'autoRenewProductId',
  'bundleId',
  'environment',
  'inAppOwnershipType',
  'originalPurchaseDate',
  'originalTransactionId',
  'productId',
  'status',
  'type',
  'verifiedAt',
];

/**
 * This file contains internal implementation of classes and utilities that
 * is only used inside of the library.
 *
 * This module uses the V2 App Store Server API implementation:
 * https://developer.apple.com/documentation/appstoreserverapi
 */

/* Convert a purchase object into a format that will be store in Firestore
 * Adds some shopkeeping metadata to the purchase object.
 */
function purchaseToFirestoreObject(purchase: SubscriptionPurchase): any {
  const fObj: any = {};
  Object.assign(fObj, purchase);
  fObj.formOfPayment = APPLE_APP_STORE_FORM_OF_PAYMENT;
  return fObj;
}

/* Merge a purchase object, which is created from App Store Server API response,
 * with a purchase record of the same object stored in Firestore.
 * The purchase object generated from the API response doesn't contain info of
 * purchase ownership (which user owns the product), while the record from
 * Firestore can be outdated, so we want to merge the objects to create an
 * updated representation of a purchase. We only skip our internal shopkeeping
 * metadata that the library consumer doesn't have to worry about.
 */
export function mergePurchaseWithFirestorePurchaseRecord(
  purchase: any,
  firestoreObject: any
) {
  // Copy all keys that exist in Firestore but not in Purchase object to the Purchase object.
  Object.keys(firestoreObject).map((key) => {
    // Skip the internal key-value pairs assigned by purchaseToFirestoreObject()
    if (
      purchase[key] === undefined &&
      FIRESTORE_OBJECT_INTERNAL_KEYS.indexOf(key) === -1
    ) {
      purchase[key] = firestoreObject[key];
    }
  });
}

/* Library's internal implementation of a SubscriptionPurchase object
 * It's used inside of the library, not to be exposed to library's consumers.
 */
export class SubscriptionPurchase {
  // Response from App Store API server Subscription Status endpoint
  // https://developer.apple.com/documentation/appstoreserverapi/get_all_subscription_statuses
  // IMPORTANT: If adding a new required property, also add it to SUBSCRIPTION_PURCHASE_REQUIRED_PROPERTIES
  private autoRenewStatus!: AutoRenewStatus;
  private autoRenewProductId!: string;
  bundleId!: string; // unique identifier for the iOS app; analogous to a Stripe product id
  private environment!: Environment;
  private inAppOwnershipType!: OwnershipType;
  private originalPurchaseDate!: number;
  originalTransactionId!: string; // unique identifier for the subscription; analogous to a Stripe subscription id
  private productId!: string; // unique identifier for the plan; analogous to the Stripe plan id
  private status!: SubscriptionStatus;
  private type!: TransactionType;
  private expirationIntent?: number;
  private expiresDate?: number;
  private gracePeriodExpiresDate?: number;
  private isInBillingRetry?: boolean;
  private isUpgraded?: boolean;
  private offerType?: OfferType;
  private offerIdentifier?: string;
  private revocationDate?: number;
  private revocationReason?: number;

  // Library-managed properties
  userId?: string; // hex string for FxA user id
  private verifiedAt!: number; // timestamp of last purchase verification by App Store Server API

  // Convert raw API response from App Store Server API to a SubscriptionPurchase object
  static fromApiResponse(
    apiResponse: StatusResponse,
    subscriptionStatus: LastTransactionsItem['status'],
    transactionInfo: JWSTransactionDecodedPayload,
    renewalInfo: JWSRenewalInfoDecodedPayload,
    originalTransactionId: string,
    verifiedAt: number
  ): SubscriptionPurchase {
    const purchase = new SubscriptionPurchase();
    purchase.autoRenewStatus = renewalInfo.autoRenewStatus;
    purchase.autoRenewProductId = renewalInfo.autoRenewProductId;
    purchase.bundleId = apiResponse.bundleId;
    purchase.environment = apiResponse.environment;
    purchase.inAppOwnershipType = transactionInfo.inAppOwnershipType;
    purchase.originalPurchaseDate = transactionInfo.originalPurchaseDate;
    purchase.originalTransactionId = originalTransactionId;
    purchase.productId = transactionInfo.productId;
    purchase.status = subscriptionStatus;
    purchase.type = transactionInfo.type;
    purchase.verifiedAt = verifiedAt;

    if (renewalInfo.expirationIntent) {
      purchase.expirationIntent = renewalInfo.expirationIntent;
    }
    if (transactionInfo.expiresDate) {
      purchase.expiresDate = transactionInfo.expiresDate;
    }
    if (renewalInfo.gracePeriodExpiresDate) {
      purchase.gracePeriodExpiresDate = renewalInfo.gracePeriodExpiresDate;
    }
    if (renewalInfo.hasOwnProperty('isInBillingRetryPeriod')) {
      // We don't check this.status === SubscriptionStatus.InBillingRetry, since
      // it's not mutually exclusive with other subscription states (i.e.
      // SubscriptionStatus.InBillingGracePeriod).
      purchase.isInBillingRetry = renewalInfo.isInBillingRetryPeriod;
    }
    if (transactionInfo.hasOwnProperty('isUpgraded')) {
      purchase.isUpgraded = transactionInfo.isUpgraded;
    }
    if (renewalInfo.offerIdentifier) {
      purchase.offerIdentifier = renewalInfo.offerIdentifier;
    }
    if (renewalInfo.offerType) {
      purchase.offerType = renewalInfo.offerType;
    }
    if (transactionInfo.revocationDate) {
      purchase.revocationDate = transactionInfo.revocationDate;
    }
    if (transactionInfo.hasOwnProperty('revocationReason')) {
      purchase.revocationReason = transactionInfo.revocationReason;
    }

    return purchase;
  }

  /**
   * Converts purchase data from a Firestore document to a SubscriptionPurchase.
   * In particular, there are some shopkeeping properties that are only used in
   * Firestore; see FIRESTORE_OBJECT_INTERNAL_KEYS.
   */
  static fromFirestoreObject(firestoreObject: any) {
    const purchase = new SubscriptionPurchase();
    purchase.mergeWithFirestorePurchaseRecord(firestoreObject);
    return purchase;
  }

  toFirestoreObject(): any {
    return purchaseToFirestoreObject(this);
  }

  mergeWithFirestorePurchaseRecord(firestoreObject: any) {
    mergePurchaseWithFirestorePurchaseRecord(this, firestoreObject);
  }

  isEntitlementActive() {
    return [
      SubscriptionStatus.Active,
      SubscriptionStatus.InBillingGracePeriod,
    ].includes(this.status);
  }

  willRenew() {
    return this.autoRenewStatus === AutoRenewStatus.On;
  }

  isInBillingRetryPeriod() {
    return this.isInBillingRetry;
  }

  isInGracePeriod() {
    return this.status === SubscriptionStatus.InBillingGracePeriod;
  }

  isTestPurchase(): boolean {
    return this.environment === Environment.Sandbox;
  }

  isFreeTrial(): boolean {
    return this.offerType === OfferType.Introductory;
  }
}
