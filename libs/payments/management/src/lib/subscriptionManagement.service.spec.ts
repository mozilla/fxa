/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import {
  determinePaymentMethodType,
  CustomerManager,
  PaymentMethodManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { SubscriptionManagementService } from '@fxa/payments/management';
import {
  AccountCustomerManager,
  ResultAccountCustomerFactory,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripePaymentMethodFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

jest.mock('@fxa/payments/customer');
const mockDeterminePaymentMethodType = jest.mocked(determinePaymentMethodType);

jest.mock('@fxa/shared/error', () => ({
  ...jest.requireActual('@fxa/shared/error'),
  SanitizeExceptions: jest.fn(({ allowlist = [] } = {}) => {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      return descriptor;
    };
  }),
}));

describe('SubscriptionManagementService', () => {
  let accountCustomerManager: AccountCustomerManager;
  let customerManager: CustomerManager;
  let paymentMethodManager: PaymentMethodManager;
  let subscriptionManager: SubscriptionManager;
  let subscriptionManagementService: SubscriptionManagementService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        Logger,
        AccountCustomerManager,
        CustomerManager,
        MockAccountDatabaseNestFactory,
        MockStatsDProvider,
        PaymentMethodManager,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
        SubscriptionManagementService,
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    customerManager = moduleRef.get(CustomerManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    subscriptionManagementService = moduleRef.get(
      SubscriptionManagementService
    );
  });

  describe('getPageContent', () => {
    it('returns page content', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockSubscriptions = StripeSubscriptionFactory();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );
      const mockPaymentMethodInformation = {
        type: mockPaymentMethod.type,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
      };

      mockDeterminePaymentMethodType.mockReturnValue({
        type: 'stripe',
        paymentMethodId: 'pm_id',
      });
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscriptions]);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValueOnce(mockPaymentMethodInformation);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        defaultPaymentMethod: mockPaymentMethodInformation,
      });
    });

    it('returns no page information - Stripe customer does not exist', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory();

      mockDeterminePaymentMethodType.mockReturnValue(null);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        defaultPaymentMethod: undefined,
      });
    });

    it('returns page information - Stripe customer but no payment information nor subscriptions', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());

      mockDeterminePaymentMethodType.mockReturnValue(null);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValueOnce(undefined);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        defaultPaymentMethod: undefined,
      });
    });
  });
});
