/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function getManagePaymentMethodErrorFtlInfo(
  errorCode: string,
) {
  switch (errorCode) {
    case 'intent_failed_card_declined':
      return {
        message:
          'Your transaction could not be processed. Please verify your credit card information and try again.',
        messageFtl: 'manage-payment-method-intent-error-card-declined',
      };
    case 'intent_failed_card_expired':
      return {
        message:
          'It looks like your credit card has expired. Try another card.',
        messageFtl: 'manage-payment-method-intent-error-expired-card-error',
      };
    case 'intent_failed_try_again':
      return {
        message:
          'Hmm. There was a problem authorizing your payment. Try again or get in touch with your card issuer.',
        messageFtl: 'manage-payment-method-intent-error-try-again',
      };
    case 'intent_failed_get_in_touch':
      return {
        message:
          'Hmm. There was a problem authorizing your payment. Get in touch with your card issuer.',
        messageFtl: 'manage-payment-method-intent-error-get-in-touch',
      };
    case 'intent_failed_insufficient_funds':
      return {
        message:
          'It looks like your card has insufficient funds. Try another card.',
        messageFtl: 'manage-payment-method-intent-error-insufficient-funds',
      };
    case 'intent_failed_generic':
    default:
      return {
        message:
          'An unexpected error has occurred while processing your payment, please try again.',
        messageFtl: 'manage-payment-method-intent-error-generic',
      };
  }
}
