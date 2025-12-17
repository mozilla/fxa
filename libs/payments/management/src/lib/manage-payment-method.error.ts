/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class ManagePaymentMethodError extends BaseError {
  public readonly errorCode: string;

  constructor(message: string, info: Record<string, any>, errorCode: string) {
    super(errorCode, { info: {message, ...info} });
    this.name = 'ManagePaymentMethodError';
    this.errorCode = errorCode;
  }
}

export class ManagePaymentMethodIntentFailedGenericError extends ManagePaymentMethodError {
  constructor(errorCode: string) {
    super('ManagePaymentMethod Intent payment method failed with general error', {}, errorCode);
    this.name = 'ManagePaymentMethodIntentPaymentFailedGenericError';
  }
}

export class ManagePaymentMethodIntentFailedHandledError extends ManagePaymentMethodError {
  constructor(message: string, info: Record<string, any>, errorCode: string) {
    super(message, info, errorCode);
    this.name = 'ManagePaymentMethodIntentFailedHandledError';
  }
}

export class ManagePaymentMethodIntentCardDeclinedError extends ManagePaymentMethodIntentFailedHandledError {
  constructor(errorCode: string) {
    super('ManagePaymentMethod Intent payment method card declined', {}, errorCode);
    this.name = 'ManagePaymentMethodIntentCardDeclinedError';
  }
}

export class ManagePaymentMethodIntentCardExpiredError extends ManagePaymentMethodIntentFailedHandledError {
  constructor(errorCode: string) {
    super('ManagePaymentMethod Intent payment method card expired', {}, errorCode);
    this.name = 'ManagePaymentMethodIntentCardExpiredError';
  }
}

export class ManagePaymentMethodIntentTryAgainError extends ManagePaymentMethodIntentFailedHandledError {
  constructor(errorCode: string) {
    super('ManagePaymentMethod Intent failed with an error where customers can try again.', {}, errorCode);
    this.name = 'ManagePaymentMethodIntentTryAgainError';
  }
}

export class ManagePaymentMethodIntentGetInTouchError extends ManagePaymentMethodIntentFailedHandledError {
  constructor(errorCode: string) {
    super(
      'ManagePaymentMethod Intent failed with an error requiring customers to get in touch with the payment issuer.',
      {},
      errorCode
    );
    this.name = 'ManagePaymentMethodIntentGetInTouchError';
  }
}

export class ManagePaymentMethodIntentInsufficientFundsError extends ManagePaymentMethodIntentFailedHandledError {
  constructor(errorCode: string) {
    super(
      'ManagePaymentMethod Intent payment method card has insufficient funds',
      {errorCode},
      errorCode
    );
    this.name = 'ManagePaymentMethodIntentInsufficientFundsError';
  }
}
