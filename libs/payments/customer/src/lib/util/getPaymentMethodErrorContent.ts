/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BannerVariant,
  PaymentMethodErrorType,
  SubPlatPaymentMethodType,
} from '@fxa/payments/customer';

export function getPaymentMethodErrorContent(
  error: PaymentMethodErrorType,
  paymentMethodType: SubPlatPaymentMethodType
) {
  switch (error) {
    case PaymentMethodErrorType.CardExpired:
      return {
        paymentMethodType,
        bannerType: BannerVariant.Error,
        bannerTitle: 'Expired card',
        bannerTitleFtl: 'error-payment-method-banner-title-expired-card',
        bannerMessage:
          'Add a new card or payment method to avoid interruption to your subscriptions.',
        bannerMessageFtl: 'error-payment-method-banner-message-add-new-card',
        bannerLinkLabel: 'Update payment method',
        bannerLinkLabelFtl:
          'error-payment-method-banner-label-update-payment-method',
        message:
          'Your card has expired. Please add a new card or payment method to avoid interruption to your subscriptions.',
        messageFtl: 'error-payment-method-expired-card',
      };
    case PaymentMethodErrorType.GenericIssue:
    default:
      const paymentMethodErrorContent = {
        paymentMethodType,
        bannerType: BannerVariant.Error,
        bannerTitle: 'Invalid payment information',
        bannerTitleFtl:
          'error-payment-method-banner-title-invalid-payment-information',
        bannerMessage: 'There is an issue with your account.',
        bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
        bannerLinkLabel: 'Manage payment method',
        bannerLinkLabelFtl:
          'subscription-management-button-manage-payment-method-1',
      };

      if (paymentMethodType === SubPlatPaymentMethodType.ApplePay) {
        return {
          ...paymentMethodErrorContent,
          message: `There is an issue with your Apple Pay account. Please resolve the issue to maintain your active subscriptions.`,
          messageFtl: 'subscription-management-error-apple-pay',
        };
      } else if (paymentMethodType === SubPlatPaymentMethodType.GooglePay) {
        return {
          ...paymentMethodErrorContent,
          message: `There is an issue with your Google Pay account. Please resolve the issue to maintain your active subscriptions.`,
          messageFtl: 'subscription-management-error-google-pay',
        };
      } else if (paymentMethodType === SubPlatPaymentMethodType.Link) {
        return {
          ...paymentMethodErrorContent,
          message: `There is an issue with your Link account. Please resolve the issue to maintain your active subscriptions.`,
          messageFtl: 'subscription-management-error-link',
        };
      } else if (paymentMethodType === SubPlatPaymentMethodType.PayPal) {
        return {
          ...paymentMethodErrorContent,
          message: `There is an issue with your PayPal account. Please resolve the issue to maintain your active subscriptions.`,
          messageFtl: 'subscription-management-error-paypal-billing-agreement',
        };
      } else {
        return {
          ...paymentMethodErrorContent,
          message: `There is an issue with your payment method. Please resolve the issue to maintain your active subscriptions.`,
          messageFtl: 'subscription-management-error-payment-method',
        };
      }
  }
}
