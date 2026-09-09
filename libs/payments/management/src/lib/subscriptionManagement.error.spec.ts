/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { VError } from 'verror';
import {
  SubscriptionManagementError,
  CancelSubscriptionCustomerMismatch,
  GetAccountCustomerMissingStripeId,
  UpdateAccountCustomerMissingStripeId,
  ResubscribeSubscriptionCustomerMismatch,
  SetDefaultPaymentAccountCustomerMissingStripeId,
  CreateBillingAgreementActiveBillingAgreement,
  CreateBillingAgreementAccountCustomerMissingStripeId,
  CreateBillingAgreementCurrencyNotFound,
  CreateBillingAgreementPaypalSubscriptionNotFound,
  CreateBillingAgreementSetupFailed,
  SetupIntentInvalidStatusError,
  SetupIntentMissingPaymentMethodError,
  SetupIntentMissingCustomerError,
  CurrencyForCustomerNotFoundError,
  SubscriptionContentMissingIntervalInformationError,
  SubscriptionContentMissingLatestInvoicePreviewError,
  SubscriptionContentMissingLatestInvoiceError,
  SubscriptionManagementCouldNotRetrieveIapContentFromCMSError,
  SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError,
  SubscriptionManagementNoStripeCustomerFoundError,
  SubscriptionManagementSubscriptionNotFoundError,
} from './subscriptionManagement.error';

describe('SubscriptionManagementError', () => {
  it('sets the name and message', () => {
    const error = new SubscriptionManagementError('test', { key: 'value' });
    expect(error.name).toBe('SubscriptionManagementError');
    expect(error.message).toBe('test');
  });

  it('preserves the cause when provided', () => {
    const cause = new Error('root');
    const error = new SubscriptionManagementError('wrapped', {}, cause);
    expect(VError.cause(error)).toBe(cause);
  });
});

