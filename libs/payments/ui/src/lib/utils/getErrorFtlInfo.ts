/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import { CheckoutParams } from './types';

export function getErrorFtlInfo(
  reason: CartErrorReasonId | null,
  params: CheckoutParams,
  config: {
    contentServerUrl: string;
    supportUrl: string;
  }
) {
  switch (reason) {
    case CartErrorReasonId.CartEligibilityStatusDowngrade:
      return {
        buttonFtl: 'checkout-error-contact-support-button',
        buttonLabel: 'Contact Support',
        buttonUrl: config.supportUrl,
        message: 'Please contact support so we can help you.',
        messageFtl: 'checkout-error-contact-support',
      };
    case CartErrorReasonId.CartEligibilityStatusInvalid:
      return {
        buttonFtl: 'checkout-error-contact-support-button',
        buttonLabel: 'Contact Support',
        buttonUrl: config.supportUrl,
        message:
          'You are not eligible to subscribe to this product - please contact support so we can help you.',
        messageFtl: 'checkout-error-not-eligible',
      };
    case CartErrorReasonId.CartEligibilityStatusSame:
      return {
        buttonFtl: 'next-payment-error-manage-subscription-button',
        buttonLabel: 'Manage my subscription',
        buttonUrl: `${config.contentServerUrl}/subscriptions`,
        message: 'You’ve already subscribed to this product.',
        messageFtl: 'checkout-error-already-subscribed',
      };
    case CartErrorReasonId.IAP_UPGRADE_CONTACT_SUPPORT:
      return {
        buttonFtl: 'next-payment-error-manage-subscription-button',
        buttonLabel: 'Manage my subscription',
        buttonUrl: `${config.contentServerUrl}/subscriptions`,
        message:
          'You can still get this product — please contact support so we can help you.',
        messageFtl: 'next-iap-upgrade-contact-support',
      };
    case CartErrorReasonId.BASIC_ERROR:
    default:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing`,
        message: 'Something went wrong. Please try again later.',
        messageFtl: 'next-basic-error-message',
      };
  }
}
