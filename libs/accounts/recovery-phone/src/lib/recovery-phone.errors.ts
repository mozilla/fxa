/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class RecoveryPhoneError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, {
      name: 'RecoveryPhoneError',
      cause,
      info,
    });
  }
}

export class RecoveryNumberNotExistsError extends RecoveryPhoneError {
  constructor(uid: string, cause?: Error) {
    super('Recovery number does not exist', { uid }, cause);
  }
}

export class RecoveryNumberInvalidFormatError extends RecoveryPhoneError {
  constructor(uid: string, phoneNumber: string, cause?: Error) {
    super('Invalid phone number format', { uid, phoneNumber }, cause);
  }
}

export class RecoveryNumberAlreadyExistsError extends RecoveryPhoneError {
  constructor(uid: string, phoneNumber: string, cause?: Error) {
    super('Recovery number already exists', { uid, phoneNumber }, cause);
  }
}
