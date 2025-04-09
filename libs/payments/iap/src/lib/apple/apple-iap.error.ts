/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class AppleIapError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}

export class AppleIapInvalidOriginalTransactionIdError extends AppleIapError {
  constructor(...args: ConstructorParameters<typeof AppleIapError>) {
    super(...args);
  }
}

export class AppleIapConflictError extends AppleIapError {
  constructor(...args: ConstructorParameters<typeof AppleIapError>) {
    super(...args);
  }
}

export class AppleIapUnknownError extends AppleIapError {
  constructor(...args: ConstructorParameters<typeof AppleIapError>) {
    super(...args);
  }
}

export class AppleIapNotFoundError extends AppleIapError {
  constructor(...args: ConstructorParameters<typeof AppleIapError>) {
    super(...args);
  }
}

export class AppleIapNoTransactionsFoundError extends AppleIapError {
  constructor(...args: ConstructorParameters<typeof AppleIapError>) {
    super(...args);
  }
}

export class AppleIapMissingCredentialsError extends AppleIapError {
  constructor(bundleId: string) {
    super(`No App Store credentials found for app with bundleId: ${bundleId}.`);
  }
}
