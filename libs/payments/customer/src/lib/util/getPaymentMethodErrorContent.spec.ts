/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '@testing-library/jest-dom/extend-expect';
import {
  BannerVariant,
  PaymentMethodErrorType,
  SubPlatPaymentMethodType,
} from '../types';
import { getPaymentMethodErrorContent } from './getPaymentMethodErrorContent';

describe('getPaymentMethodErrorContent', () => {
  it('returns expired card error message - card', () => {
    expect(
      getPaymentMethodErrorContent(
        PaymentMethodErrorType.CardExpired,
        SubPlatPaymentMethodType.Card
      )
    ).toEqual({
      bannerType: BannerVariant.Error,
      bannerLinkLabel: 'Update payment method',
      bannerLinkLabelFtl:
        'error-payment-method-banner-label-update-payment-method',
      bannerMessage:
        'Add a new card or payment method to avoid interruption to your subscriptions.',
      bannerMessageFtl: 'error-payment-method-banner-message-add-new-card',
      bannerTitle: 'Expired card',
      bannerTitleFtl: 'error-payment-method-banner-title-expired-card',
      message:
        'Your card has expired. Please add a new card or payment method to avoid interruption to your subscriptions.',
      messageFtl: 'error-payment-method-expired-card',
      paymentMethodType: SubPlatPaymentMethodType.Card,
    });
  });

  it('returns expired card error message - Apple Pay', () => {
    expect(
      getPaymentMethodErrorContent(
        PaymentMethodErrorType.GenericIssue,
        SubPlatPaymentMethodType.ApplePay
      )
    ).toEqual({
      bannerType: BannerVariant.Error,
      bannerLinkLabel: 'Manage payment method',
      bannerLinkLabelFtl:
        'subscription-management-button-manage-payment-method-1',
      bannerMessage: 'There is an issue with your account.',
      bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
      bannerTitle: 'Invalid payment information',
      bannerTitleFtl:
        'error-payment-method-banner-title-invalid-payment-information',
      message:
        'There is an issue with your Apple Pay account. Please resolve the issue to maintain your active subscriptions.',
      messageFtl: 'subscription-management-error-apple-pay',
      paymentMethodType: SubPlatPaymentMethodType.ApplePay,
    });
  });

  it('returns expired card error message - Google Pay', () => {
    expect(
      getPaymentMethodErrorContent(
        PaymentMethodErrorType.GenericIssue,
        SubPlatPaymentMethodType.GooglePay
      )
    ).toEqual({
      bannerType: BannerVariant.Error,
      bannerLinkLabel: 'Manage payment method',
      bannerLinkLabelFtl:
        'subscription-management-button-manage-payment-method-1',
      bannerMessage: 'There is an issue with your account.',
      bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
      bannerTitle: 'Invalid payment information',
      bannerTitleFtl:
        'error-payment-method-banner-title-invalid-payment-information',
      message:
        'There is an issue with your Google Pay account. Please resolve the issue to maintain your active subscriptions.',
      messageFtl: 'subscription-management-error-google-pay',
      paymentMethodType: SubPlatPaymentMethodType.GooglePay,
    });
  });

  it('returns generic issue error message - PayPal', () => {
    expect(
      getPaymentMethodErrorContent(
        PaymentMethodErrorType.GenericIssue,
        SubPlatPaymentMethodType.PayPal
      )
    ).toEqual({
      bannerType: BannerVariant.Error,
      bannerLinkLabel: 'Manage payment method',
      bannerLinkLabelFtl:
        'subscription-management-button-manage-payment-method-1',
      bannerMessage: 'There is an issue with your account.',
      bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
      bannerTitle: 'Invalid payment information',
      bannerTitleFtl:
        'error-payment-method-banner-title-invalid-payment-information',
      message:
        'There is an issue with your PayPal account. Please resolve the issue to maintain your active subscriptions.',
      messageFtl: 'subscription-management-error-paypal-billing-agreement',
      paymentMethodType: SubPlatPaymentMethodType.PayPal,
    });
  });
});
