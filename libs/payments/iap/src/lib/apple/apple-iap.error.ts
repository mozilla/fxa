/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * AppleIapError is not intended for direct use, except for type-checking errors.
 * When throwing a new AppleIapError, create a unique extension of the class.
 */
export class AppleIapError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'AppleIapError';
  }
}

export class AppleIapInvalidOriginalTransactionIdError extends AppleIapError {
  constructor(userId: string, cause?: Error) {
    super('Invalid original transaction id', { userId }, cause);
    this.name = 'AppleIapInvalidOriginalTransactionIdError';
  }
}

export class AppleIapConflictError extends AppleIapError {
  constructor(userId: string, transactionId: string) {
    super('Purchase has been registered to another user', {
      userId,
      transactionId,
    });
    this.name = 'AppleIapConflictError';
  }
}

export class AppleIapUnknownError extends AppleIapError {
  constructor(message: string, cause: Error) {
    super(message, {}, cause);
    this.name = 'AppleIapUnknownError';
  }
}

export class AppleIapClientBundleError extends AppleIapUnknownError {
  constructor(cause: Error) {
    super('Unknown Apple IAP Error', cause);
    this.name = 'AppleIapClientBundleError';
  }
}

export class AppleIapClientBundleUnknownError extends AppleIapUnknownError {
  constructor(cause: Error) {
    super('Unknown Apple IAP error of unexpected type', cause);
    this.name = 'AppleIapCLientBundleUnknownError';
  }
}

export class GetFromAppStoreIapUnknownError extends AppleIapUnknownError {
  constructor(cause: Error) {
    super('Unknown Apple IAP error occured when retrieving purchase', cause);
    this.name = 'GetFromAppStoreIapUnknownError';
  }
}

export class AppleIapNotFoundError extends AppleIapError {
  constructor(cause: Error) {
    super('Apple IAP Not Found (4040010)', cause);
    this.name = 'AppleIapNotFoundError';
  }
}

export class AppleIapNoTransactionsFoundError extends AppleIapError {
  constructor(bundleId: string, originalTransactionId: string) {
    super('No transactions found', { bundleId, originalTransactionId });
    this.name = 'AppleIapNoTransactionsFoundError';
  }
}

export class AppleIapMissingCredentialsError extends AppleIapError {
  constructor(bundleId: string) {
    super('No App Store credentials found for app with bundleId', { bundleId });
    this.name = 'AppleIapMissingCredentialsError';
  }
}
