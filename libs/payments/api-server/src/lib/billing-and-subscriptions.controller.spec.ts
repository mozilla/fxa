/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';

import { FxaOAuthAuthGuard, type FxaOAuthUser } from '@fxa/payments/auth';
import { CapabilityManager } from '@fxa/payments/capability';
import {
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import {
  CustomerManager,
  InvoiceManager,
  PaymentMethodManager,
  PriceManager,
  ProductManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  AppleIapClient,
  AppleIapPurchaseManager,
  GoogleIapClient,
  GoogleIapPurchaseManager,
  MockAppleIapClientConfigProvider,
  MockGoogleIapClientConfigProvider,
} from '@fxa/payments/iap';
import {
  MockPaypalClientConfigProvider,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  AccountCustomerManager,
  MockStripeConfigProvider,
  StripeClient,
} from '@fxa/payments/stripe';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import { BillingAndSubscriptionsController } from './billing-and-subscriptions.controller';
import { BillingAndSubscriptionsService } from './billing-and-subscriptions.service';

const FxaOAuthUserFactory = (
  override?: Partial<FxaOAuthUser>
): FxaOAuthUser => ({
  sub: faker.string.hexadecimal({ length: 32, prefix: '' }),
  client_id: faker.string.hexadecimal({ length: 16, prefix: '' }),
  scope: ['https://identity.mozilla.com/account/subscriptions'],
  ...override,
});

describe('BillingAndSubscriptionsController', () => {
  let controller: BillingAndSubscriptionsController;
  let service: BillingAndSubscriptionsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BillingAndSubscriptionsController],
      providers: [
        BillingAndSubscriptionsService,
        AccountCustomerManager,
        CustomerManager,
        SubscriptionManager,
        PaymentMethodManager,
        InvoiceManager,
        PriceManager,
        ProductManager,
        CapabilityManager,
        ProductConfigurationManager,
        AppleIapPurchaseManager,
        AppleIapClient,
        MockAppleIapClientConfigProvider,
        GoogleIapPurchaseManager,
        GoogleIapClient,
        MockGoogleIapClientConfigProvider,
        StripeClient,
        MockStripeConfigProvider,
        StrapiClient,
        MockStrapiClientConfigProvider,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalCustomerManager,
        MockPaypalClientConfigProvider,
        CurrencyManager,
        MockCurrencyConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        MockAccountDatabaseNestFactory,
        { provide: Logger, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    controller = moduleRef.get(BillingAndSubscriptionsController);
    service = moduleRef.get(BillingAndSubscriptionsService);
  });

  it('is guarded by FxaOAuthAuthGuard', () => {
    const guards =
      Reflect.getMetadata(GUARDS_METADATA, BillingAndSubscriptionsController) ??
      [];
    expect(guards).toContain(FxaOAuthAuthGuard);
  });

  it('delegates to service with uid and clientId from the access token', async () => {
    const user = FxaOAuthUserFactory();
    const expected = { subscriptions: [] };
    const getSpy = jest.spyOn(service, 'get').mockResolvedValue(expected);

    const result = await controller.getBillingAndSubscriptions(user);

    expect(getSpy).toHaveBeenCalledWith({
      uid: user.sub,
      clientId: user.client_id,
    });
    expect(result).toBe(expected);
  });
});
