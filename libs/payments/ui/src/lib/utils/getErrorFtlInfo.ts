/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import { CheckoutParams } from './types';
import { URLSearchParams } from 'url';

export function getErrorFtlInfo(
  reason: CartErrorReasonId | string | null,
  params: CheckoutParams,
  config: {
    contentServerUrl: string;
    supportUrl: string;
  },
  searchParams?: Record<string, string | string[]>
) {

  const urlSearchParams = new URLSearchParams(searchParams);
  const queryParamString = searchParams ? `?${urlSearchParams.toString()}` : '';

  switch (reason) {
    case CartErrorReasonId.CART_ELIGIBILITY_STATUS_DOWNGRADE:
      return {
        buttonFtl: 'checkout-error-contact-support-button',
        buttonLabel: 'Contact Support',
        buttonUrl: config.supportUrl,
        message: 'Please contact support so we can help you.',
        messageFtl: 'checkout-error-contact-support',
      };
    case CartErrorReasonId.CART_ELIGIBILITY_STATUS_INVALID:
      return {
        buttonFtl: 'checkout-error-contact-support-button',
        buttonLabel: 'Contact Support',
        buttonUrl: config.supportUrl,
        message:
          'You are not eligible to subscribe to this product - please contact support so we can help you.',
        messageFtl: 'checkout-error-not-eligible',
      };
    case CartErrorReasonId.CART_ELIGIBILITY_STATUS_SAME:
      return {
        buttonFtl: 'next-payment-error-manage-subscription-button',
        buttonLabel: 'Manage my subscription',
        buttonUrl: `${config.contentServerUrl}/subscriptions${queryParamString}`,
        message: 'You’ve already subscribed to this product.',
        messageFtl: 'checkout-error-already-subscribed',
      };
    case CartErrorReasonId.IAP_BLOCKED_CONTACT_SUPPORT:
      return {
        buttonFtl: 'next-payment-error-manage-subscription-button',
        buttonLabel: 'Manage my subscription',
        buttonUrl: `${config.contentServerUrl}/subscriptions${queryParamString}`,
        message:
          'You have a mobile in-app subscription that conflicts with this product — please contact support so we can help you.',
        messageFtl: 'next-iap-blocked-contact-support',
      };
    case CartErrorReasonId.CART_CURRENCY_NOT_DETERMINED:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'We were unable to determine the currency for this purchase, please try again.',
        messageFtl: 'cart-error-currency-not-determined',
      };
    case CartErrorReasonId.CART_PROCESSING_GENERAL_ERROR:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'An unexpected error has occurred while processing your payment, please try again.',
        messageFtl: 'checkout-processing-general-error',
      };
    case CartErrorReasonId.CART_TOTAL_MISMATCH:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message: 'The invoice amount has changed. Please try again.',
        messageFtl: 'cart-total-mismatch-error',
      };
    case CartErrorReasonId.INTENT_FAILED_CARD_DECLINED:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'Your transaction could not be processed. Please verify your credit card information and try again.',
        messageFtl: 'intent-card-error',
      };
    case CartErrorReasonId.INTENT_FAILED_CARD_EXPIRED:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'It looks like your credit card has expired. Try another card.',
        messageFtl: 'intent-expired-card-error',
      };
    case CartErrorReasonId.INTENT_FAILED_TRY_AGAIN:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'Hmm. There was a problem authorizing your payment. Try again or get in touch with your card issuer.',
        messageFtl: 'intent-payment-error-try-again',
      };
    case CartErrorReasonId.INTENT_FAILED_GET_IN_TOUCH:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'Hmm. There was a problem authorizing your payment. Get in touch with your card issuer.',
        messageFtl: 'intent-payment-error-get-in-touch',
      };
    case CartErrorReasonId.INTENT_FAILED_GENERIC:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'An unexpected error has occurred while processing your payment, please try again.',
        messageFtl: 'intent-payment-error-generic',
      };
    case CartErrorReasonId.INTENT_FAILED_INSUFFICIENT_FUNDS:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'It looks like your card has insufficient funds. Try another card.',
        messageFtl: 'intent-payment-error-insufficient-funds',
      };
    case CartErrorReasonId.GENERAL_PAYPAL_ERROR:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message:
          'An unexpected error has occurred while processing your payment, please try again.',
        messageFtl: 'general-paypal-error',
      };
    case CartErrorReasonId.BASIC_ERROR:
    default:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing${queryParamString}`,
        message: 'Something went wrong. Please try again later.',
        messageFtl: 'next-basic-error-message',
      };
  }
}
