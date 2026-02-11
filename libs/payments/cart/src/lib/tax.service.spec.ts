import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
  MockStripeConfigProvider,
  StripeClient,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import {
  CustomerManager,
  SubscriptionManager,
  TaxAddress,
  TaxAddressFactory,
} from '@fxa/payments/customer';
import {
  GeoDBManager,
  GeoDBManagerConfig,
  MockGeoDBNestFactory,
} from '@fxa/shared/geodb';

import { TaxService } from './tax.service';
import {
  ResultAccountCustomerFactory,
  StripeCustomerFactory,
  StripeResponseFactory,
} from '@fxa/payments/stripe';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import { TaxChangeAllowedStatus } from './tax.types';

describe('TaxService', () => {
  let taxService: TaxService;
  let accountCustomerManager: AccountCustomerManager;
  let customerManager: CustomerManager;
  let geodbManager: GeoDBManager;
  let subscriptionManager: SubscriptionManager;
  let currencyManager: CurrencyManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TaxService,
        GeoDBManagerConfig,
        MockStatsDProvider,
        MockStripeConfigProvider,
        StripeClient,
        MockAccountDatabaseNestFactory,
        AccountCustomerManager,
        CustomerManager,
        GeoDBManager,
        MockGeoDBNestFactory,
        SubscriptionManager,
        CurrencyManager,
        MockCurrencyConfigProvider,
      ],
    }).compile();

    taxService = moduleRef.get(TaxService);
    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    customerManager = moduleRef.get(CustomerManager);
    geodbManager = moduleRef.get(GeoDBManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    currencyManager = moduleRef.get(CurrencyManager);
  });

  describe('getTaxAddress', () => {
    const ip = faker.internet.ipv4();
    const uid = faker.string.hexadecimal({ length: 32, casing: 'lower' });
    const countryCode = faker.location.countryCode();
    const postalCode = faker.location.zipCode();

    it('returns tax address from Stripe customer shipping address', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          shipping: {
            address: {
              country: countryCode,
              postal_code: postalCode,
              city: faker.location.city(),
              line1: faker.location.streetAddress(),
              line2: faker.location.secondaryAddress(),
              state: faker.location.state(),
            },
          },
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);

      const result = await taxService.getTaxAddress(ip, uid);

      expect(result).toEqual({
        countryCode,
        postalCode,
      } satisfies TaxAddress);
    });

    it('returns GeoIP tax address if Stripe shipping info is incomplete', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          shipping: {
            address: {
              country: null,
              postal_code: null,
              city: faker.location.city(),
              line1: faker.location.streetAddress(),
              line2: faker.location.secondaryAddress(),
              state: faker.location.state(),
            },
          },
        })
      );
      const geoAddress = { countryCode, postalCode };

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest.spyOn(geodbManager, 'getTaxAddress').mockReturnValue(geoAddress);

      const result = await taxService.getTaxAddress(ip, uid);

      expect(result).toEqual(geoAddress);
    });

    it('returns GeoIP tax address if account customer not found', async () => {
      const geoAddress = { countryCode, postalCode };

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockRejectedValue(new AccountCustomerNotFoundError('not found'));
      jest.spyOn(geodbManager, 'getTaxAddress').mockReturnValue(geoAddress);

      const result = await taxService.getTaxAddress(ip, uid);

      expect(result).toEqual(geoAddress);
    });

    it('throws unexpected errors from account customer manager', async () => {
      const error = new Error('unexpected');
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockRejectedValue(error);

      await expect(taxService.getTaxAddress(ip, uid)).rejects.toThrow(error);
    });

    it('returns GeoIP tax address when uid is not provided', async () => {
      const geoAddress = { countryCode, postalCode };

      jest.spyOn(geodbManager, 'getTaxAddress').mockReturnValue(geoAddress);

      const result = await taxService.getTaxAddress(ip);

      expect(result).toEqual(geoAddress);
    });

    it('returns undefined if GeoIP fails', async () => {
      jest.spyOn(geodbManager, 'getTaxAddress').mockReturnValue(undefined);

      const result = await taxService.getTaxAddress(ip);

      expect(result).toBeUndefined();
    });
  });

  describe('getTaxChangeStatus', () => {
    const uid = faker.string.hexadecimal({ length: 32, casing: 'lower' });
    const taxAddress = TaxAddressFactory();
    const mockAccountCustomer = ResultAccountCustomerFactory();
    const mockSubscriptions = [StripeSubscriptionFactory()];
    const mockCustomer = StripeResponseFactory(
      StripeCustomerFactory({
        currency: 'USD',
      })
    );

    beforeEach(() => {
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue('USD');
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue(mockSubscriptions);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns true when customer has active subscription but currency is the same', async () => {
      const result = await taxService.getTaxChangeStatus(uid, taxAddress);

      expect(result).toEqual({
        status: TaxChangeAllowedStatus.Allowed,
        currentCurrency: mockCustomer.currency,
      });
    });

    it('returns true when customer has no stripe customer', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      const result = await taxService.getTaxChangeStatus(uid, taxAddress);

      expect(result).toEqual({
        status: TaxChangeAllowedStatus.Allowed,
      });
    });

    it('returns false when currency is not found', async () => {
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(undefined);

      const result = await taxService.getTaxChangeStatus(uid, taxAddress);

      expect(result).toEqual({
        status: TaxChangeAllowedStatus.CurrencyNotFound,
      });
    });

    it('returns false when customer has active subscription that also changes currency', async () => {
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: 'EUR',
        })
      );

      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);

      const result = await taxService.getTaxChangeStatus(uid, taxAddress);

      expect(result).toEqual({
        status: TaxChangeAllowedStatus.CurrencyChange,
        currentCurrency: 'EUR',
      });
    });

    it('throws unexpected error from accountCustomerManager', async () => {
      const error = new Error('unexpected');
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockRejectedValue(error);

      await expect(
        taxService.getTaxChangeStatus(uid, taxAddress)
      ).rejects.toThrow(error);
    });
  });
});
