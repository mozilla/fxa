/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

// See full list of codes here, https://www.twilio.com/docs/api/errors
export const TwilioErrorCodes = {
  ['INVALID_TO_PHONE_NUMBER']: 21211,
  ['SMS_SEND_RATE_LIMIT_EXCEEDED']: 14107,
};

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

export class RecoveryNumberNotSupportedError extends RecoveryPhoneError {
  constructor(phoneNumber: string, cause?: Error) {
    super('Phone number not supported.', { phoneNumber }, cause);
  }
}

export class RecoveryNumberRemoveMissingBackupCodes extends RecoveryPhoneError {
  constructor(uid: string, cause?: Error) {
    super(
      'Unable to remove recovery phone, missing backup authentication codes.',
      { uid },
      cause
    );
  }
}

export class SmsSendRateLimitExceededError extends RecoveryPhoneError {
  constructor(
    uid: string,
    toPhoneNumber: string,
    fromPhoneNumber: string,
    cause?: Error
  ) {
    super(
      'Too many SMS are currently being sent. Try again later.',
      { uid, toPhoneNumber, fromPhoneNumber },
      cause
    );
  }
}

export class RecoveryPhoneNotEnabled extends RecoveryPhoneError {
  constructor(cause?: Error) {
    super('Recovery phone not enabled.', {}, cause);
  }
}

export class RecoveryPhoneRegistrationLimitReached extends RecoveryPhoneError {
  constructor(phoneNumber: string, cause?: Error) {
    super(
      'Maximum registrations reached for this phone number.',
      { phoneNumber },
      cause
    );
  }
}

export class MessageBodyTooLong extends RecoveryPhoneError {
  constructor(
    public readonly maxSegmentLength: number,
    public readonly segmentCount: number,
    public readonly encoding: string,
    public readonly body: string
  ) {
    super('SMS body exceeds max segment length', {
      maxSegmentLength,
      segmentCount,
      body,
      encoding,
    });
  }
}