/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  ManagePaymentMethodError,
  ManagePaymentMethodIntentFailedGenericError,
  ManagePaymentMethodIntentFailedHandledError,
  ManagePaymentMethodIntentCardDeclinedError,
  ManagePaymentMethodIntentCardExpiredError,
  ManagePaymentMethodIntentTryAgainError,
  ManagePaymentMethodIntentGetInTouchError,
  ManagePaymentMethodIntentInsufficientFundsError,
  ManagePaymentMethodTaxAddressRequiredError,
} from './manage-payment-method.error';

describe('ManagePaymentMethodError', () => {
  it('sets the name, message, and errorCode', () => {
    const error = new ManagePaymentMethodError(
      'test message',
      { key: 'value' },
      'test_error_code'
    );
    expect(error.name).toBe('ManagePaymentMethodError');
    expect(error.errorCode).toBe('test_error_code');
  });
});

describe('error subclasses', () => {
  it.each([
    {
      ErrorClass: ManagePaymentMethodIntentFailedGenericError,
      args: ['generic_decline'],
      expectedName: 'ManagePaymentMethodIntentPaymentFailedGenericError',
      expectedErrorCode: 'generic_decline',
    },
    {
      ErrorClass: ManagePaymentMethodIntentCardDeclinedError,
      args: ['card_declined'],
      expectedName: 'ManagePaymentMethodIntentCardDeclinedError',
      expectedErrorCode: 'card_declined',
    },
    {
      ErrorClass: ManagePaymentMethodIntentCardExpiredError,
      args: ['expired_card'],
      expectedName: 'ManagePaymentMethodIntentCardExpiredError',
      expectedErrorCode: 'expired_card',
    },
    {
      ErrorClass: ManagePaymentMethodIntentTryAgainError,
      args: ['processing_error'],
      expectedName: 'ManagePaymentMethodIntentTryAgainError',
      expectedErrorCode: 'processing_error',
    },
    {
      ErrorClass: ManagePaymentMethodIntentGetInTouchError,
      args: ['do_not_honor'],
      expectedName: 'ManagePaymentMethodIntentGetInTouchError',
      expectedErrorCode: 'do_not_honor',
    },
    {
      ErrorClass: ManagePaymentMethodIntentInsufficientFundsError,
      args: ['insufficient_funds'],
      expectedName: 'ManagePaymentMethodIntentInsufficientFundsError',
      expectedErrorCode: 'insufficient_funds',
    },
    {
      ErrorClass: ManagePaymentMethodTaxAddressRequiredError,
      args: ['tax_address_required'],
      expectedName: 'ManagePaymentMethodTaxAddressRequiredError',
      expectedErrorCode: 'tax_address_required',
    },
  ] as const)(
    '$expectedName sets the correct name and errorCode',
    ({ ErrorClass, args, expectedName, expectedErrorCode }) => {
      const error = new (ErrorClass as any)(...args);
      expect(error.name).toBe(expectedName);
      expect(error.errorCode).toBe(expectedErrorCode);
      expect(error).toBeInstanceOf(ManagePaymentMethodError);
    }
  );

  it('ManagePaymentMethodIntentFailedHandledError accepts custom message and info', () => {
    const error = new ManagePaymentMethodIntentFailedHandledError(
      'custom message',
      { detail: 'info' },
      'custom_code'
    );
    expect(error.name).toBe('ManagePaymentMethodIntentFailedHandledError');
    expect(error.errorCode).toBe('custom_code');
    expect(error).toBeInstanceOf(ManagePaymentMethodError);
  });

  it('card error subclasses are instances of ManagePaymentMethodIntentFailedHandledError', () => {
    const cardDeclined = new ManagePaymentMethodIntentCardDeclinedError(
      'card_declined'
    );
    expect(cardDeclined).toBeInstanceOf(
      ManagePaymentMethodIntentFailedHandledError
    );
  });
});
