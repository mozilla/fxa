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
  STRIPE_CUSTOMER_METADATA,
  STRIPE_INVOICE_METADATA,
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
  StripeInvoiceFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import {
  FreeAccessProgramConfigurationManager,
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { FreeAccessProgramService } from '@fxa/free-access-program';
import { AccountManager } from '@fxa/shared/account/account';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import {
  AppleIapPurchaseFactory,
  GoogleIapPurchaseFactory,
  IapOfferingFactory,
} from './billing-and-subscriptions.factories';
import { BillingAndSubscriptionsService } from './billing-and-subscriptions.service';
import { FreeAccessProgramConfig } from './free-access-program.config';

const UID = 'abc123';
const CLIENT_ID = 'client_xyz';
const STRIPE_CUSTOMER_ID = 'cus_abc';

describe('BillingAndSubscriptionsService', () => {
  let service: BillingAndSubscriptionsService;
  let accountCustomerManager: AccountCustomerManager;
  let customerManager: CustomerManager;
  let subscriptionManager: SubscriptionManager;
  let invoiceManager: InvoiceManager;
  let paymentMethodManager: PaymentMethodManager;
  let priceManager: PriceManager;
  let productManager: ProductManager;
  let capabilityManager: CapabilityManager;
  let productConfigurationManager: ProductConfigurationManager;
  let freeAccessProgramService: FreeAccessProgramService;
  let appleIapPurchaseManager: AppleIapPurchaseManager;
  let googleIapPurchaseManager: GoogleIapPurchaseManager;
  let logger: { log: jest.Mock; error: jest.Mock };

  // Mutable so individual tests can toggle the feature flag; reset in beforeEach.
  const mockFreeAccessProgramConfig = { enabled: true };

  beforeEach(async () => {
    logger = { log: jest.fn(), error: jest.fn() };
    mockFreeAccessProgramConfig.enabled = true;

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
        FreeAccessProgramConfigurationManager,
        FreeAccessProgramService,
        {
          provide: FreeAccessProgramConfig,
          useValue: mockFreeAccessProgramConfig,
        },
        AccountManager,
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
    invoiceManager = moduleRef.get(InvoiceManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    priceManager = moduleRef.get(PriceManager);
    productManager = moduleRef.get(ProductManager);
    capabilityManager = moduleRef.get(CapabilityManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    freeAccessProgramService = moduleRef.get(FreeAccessProgramService);
    appleIapPurchaseManager = moduleRef.get(AppleIapPurchaseManager);
    googleIapPurchaseManager = moduleRef.get(GoogleIapPurchaseManager);

    // Default: no IAP unless overridden.
    jest.spyOn(appleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
    jest.spyOn(googleIapPurchaseManager, 'getForUser').mockResolvedValue([]);
    // Default: no Free Access Program membership unless overridden.
    jest
      .spyOn(freeAccessProgramService, 'findFreeAccessForUid')
      .mockResolvedValue({ isMember: false, grantsByClient: {} });
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

    it('sets paypal_payment_error=funding_source when PayPal sub has agreement and open invoice with retry attempts', async () => {
      const customer = StripeResponseFactory(
        StripeCustomerFactory({
          id: STRIPE_CUSTOMER_ID,
          metadata: {
            [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: 'ba_123',
          },
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
        latest_invoice: 'in_open_retry',
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
      const openInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          id: 'in_open_retry',
          status: 'open',
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]: '2',
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
        .spyOn(invoiceManager, 'retrieve')
        .mockResolvedValue(openInvoice);
      jest
        .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
        .mockResolvedValue({ [CLIENT_ID]: ['cap'] });

      const result = await service.get({ uid: UID, clientId: CLIENT_ID });
      expect(result.payment_provider).toBe('paypal');
      expect(result.paypal_payment_error).toBe('funding_source');
    });

    it('sets funding_source when only one of multiple PayPal subs has a failing invoice', async () => {
      const customer = StripeResponseFactory(
        StripeCustomerFactory({
          id: STRIPE_CUSTOMER_ID,
          metadata: {
            [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: 'ba_123',
          },
          invoice_settings: {
            custom_fields: null,
            default_payment_method: null,
            footer: null,
            rendering_options: null,
          },
        })
      );
      const price1 = StripePriceFactory({
        id: 'price_ok',
        recurring: StripePriceRecurringFactory({ interval: 'month' }),
      });
      const price2 = StripePriceFactory({
        id: 'price_failing',
        recurring: StripePriceRecurringFactory({ interval: 'year' }),
      });
      const healthySub = StripeSubscriptionFactory({
        id: 'sub_healthy',
        status: 'active',
        collection_method: 'send_invoice',
        cancel_at_period_end: false,
        latest_invoice: 'in_healthy',
        items: {
          object: 'list',
          data: [
            StripeSubscriptionItemFactory({
              price: { ...price1, product: 'prod_a' },
            }),
          ],
          has_more: false,
          url: '',
        },
      });
      const failingSub = StripeSubscriptionFactory({
        id: 'sub_failing',
        status: 'active',
        collection_method: 'send_invoice',
        cancel_at_period_end: false,
        latest_invoice: 'in_failing',
        items: {
          object: 'list',
          data: [
            StripeSubscriptionItemFactory({
              price: { ...price2, product: 'prod_b' },
            }),
          ],
          has_more: false,
          url: '',
        },
      });
      const healthyInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          id: 'in_healthy',
          status: 'paid',
          metadata: {},
        })
      );
      const failingInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          id: 'in_failing',
          status: 'open',
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]: '3',
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
        .mockResolvedValue([healthySub, failingSub]);
      jest
        .spyOn(invoiceManager, 'retrieve')
        .mockImplementation(async (id: string) =>
          id === 'in_healthy' ? healthyInvoice : failingInvoice
        );
      jest
        .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
        .mockResolvedValue({
          [CLIENT_ID]: ['cap_a', 'cap_b'],
        });

      const result = await service.get({ uid: UID, clientId: CLIENT_ID });
      expect(result.payment_provider).toBe('paypal');
      expect(result.paypal_payment_error).toBe('funding_source');
    });

    it('does not set paypal_payment_error when PayPal sub has agreement but no open invoice with retries', async () => {
      const customer = StripeResponseFactory(
        StripeCustomerFactory({
          id: STRIPE_CUSTOMER_ID,
          metadata: {
            [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: 'ba_123',
          },
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
        latest_invoice: 'in_paid',
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
      const paidInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          id: 'in_paid',
          status: 'paid',
          metadata: {},
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
        .spyOn(invoiceManager, 'retrieve')
        .mockResolvedValue(paidInvoice);
      jest
        .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
        .mockResolvedValue({ [CLIENT_ID]: ['cap'] });

      const result = await service.get({ uid: UID, clientId: CLIENT_ID });
      expect(result.payment_provider).toBe('paypal');
      expect(result.paypal_payment_error).toBeUndefined();
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

    describe('free access program', () => {
      // Per-offering filtering by clientId lives in FreeAccessProgramService and
      // is covered by its spec; these tests cover how the billing service maps
      // the grants it returns into subscriptions and gates NotFound on membership.

      // Grant expiries are epoch ms; the response reports current_period_end as
      // a unix timestamp in seconds.
      const FAP_EXPIRY_VPN_MS = Date.UTC(2099, 0, 2);
      const FAP_EXPIRY_RELAY_MS = Date.UTC(2100, 0, 2);
      const FAP_EXPIRY_VPN_SECONDS = Math.floor(FAP_EXPIRY_VPN_MS / 1000);
      const FAP_EXPIRY_RELAY_SECONDS = Math.floor(FAP_EXPIRY_RELAY_MS / 1000);

      const customerNotFound = () =>
        jest
          .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
          .mockRejectedValue(
            new AccountCustomerNotFoundError(UID, new Error('not found'))
          );

      // Minimal stand-in for EligibilityContentByOfferingResultUtil: the service
      // only reads stripeProductId from the offering.
      const mockOffering = (stripeProductId: string) =>
        ({
          getOffering: () => ({ stripeProductId }),
        } as never);

      it('emits a free_access subscription for each grant for the client', async () => {
        customerNotFound();
        jest
          .spyOn(freeAccessProgramService, 'findFreeAccessForUid')
          .mockResolvedValue({
            isMember: true,
            grantsByClient: {
              [CLIENT_ID]: [
                { offeringApiIdentifier: 'vpn', expiresAt: FAP_EXPIRY_VPN_MS },
              ],
            },
          });
        jest
          .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
          .mockResolvedValue(mockOffering('prod_vpn'));

        const result = await service.get({ uid: UID, clientId: CLIENT_ID });

        expect(result.subscriptions).toHaveLength(1);
        expect(result.subscriptions[0]).toEqual({
          _subscription_type: 'free_access',
          current_period_end: FAP_EXPIRY_VPN_SECONDS,
          product_id: 'prod_vpn',
        });
      });

      it('resolves free access for the requesting uid', async () => {
        customerNotFound();
        const findSpy = jest
          .spyOn(freeAccessProgramService, 'findFreeAccessForUid')
          .mockResolvedValue({
            isMember: true,
            grantsByClient: {
              [CLIENT_ID]: [
                { offeringApiIdentifier: 'vpn', expiresAt: FAP_EXPIRY_VPN_MS },
              ],
            },
          });
        const getOfferingSpy = jest
          .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
          .mockResolvedValue(mockOffering('prod_vpn'));

        await service.get({ uid: UID, clientId: CLIENT_ID });

        expect(findSpy).toHaveBeenCalledWith(UID);
        expect(getOfferingSpy).toHaveBeenCalledWith('vpn');
      });

      it('emits nothing and resolves no offering for a member whose grants belong to another client', async () => {
        customerNotFound();
        // Member has grants, but only for a different client than the requester.
        jest
          .spyOn(freeAccessProgramService, 'findFreeAccessForUid')
          .mockResolvedValue({
            isMember: true,
            grantsByClient: {
              other_client: [
                { offeringApiIdentifier: 'vpn', expiresAt: FAP_EXPIRY_VPN_MS },
              ],
            },
          });
        const getOfferingSpy = jest.spyOn(
          productConfigurationManager,
          'getEligibilityContentByOffering'
        );

        const result = await service.get({ uid: UID, clientId: CLIENT_ID });

        expect(result.subscriptions).toHaveLength(0);
        // No offering is resolved when this client has no grants.
        expect(getOfferingSpy).not.toHaveBeenCalled();
      });

      it('does not throw NotFound for a member whose grants belong to another client', async () => {
        customerNotFound();
        jest
          .spyOn(freeAccessProgramService, 'findFreeAccessForUid')
          .mockResolvedValue({
            isMember: true,
            grantsByClient: {
              other_client: [
                { offeringApiIdentifier: 'vpn', expiresAt: FAP_EXPIRY_VPN_MS },
              ],
            },
          });

        const result = await service.get({ uid: UID, clientId: CLIENT_ID });

        expect(result.subscriptions).toEqual([]);
      });

      it('returns both a web subscription and a free_access subscription', async () => {
        const customer = StripeResponseFactory(
          StripeCustomerFactory({
            id: STRIPE_CUSTOMER_ID,
            currency: 'usd',
          })
        );
        const price = StripePriceFactory({
          id: 'price_web',
          currency: 'usd',
          recurring: StripePriceRecurringFactory({ interval: 'month' }),
        });
        const sub = StripeSubscriptionFactory({
          id: 'sub_web',
          status: 'active',
          items: {
            object: 'list',
            data: [
              StripeSubscriptionItemFactory({
                price: { ...price, product: 'prod_web' },
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
          .spyOn(paymentMethodManager, 'retrieve')
          .mockResolvedValue(
            StripeResponseFactory(StripeCardPaymentMethodFactory())
          );
        jest
          .spyOn(freeAccessProgramService, 'findFreeAccessForUid')
          .mockResolvedValue({
            isMember: true,
            grantsByClient: {
              [CLIENT_ID]: [
                { offeringApiIdentifier: 'vpn', expiresAt: FAP_EXPIRY_VPN_MS },
              ],
            },
          });
        jest
          .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
          .mockResolvedValue(mockOffering('prod_vpn'));
        jest
          .spyOn(capabilityManager, 'priceIdsToClientCapabilities')
          .mockResolvedValue({ [CLIENT_ID]: ['cap'] });

        const result = await service.get({ uid: UID, clientId: CLIENT_ID });

        const types = result.subscriptions.map((s) => s._subscription_type);
        expect(types).toEqual(['web', 'free_access']);
      });

      it('returns a free_access subscription per grant with its own expiry', async () => {
        customerNotFound();
        jest
          .spyOn(freeAccessProgramService, 'findFreeAccessForUid')
          .mockResolvedValue({
            isMember: true,
            grantsByClient: {
              [CLIENT_ID]: [
                { offeringApiIdentifier: 'vpn', expiresAt: FAP_EXPIRY_VPN_MS },
                {
                  offeringApiIdentifier: 'relay',
                  expiresAt: FAP_EXPIRY_RELAY_MS,
                },
              ],
            },
          });
        jest
          .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
          .mockImplementation(async (apiIdentifier: string) =>
            apiIdentifier === 'vpn'
              ? mockOffering('prod_vpn')
              : mockOffering('prod_relay')
          );

        const result = await service.get({ uid: UID, clientId: CLIENT_ID });

        expect(result.subscriptions).toHaveLength(2);
        // One subscription per grant, each with its own CMS-sourced expiry.
        expect(result.subscriptions).toEqual([
          {
            _subscription_type: 'free_access',
            current_period_end: FAP_EXPIRY_VPN_SECONDS,
            product_id: 'prod_vpn',
          },
          {
            _subscription_type: 'free_access',
            current_period_end: FAP_EXPIRY_RELAY_SECONDS,
            product_id: 'prod_relay',
          },
        ]);
      });

      it('does not resolve free access when the feature is disabled', async () => {
        mockFreeAccessProgramConfig.enabled = false;
        // FAP-only customer: no Stripe customer and no IAP purchases.
        customerNotFound();
        const findSpy = jest.spyOn(
          freeAccessProgramService,
          'findFreeAccessForUid'
        );

        // With the feature off, a FAP-only customer is treated as unknown.
        await expect(
          service.get({ uid: UID, clientId: CLIENT_ID })
        ).rejects.toMatchObject({ response: { errno: 176 } });
        expect(findSpy).not.toHaveBeenCalled();
      });
    });
  });
});
