/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getManagePaymentMethodErrorFtlInfo } from './getManagePaymentMethodErrorFtlInfo';

describe('getManagePaymentMethodErrorFtlInfo', () => {
  it.each([
    {
      errorCode: 'intent_failed_card_declined',
      expectedMessage:
        'Your transaction could not be processed. Please verify your credit card information and try again.',
      expectedFtl: 'manage-payment-method-intent-error-card-declined',
    },
    {
      errorCode: 'intent_failed_card_expired',
      expectedMessage:
        'It looks like your credit card has expired. Try another card.',
      expectedFtl: 'manage-payment-method-intent-error-expired-card-error',
    },
    {
      errorCode: 'intent_failed_try_again',
      expectedMessage:
        'Hmm. There was a problem authorizing your payment. Try again or get in touch with your card issuer.',
      expectedFtl: 'manage-payment-method-intent-error-try-again',
    },
    {
      errorCode: 'intent_failed_get_in_touch',
      expectedMessage:
        'Hmm. There was a problem authorizing your payment. Get in touch with your card issuer.',
      expectedFtl: 'manage-payment-method-intent-error-get-in-touch',
    },
    {
      errorCode: 'intent_failed_insufficient_funds',
      expectedMessage:
        'It looks like your card has insufficient funds. Try another card.',
      expectedFtl: 'manage-payment-method-intent-error-insufficient-funds',
    },
    {
      errorCode: 'tax_address_required',
      expectedMessage:
        'We could not determine your billing location. Please verify your payment method information and try again.',
      expectedFtl: 'manage-payment-method-tax-address-required',
    },
    {
      errorCode: 'intent_failed_generic',
      expectedMessage:
        'An unexpected error has occurred while processing your payment, please try again.',
      expectedFtl: 'manage-payment-method-intent-error-generic',
    },
  ])(
    'returns the correct message and FTL id for $errorCode',
    ({ errorCode, expectedMessage, expectedFtl }) => {
      expect(getManagePaymentMethodErrorFtlInfo(errorCode)).toEqual({
        message: expectedMessage,
        messageFtl: expectedFtl,
      });
    }
  );

  it('returns the generic error for an unknown error code', () => {
    expect(getManagePaymentMethodErrorFtlInfo('unknown_error_code')).toEqual({
      message:
        'An unexpected error has occurred while processing your payment, please try again.',
      messageFtl: 'manage-payment-method-intent-error-generic',
    });
  });

  it('returns the generic error when errorCode is undefined', () => {
    expect(getManagePaymentMethodErrorFtlInfo(undefined)).toEqual({
      message:
        'An unexpected error has occurred while processing your payment, please try again.',
      messageFtl: 'manage-payment-method-intent-error-generic',
    });
  });
});