describe('error subclasses', () => {
  it.each([
    {
      ErrorClass: CancelSubscriptionCustomerMismatch,
      args: ['uid', 'cus_a', 'cus_b', 'sub_1'],
      expectedName: 'CancelSubscriptionCustomerMismatch',
      expectedMessage: 'Subscription customer does not match account customer',
    },
    {
      ErrorClass: GetAccountCustomerMissingStripeId,
      args: ['uid'],
      expectedName: 'AccountCustomerMissingStripeId',
      expectedMessage:
        'Retrieved AccountCustomer is missing a Stripe customer id',
    },
    {
      ErrorClass: UpdateAccountCustomerMissingStripeId,
      args: ['uid'],
      expectedName: 'AccountCustomerMissingStripeId',
      expectedMessage:
        'Updated AccountCustomer is missing a Stripe customer id',
    },
    {
      ErrorClass: ResubscribeSubscriptionCustomerMismatch,
      args: ['uid', 'cus_a', 'cus_b', 'sub_1'],
      expectedName: 'ResubscribeSubscriptionCustomerMismatch',
      expectedMessage:
        'Resubscribe subscription customer does not match account customer',
    },
    {
      ErrorClass: SetDefaultPaymentAccountCustomerMissingStripeId,
      args: ['uid'],
      expectedName: 'SetDefaultPaymentAccountCustomerMissingStripeId',
      expectedMessage:
        'AccountCustomer for updating default payment method is missing a Stripe customer id',
    },
    {
      ErrorClass: CreateBillingAgreementActiveBillingAgreement,
      args: ['uid'],
      expectedName: 'CreateBillingAgreementActiveBillingAgreement',
      expectedMessage: 'Account already has an active paypal billing agreement',
    },
    {
      ErrorClass: CreateBillingAgreementAccountCustomerMissingStripeId,
      args: ['uid'],
      expectedName: 'CreateBillingAgreementAccountCustomerMissingStripeId',
      expectedMessage:
        'AccountCustomer for updating default payment method is missing a Stripe customer id',
    },
    {
      ErrorClass: CreateBillingAgreementCurrencyNotFound,
      args: ['uid'],
      expectedName: 'CreateBillingAgreementCurrencyNotFound',
      expectedMessage: 'Currency could not be found for account',
    },
    {
      ErrorClass: CreateBillingAgreementPaypalSubscriptionNotFound,
      args: ['uid'],
      expectedName: 'CreateBillingAgreementPaypalSubscriptionNotFound',
      expectedMessage:
        'No PayPal subscription found when creating billing agreement',
    },
    {
      ErrorClass: CreateBillingAgreementSetupFailed,
      args: ['uid', ['error1']],
      expectedName: 'CreateBillingAgreementSetupFailed',
      expectedMessage:
        'One or more calls failed while creating a billing agreement',
    },
    {
      ErrorClass: SetupIntentInvalidStatusError,
      args: ['si_123', 'failed'],
      expectedName: 'SetupIntentInvalidStatusError',
      expectedMessage:
        'ConfirmationToken failed to create successful SetupIntent',
    },
    {
      ErrorClass: SetupIntentMissingPaymentMethodError,
      args: ['si_123', 'succeeded', 'cus_123'],
      expectedName: 'SetupIntentMissingPaymentMethodError',
      expectedMessage: 'SetupIntent created without a payment method',
    },
    {
      ErrorClass: SetupIntentMissingCustomerError,
      args: ['si_123', 'succeeded'],
      expectedName: 'SetupIntentMissingCustomerError',
      expectedMessage: 'SetupIntent created without a customer',
    },
    {
      ErrorClass: CurrencyForCustomerNotFoundError,
      args: ['cus_123'],
      expectedName: 'CurrencyForCustomerNotFoundError',
      expectedMessage: 'Could not determine currency code for customer',
    },
    {
      ErrorClass: SubscriptionContentMissingIntervalInformationError,
      args: ['sub_123', 'price_123'],
      expectedName: 'SubscriptionContentMissingIntervalInformationError',
      expectedMessage:
        'Subscription interval and/or interval count missing from subscription',
    },
    {
      ErrorClass: SubscriptionContentMissingLatestInvoicePreviewError,
      args: ['sub_123', 'in_123'],
      expectedName: 'SubscriptionContentMissingLatestInvoicePreviewError',
      expectedMessage: 'Subscription is missing latest invoice preview',
    },
    {
      ErrorClass: SubscriptionContentMissingLatestInvoiceError,
      args: ['sub_123'],
      expectedName: 'SubscriptionContentMissingLatestInvoiceError',
      expectedMessage: 'Subscription is missing latest invoice',
    },
    {
      ErrorClass: SubscriptionManagementCouldNotRetrieveIapContentFromCMSError,
      args: [['store_1']],
      expectedName:
        'SubscriptionManagementCouldNotRetrieveIapContentFromCMSError',
      expectedMessage: 'Could not retrieve IAP content from CMS',
    },
    {
      ErrorClass:
        SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError,
      args: [['price_1']],
      expectedName:
        'SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError',
      expectedMessage: 'Could not retrieve product names from CMS',
    },
    {
      ErrorClass: SubscriptionManagementNoStripeCustomerFoundError,
      args: ['uid', 'sub_123'],
      expectedName: 'SubscriptionManagementNoStripeCustomerFoundError',
      expectedMessage: 'Stripe customer not found',
    },
    {
      ErrorClass: SubscriptionManagementSubscriptionNotFoundError,
      args: ['uid', 'sub_123'],
      expectedName: 'SubscriptionManagementSubscriptionNotFoundError',
      expectedMessage: 'Subscription not found',
    },
  ] as const)(
    '$expectedName sets the correct name and message',
    ({ ErrorClass, args, expectedName, expectedMessage }) => {
      const error = new (ErrorClass as any)(...args);
      expect(error.name).toBe(expectedName);
      expect(error.message).toBe(expectedMessage);
      expect(error).toBeInstanceOf(SubscriptionManagementError);
    }
  );
});
