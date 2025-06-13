/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * GoogleIapError is not intended for direct use, except for type-checking errors.
 * When throwing a new GoogleIapError, create a unique extension of the class.
 */
export class GoogleIapError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'GoogleIapError';
  }
}

export class GoogleIapSubscriptionNotFoundError extends GoogleIapError {
  constructor(packageName: string, sku: string, cause: Error) {
    super('Google IAP subscription not found', { packageName, sku }, cause);
    this.name = 'GoogleIapSubscriptionNotFoundError';
  }
}

export class GoogleIapInvalidMessagePayloadError extends GoogleIapError {
  constructor(messageData: string, cause: Error) {
    super('Invalid message payload', { messageData }, cause);
    this.name = 'GoogleIapInvalidMessagePayloadError';
  }
}

export class GoogleIapUnknownError extends GoogleIapError {
  constructor(message: string, cause: Error, info?: Record<string, any>) {
    super(message, info ?? {}, cause);
    this.name = 'GoogleIapUnknownError';
  }
}

export class GoogleIapGetFromPlayStoreUnknownError extends GoogleIapUnknownError {
  constructor(packageName: string, sku: string, cause: Error) {
    super(
      'An unknown error occured while retrieving a Google Play Store subscription purchase',
      cause,
      { packageName, sku }
    );
    this.name = 'GoogleIapGetFromPlayStoreUnknownError';
  }
}
export class GoogleIapClientUnknownError extends GoogleIapUnknownError {
  constructor(cause: Error) {
    super('Unknown Google IAP Error', cause);
    this.name = 'GoogleIapClientUnknownError';
  }
}

export class GoogleIapClientUnexpectedTypeError extends GoogleIapUnknownError {
  constructor(cause: Error) {
    super('An unknown Google IAP error occured of an unknown type', cause);
    this.name = 'GoogleIapClientUnexpectedTypeError';
  }
}

export class GoogleIapNonRegisterablePurchaseError extends GoogleIapError {
  constructor(packageName: string, sku: string, userId: string) {
    super('Google IAP is not registerable', { packageName, sku, userId });
    this.name = 'GoogleIapInvalidPurchaseTokenError';
  }
}

export class GoogleIapGetPurchaseError extends GoogleIapError {
  constructor(packageName: string, sku: string, userId: string, cause: Error) {
    super(
      'Failed to get purchase from Google Play store',
      { packageName, sku, userId },
      cause
    );
    this.name = 'GoogleIapGetPurchaseError';
  }
}

export class GoogleIapConflictError extends GoogleIapError {
  constructor(userId: string, orderId: string) {
    super('Purchase has been registered to another user', {
      userId,
      orderId,
    });
    this.name = 'GoogleIapConflictError';
  }
}
