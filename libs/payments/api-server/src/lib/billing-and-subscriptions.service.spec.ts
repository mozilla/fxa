/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { CapabilityManager } from '@fxa/payments/capability';
import {
  CustomerDeletedError,
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
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import {
  MockPaypalClientConfigProvider,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
  MockStripeConfigProvider,
  StripeCardPaymentMethodFactory,
  StripeClient,
  StripeCustomerFactory,
  StripePriceFactory,
  StripePriceRecurringFactory,
  StripeProductFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import {
  AppleIapPurchaseFactory,
  GoogleIapPurchaseFactory,
  IapOfferingFactory,
} from './billing-and-subscriptions.factories';
import { BillingAndSubscriptionsService } from './billing-and-subscriptions.service';

const UID = 'abc123';
const CLIENT_ID = 'client_xyz';
const STRIPE_CUSTOMER_ID = 'cus_abc';

describe('BillingAndSubscriptionsService', () => {
  let service: BillingAndSubscriptionsService;
  let accountCustomerManager: AccountCustomerManager;
  let customerManager: CustomerManager;
  let subscriptionManager: SubscriptionManager;
  let paymentMethodManager: PaymentMethodManager;
  let priceManager: PriceManager;
  let productManager: ProductManager;
  let capabilityManager: CapabilityManager;
  let productConfigurationManager: ProductConfigurationManager;
  let appleIapPurchaseManager: AppleIapPurchaseManager;
  let googleIapPurchaseManager: GoogleIapPurchaseManager;
  let logger: { log: jest.Mock; error: jest.Mock };

  beforeEach(async () => {
    logger = { log: jest.fn(), error: jest.fn() };

    const moduleRef = await Test.createTestingModule({
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
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    service = moduleRef.get(BillingAndSubscriptionsService);
    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    customerManager = moduleRef.get(CustomerManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    priceManager = moduleRef.get(PriceManager);
    productManager = moduleRef.get(ProductManager);
    capabilityManager = moduleRef.get(CapabilityManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    appleIapPurchaseManager = moduleRef.get(AppleIapPurchaseManager);
    googleIapPurchaseManager = moduleRef.get(GoogleIapPurchaseManager);

    // Default: no IAP unless overridden.
    jest.spyOn(appleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
    jest.spyOn(googleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
  });

  describe('get', () => {
    it('returns stripe-only billing details + one web subscription', async () => {
      const customer = StripeResponseFactory(
        StripeCustomerFactory({
          id: STRIPE_CUSTOMER_ID,
          currency: 'usd',
          invoice_settings: {
            custom_fields: null,
            default_payment_method: 'pm_123',
            footer: null,
            rendering_options: null,
          },
        })
      );
      const price = StripePriceFactory({
        id: 'price_123',
        currency: 'usd',
        recurring: StripePriceRecurringFactory({ interval: 'month' }),
      });
      const sub = StripeSubscriptionFactory({
        id: 'sub_1',
        status: 'active',
        items: {
          object: 'list',
          data: [
            StripeSubscriptionItemFactory({
              price: {
                ...price,
                product: 'prod_abc',
              },
            }),
          ],
          has_more: false,
          url: '',
        },
      });
      const paymentMethod = StripeResponseFactory(
        StripeCardPaymentMethodFactory({
          billing_details: {
            address: {
              city: null,
              country: null,
              line1: null,
              line2: null,
              postal_code: null,
              state: null,
            },
            email: null,
            name: 'Jane Doe',
            phone: null,
          },
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue({
          uid: UID,
          stripeCustomerId: STRIPE_CUSTOMER_ID,
        } as never);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(customer);
      jest
        .spyOn(subscriptionManager, 'listActiveForCustomer')
        .mockResolvedValue([sub]);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(paymentMethod);
      jest
        .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
        .mockResolvedValue({ [CLIENT_ID]: ['cap'] });

      const result = await service.get({ uid: UID, clientId: CLIENT_ID });

      expect(result.subscriptions).toHaveLength(1);
      expect(result.subscriptions[0]).toMatchObject({
        _subscription_type: 'web',
        plan_id: price.id,
        product_id: 'prod_abc',
        status: 'active',
        subscription_id: 'sub_1',
        priceInfo: {
          interval: 'month',
          interval_count: 1,
          currency: 'usd',
        },
      });
      expect(result.billing_name).toBe('Jane Doe');
      expect(result.payment_provider).toBe('stripe');
      expect(result.last4).toBe(paymentMethod.card?.last4);
    });

    it('throws NotFoundException with errno 176 when no customer and no IAP', async () => {
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockRejectedValue(
          new AccountCustomerNotFoundError(UID, new Error('not found'))
        );

      await expect(
        service.get({ uid: UID, clientId: CLIENT_ID })
      ).rejects.toMatchObject({
        response: { errno: 176 },
      });
      await expect(
        service.get({ uid: UID, clientId: CLIENT_ID })
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('falls back to IAP-only flow when AccountCustomer is missing', async () => {
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockRejectedValue(
          new AccountCustomerNotFoundError(UID, new Error('not found'))
        );
      jest
        .spyOn(googleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([
          GoogleIapPurchaseFactory({ sku: 'google_sku' }) as never,
        ]);
      const iapPrice = StripePriceFactory({
        id: 'price_g',
        product: 'prod_g',
        recurring: StripePriceRecurringFactory({ interval: 'month' }),
      });
      jest.spyOn(productConfigurationManager, 'getIapOfferings').mockResolvedValue({
        getIapPageContentByStoreId: (storeId: string) =>
          IapOfferingFactory({ storeId, stripePlanChoice: iapPrice.id }),
      } as never);
      jest.spyOn(priceManager, 'retrieveByInterval').mockResolvedValue(iapPrice);
      jest
        .spyOn(productManager, 'retrieve')
        .mockResolvedValue(
          StripeResponseFactory(
            StripeProductFactory({ id: 'prod_g', name: 'Google IAP Product' })
          )
        );
      jest
        .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
        .mockResolvedValue({ [CLIENT_ID]: ['cap'] });

      const result = await service.get({ uid: UID, clientId: CLIENT_ID });

      expect(result.subscriptions).toHaveLength(1);
      expect(result.subscriptions[0]).toMatchObject({
        _subscription_type: 'iap_google',
        price_id: iapPrice.id,
        product_id: 'prod_g',
        product_name: 'Google IAP Product',
      });
      expect(result.billing_name).toBeUndefined();
    });

    it('falls back to IAP-only flow when Stripe customer is deleted', async () => {
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue({
          uid: UID,
          stripeCustomerId: STRIPE_CUSTOMER_ID,
        } as never);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockRejectedValue(new CustomerDeletedError(STRIPE_CUSTOMER_ID));
      jest
        .spyOn(appleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([
          AppleIapPurchaseFactory({ productId: 'apple.prod' }) as never,
        ]);
      const iapPrice = StripePriceFactory({
        id: 'price_a',
        product: 'prod_a',
        recurring: StripePriceRecurringFactory({ interval: 'month' }),
      });
      jest.spyOn(productConfigurationManager, 'getIapOfferings').mockResolvedValue({
        getIapPageContentByStoreId: (storeId: string) =>
          IapOfferingFactory({ storeId, stripePlanChoice: iapPrice.id }),
      } as never);
      jest.spyOn(priceManager, 'retrieveByInterval').mockResolvedValue(iapPrice);
      jest
        .spyOn(productManager, 'retrieve')
        .mockResolvedValue(
          StripeResponseFactory(
            StripeProductFactory({ id: 'prod_a', name: 'Apple IAP Product' })
          )
        );
      jest
        .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
        .mockResolvedValue({ [CLIENT_ID]: ['cap'] });

      const result = await service.get({ uid: UID, clientId: CLIENT_ID });
      expect(result.subscriptions).toHaveLength(1);
      expect(result.subscriptions[0]).toMatchObject({
        _subscription_type: 'iap_apple',
        app_store_product_id: 'apple.prod',
      });
    });

    it('filters out web subs whose price has no capability for the client', async () => {
      const customer = StripeResponseFactory(
        StripeCustomerFactory({
          id: STRIPE_CUSTOMER_ID,
          currency: 'usd',
        })
      );
      const price = StripePriceFactory({
        id: 'price_visible',
        currency: 'usd',
        recurring: StripePriceRecurringFactory({ interval: 'month' }),
      });
      const hiddenPrice = StripePriceFactory({
        id: 'price_hidden',
        currency: 'usd',
        recurring: StripePriceRecurringFactory({ interval: 'month' }),
      });
      const visibleSub = StripeSubscriptionFactory({
        id: 'sub_visible',
        status: 'active',
        items: {
          object: 'list',
          data: [
            StripeSubscriptionItemFactory({
              price: { ...price, product: 'prod_v' },
            }),
          ],
          has_more: false,
          url: '',
        },
      });
      const hiddenSub = StripeSubscriptionFactory({
        id: 'sub_hidden',
        status: 'active',
        items: {
          object: 'list',
          data: [
            StripeSubscriptionItemFactory({
              price: { ...hiddenPrice, product: 'prod_h' },
            }),
          ],
          has_more: false,
          url: '',
        },
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue({
          uid: UID,
          stripeCustomerId: STRIPE_CUSTOMER_ID,
        } as never);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(customer);
      jest
        .spyOn(subscriptionManager, 'listActiveForCustomer')
        .mockResolvedValue([visibleSub, hiddenSub]);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(StripeCardPaymentMethodFactory()));
      jest
        .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
        .mockImplementation(
          async (ids: string[]): Promise<Record<string, string[]>> =>
            ids.includes('price_visible') ? { [CLIENT_ID]: ['cap'] } : {}
        );

      const result = await service.get({ uid: UID, clientId: CLIENT_ID });
      expect(result.subscriptions).toHaveLength(1);
      const [only] = result.subscriptions;
      if (only._subscription_type !== 'web') {
        throw new Error('Expected web subscription');
      }
      expect(only.subscription_id).toBe('sub_visible');
    });

    it('sets paypal_payment_error=missing_agreement when PayPal sub has no agreement', async () => {
      const customer = StripeResponseFactory(
        StripeCustomerFactory({
          id: STRIPE_CUSTOMER_ID,
          metadata: {},
          invoice_settings: {
            custom_fields: null,
            default_payment_method: null,
            footer: null,
            rendering_options: null,
          },
        })
      );
      const price = StripePriceFactory({
        recurring: StripePriceRecurringFactory({ interval: 'month' }),
      });
      const sub = StripeSubscriptionFactory({
        status: 'active',
        collection_method: 'send_invoice',
        cancel_at_period_end: false,
        items: {
          object: 'list',
          data: [
            StripeSubscriptionItemFactory({
              price: { ...price, product: 'prod_p' },
            }),
          ],
          has_more: false,
          url: '',
        },
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue({
          uid: UID,
          stripeCustomerId: STRIPE_CUSTOMER_ID,
        } as never);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(customer);
      jest
        .spyOn(subscriptionManager, 'listActiveForCustomer')
        .mockResolvedValue([sub]);
      jest
        .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
        .mockResolvedValue({ [CLIENT_ID]: ['cap'] });

      const result = await service.get({ uid: UID, clientId: CLIENT_ID });
      expect(result.payment_provider).toBe('paypal');
      expect(result.paypal_payment_error).toBe('missing_agreement');
    });

    it('sanitizes IAP misconfig errors and logs the pre-sanitization context', async () => {
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockRejectedValue(
          new AccountCustomerNotFoundError(UID, new Error('not found'))
        );
      jest
        .spyOn(googleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([
          GoogleIapPurchaseFactory({ sku: 'unknown_sku' }) as never,
        ]);
      jest.spyOn(productConfigurationManager, 'getIapOfferings').mockResolvedValue({
        getIapPageContentByStoreId: () => undefined,
      } as never);

      await expect(
        service.get({ uid: UID, clientId: CLIENT_ID })
      ).rejects.toThrow('Something went wrong');

      expect(logger.error).toHaveBeenCalledTimes(1);
      const loggedError = logger.error.mock.calls[0][0] as Error;
      expect(loggedError).toBeInstanceOf(Error);
      expect(loggedError.message).toContain('storeId=unknown_sku');
    });

    it('rejects an offering whose CMS interval is not a SubplatInterval', async () => {
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockRejectedValue(
          new AccountCustomerNotFoundError(UID, new Error('not found'))
        );
      jest
        .spyOn(googleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([
          GoogleIapPurchaseFactory({ sku: 'google_sku' }) as never,
        ]);
      jest.spyOn(productConfigurationManager, 'getIapOfferings').mockResolvedValue({
        getIapPageContentByStoreId: (storeId: string) =>
          IapOfferingFactory({ storeId, interval: 'fortnightly' }),
      } as never);

      await expect(
        service.get({ uid: UID, clientId: CLIENT_ID })
      ).rejects.toThrow('Something went wrong');

      expect(logger.error).toHaveBeenCalledTimes(1);
      const loggedError = logger.error.mock.calls[0][0] as Error;
      expect(loggedError.message).toContain('Unsupported IAP interval');
      expect(loggedError.message).toContain('interval=fortnightly');
      expect(loggedError.message).toContain('storeId=google_sku');
    });
  });
});
