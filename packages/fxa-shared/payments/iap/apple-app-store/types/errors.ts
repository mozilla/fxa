/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Possile errors when attempt to query a purchase using the App Store Server API and purchase records stored in Firestore
export enum PurchaseQueryError {
  NOT_FOUND = 'NotFound',
  OTHER_ERROR = 'OtherError',
}

// Possile errors when attempt to register a purchase to a user
export enum PurchaseUpdateError {
  CONFLICT = 'Conflict',
  INVALID_ORIGINAL_TRANSACTION_ID = 'InvalidOriginalTransactionId',
  OTHER_ERROR = 'OtherError',
}

export enum AppStoreHelperError {
  CREDENTIALS_NOT_FOUND = 'CredentialsNotFound',
}
