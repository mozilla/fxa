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
  SetupIntentManager,
  CustomerSessionManager,
} from '@fxa/payments/customer';
import { SubscriptionManagementService } from '@fxa/payments/management';
import {
  AccountCustomerManager,
  ResultAccountCustomerFactory,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripeCustomerSessionFactory,
  StripePaymentMethodFactory,
  StripeResponseFactory,
  StripeSetupIntentFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { CurrencyManager } from '@fxa/payments/currency';
import { MockCurrencyConfigProvider } from 'libs/payments/currency/src/lib/currency.config';
import {
  CurrencyForCustomerNotFoundError,
  GetAccountCustomerMissingStripeId,
  SetupIntentInvalidStatusError,
  SetupIntentMissingCustomerError,
  SetupIntentMissingPaymentMethodError,
  UpdateAccountCustomerMissingStripeId,
} from './subscriptionManagement.error';

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
  let setupIntentManager: SetupIntentManager;
  let customerSessionManager: CustomerSessionManager;
  let currencyManager: CurrencyManager;

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
        SetupIntentManager,
        CustomerSessionManager,
        CurrencyManager,
        MockCurrencyConfigProvider,
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    customerManager = moduleRef.get(CustomerManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    subscriptionManagementService = moduleRef.get(
      SubscriptionManagementService
    );
    setupIntentManager = moduleRef.get(SetupIntentManager);
    customerSessionManager = moduleRef.get(CustomerSessionManager);
    currencyManager = moduleRef.get(CurrencyManager);
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

  describe('getStripePaymentManagementDetails', () => {
    it('gets stripe payment management details', async () => {
      const mockCustomerId = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({ customer: mockCustomerId })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
          currency: mockCurrency,
        })
      );
      const mockCustomerSession = StripeResponseFactory(
        StripeCustomerSessionFactory({ customer: mockCustomer.id })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerSessionManager, 'createManagementSession')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      const result =
        await subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        );

      expect(result).toEqual({
        clientSecret: mockCustomerSession.client_secret,
        customer: mockCustomer.id,
        defaultPaymentMethodId: mockPaymentMethod.id,
        currency: mockCustomer.currency,
      });
    });
    it('throws GetAccountCustomerMissingStripeId for missing stripe customer id', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      await expect(
        subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        )
      ).rejects.toBeInstanceOf(GetAccountCustomerMissingStripeId);
    });
    it("gets the customer's currency from their shipping address if needed", async () => {
      const mockCustomerId = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({ customer: mockCustomerId })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
          shipping: {
            address: {
              country: faker.location.countryCode(),
              city: null,
              line1: null,
              line2: null,
              state: null,
              postal_code: null,
            },
          },
        })
      );
      const mockCustomerSession = StripeResponseFactory(
        StripeCustomerSessionFactory({ customer: mockCustomer.id })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerSessionManager, 'createManagementSession')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      const result =
        await subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        );

      expect(result).toEqual({
        clientSecret: mockCustomerSession.client_secret,
        customer: mockCustomer.id,
        defaultPaymentMethodId: mockPaymentMethod.id,
        currency: mockCurrency,
      });
    });
    it("gets the customer's currency from their default payment method if needed", async () => {
      const mockCustomerId = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          customer: mockCustomerId,
          billing_details: {
            address: {
              country: faker.location.countryCode(),
              city: null,
              line1: null,
              line2: null,
              state: null,
              postal_code: null,
            },
            email: null,
            name: null,
            phone: null,
          },
        })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
        })
      );
      const mockCustomerSession = StripeResponseFactory(
        StripeCustomerSessionFactory({ customer: mockCustomer.id })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerSessionManager, 'createManagementSession')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      const result =
        await subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        );

      expect(result).toEqual({
        clientSecret: mockCustomerSession.client_secret,
        customer: mockCustomer.id,
        defaultPaymentMethodId: mockPaymentMethod.id,
        currency: mockCurrency,
      });
    });
    it('throws CurrencyForCustomerNotFoundError if no currency can be determined', async () => {
      const mockCustomerId = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          customer: mockCustomerId,
        })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
        })
      );
      const mockCustomerSession = StripeResponseFactory(
        StripeCustomerSessionFactory({ customer: mockCustomer.id })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerSessionManager, 'createManagementSession')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      await expect(
        subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        )
      ).rejects.toBeInstanceOf(CurrencyForCustomerNotFoundError);
    });
  });
  describe('updateStripePaymentDetails', () => {
    it('updates the stripe customer payment method details', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: faker.finance.currencyCode().toLowerCase(),
          invoice_settings: {
            custom_fields: null,
            default_payment_method: mockPaymentMethod.id,
            footer: null,
            rendering_options: null,
          },
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          customer: mockCustomer.id,
          payment_method: mockPaymentMethod.id,
          status: 'succeeded',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);

      const result =
        await subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        );

      expect(result).toEqual({
        id: mockSetupIntent.id,
        clientSecret: mockSetupIntent.client_secret,
      });
    });
    it('throws UpdateAccountCustomerMissingStripeId for missing stripe customer id', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        )
      ).rejects.toBeInstanceOf(UpdateAccountCustomerMissingStripeId);
    });
    it('throws SetupIntentInvalidStatusError for invalid setupIntent statuses', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: faker.finance.currencyCode().toLowerCase(),
          invoice_settings: {
            custom_fields: null,
            default_payment_method: mockPaymentMethod.id,
            footer: null,
            rendering_options: null,
          },
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          customer: mockCustomer.id,
          status: 'canceled',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        )
      ).rejects.toBeInstanceOf(SetupIntentInvalidStatusError);
    });
    it('throws SetupIntentMissingPaymentMethodError for missing setupIntent payment methods', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: faker.finance.currencyCode().toLowerCase(),
          invoice_settings: {
            custom_fields: null,
            default_payment_method: mockPaymentMethod.id,
            footer: null,
            rendering_options: null,
          },
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          customer: mockCustomer.id,
          status: 'succeeded',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        )
      ).rejects.toBeInstanceOf(SetupIntentMissingPaymentMethodError);
    });
    it('throws SetupIntentMissingCustomerError for missing setupIntent customers', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: faker.finance.currencyCode().toLowerCase(),
          invoice_settings: {
            custom_fields: null,
            default_payment_method: mockPaymentMethod.id,
            footer: null,
            rendering_options: null,
          },
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          payment_method: mockPaymentMethod.id,
          status: 'succeeded',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        )
      ).rejects.toBeInstanceOf(SetupIntentMissingCustomerError);
    });
    it("updates the customer's name to the current payement method billing name", async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          billing_details: {
            name: faker.person.fullName(),
            address: null,
            email: null,
            phone: null,
          },
        })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: faker.finance.currencyCode().toLowerCase(),
          invoice_settings: {
            custom_fields: null,
            default_payment_method: mockPaymentMethod.id,
            footer: null,
            rendering_options: null,
          },
          name: faker.person.fullName(),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          customer: mockCustomer.id,
          payment_method: mockPaymentMethod.id,
          status: 'succeeded',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);

      await subscriptionManagementService.updateStripePaymentDetails(
        mockAccountCustomer.uid,
        '123'
      );

      expect(customerManager.update).toHaveBeenCalledWith(
        mockSetupIntent.customer,
        {
          invoice_settings: {
            default_payment_method: mockSetupIntent.payment_method,
          },
          name: mockPaymentMethod.billing_details.name,
        }
      );
    });
  });
});
