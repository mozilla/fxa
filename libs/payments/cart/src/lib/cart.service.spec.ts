/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import {
  EligibilityManager,
  EligibilityService,
  EligibilityStatus,
  SubscriptionEligibilityResultFactory,
  SubscriptionEligibilityUpgradeDowngradeResultFactory,
} from '@fxa/payments/eligibility';
import {
  MockPaypalClientConfigProvider,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  CouponErrorExpired,
  CustomerManager,
  CustomerSessionManager,
  InvoiceManager,
  InvoicePreviewFactory,
  PaymentIntentManager,
  PaymentMethodManager,
  PriceManager,
  PricingForCurrencyFactory,
  ProductManager,
  PromotionCodeManager,
  SubplatInterval,
  SubscriptionManager,
  TaxAddressFactory,
} from '@fxa/payments/customer';
import {
  ResultAccountCustomerFactory,
  StripeClient,
  StripeCustomerFactory,
  StripePriceFactory,
  StripeResponseFactory,
  MockStripeConfigProvider,
  AccountCustomerManager,
  StripeSubscriptionFactory,
  StripePaymentMethodFactory,
  StripePaymentIntentFactory,
  StripeCustomerSessionFactory,
  StripeApiListFactory,
  StripeInvoiceFactory,
  StripePriceRecurringFactory,
} from '@fxa/payments/stripe';
import {
  MockProfileClientConfigProvider,
  ProfileClient,
} from '@fxa/profile/client';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import {
  AccountFactory,
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import {
  GeoDBManager,
  GeoDBManagerConfig,
  MockGeoDBNestFactory,
} from '@fxa/shared/geodb';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { AccountManager } from '@fxa/shared/account/account';
import {
  MockNotifierSnsConfigProvider,
  NotifierService,
  NotifierSnsProvider,
} from '@fxa/shared/notifier';
import {
  CheckoutCustomerDataFactory,
  FinishErrorCartFactory,
  ResultCartFactory,
  UpdateCartInputFactory,
} from './cart.factories';
import { CartManager } from './cart.manager';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import {
  CartError,
  CartCurrencyNotFoundError,
  CartInvalidPromoCodeError,
  CartInvalidStateForActionError,
  CartStateProcessingError,
  CartSubscriptionNotFoundError,
} from './cart.error';
import { CurrencyManager } from '@fxa/payments/currency';
import {
  LocationConfig,
  MockLocationConfigProvider,
} from '@fxa/payments/eligibility';
import { MockCurrencyConfigProvider } from 'libs/payments/currency/src/lib/currency.config';
import { NeedsInputType } from './cart.types';
import { redirect } from 'next/navigation';
import {
  AppleIapClient,
  AppleIapPurchaseManager,
  GoogleIapClient,
  GoogleIapPurchaseManager,
  MockAppleIapClientConfigProvider,
  MockGoogleIapClientConfigProvider,
} from '@fxa/payments/iap';
import { Logger } from '@nestjs/common';

jest.mock('next/navigation');
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

describe('CartService', () => {
  let accountManager: AccountManager;
  let accountCustomerManager: AccountCustomerManager;
  let cartService: CartService;
  let cartManager: CartManager;
  let checkoutService: CheckoutService;
  let customerManager: CustomerManager;
  let customerSessionManager: CustomerSessionManager;
  let currencyManager: CurrencyManager;
  let paymentIntentManager: PaymentIntentManager;
  let promotionCodeManager: PromotionCodeManager;
  let eligibilityService: EligibilityService;
  let geodbManager: GeoDBManager;
  let invoiceManager: InvoiceManager;
  let productConfigurationManager: ProductConfigurationManager;
  let subscriptionManager: SubscriptionManager;
  let paymentMethodManager: PaymentMethodManager;
  let priceManager: PriceManager;

  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    setContext: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountCustomerManager,
        AccountManager,
        CartManager,
        CartService,
        CheckoutService,
        CustomerManager,
        CustomerSessionManager,
        EligibilityManager,
        EligibilityService,
        AppleIapPurchaseManager,
        AppleIapClient,
        MockAppleIapClientConfigProvider,
        GoogleIapPurchaseManager,
        GoogleIapClient,
        MockGoogleIapClientConfigProvider,
        Logger,
        GeoDBManager,
        GeoDBManagerConfig,
        InvoiceManager,
        LocationConfig,
        MockAccountDatabaseNestFactory,
        MockFirestoreProvider,
        MockGeoDBNestFactory,
        MockLocationConfigProvider,
        MockNotifierSnsConfigProvider,
        MockPaypalClientConfigProvider,
        MockProfileClientConfigProvider,
        MockStatsDProvider,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        NotifierService,
        NotifierSnsProvider,
        PaymentIntentManager,
        PaymentMethodManager,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalCustomerManager,
        PriceManager,
        ProductConfigurationManager,
        ProductManager,
        ProfileClient,
        PromotionCodeManager,
        StrapiClient,
        StripeClient,
        SubscriptionManager,
        CurrencyManager,
        MockCurrencyConfigProvider,
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    accountManager = moduleRef.get(AccountManager);
    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    cartManager = moduleRef.get(CartManager);
    cartService = moduleRef.get(CartService);
    checkoutService = moduleRef.get(CheckoutService);
    customerManager = moduleRef.get(CustomerManager);
    customerSessionManager = moduleRef.get(CustomerSessionManager);
    currencyManager = moduleRef.get(CurrencyManager);
    paymentIntentManager = moduleRef.get(PaymentIntentManager);
    promotionCodeManager = moduleRef.get(PromotionCodeManager);
    eligibilityService = moduleRef.get(EligibilityService);
    geodbManager = moduleRef.get(GeoDBManager);
    invoiceManager = moduleRef.get(InvoiceManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    priceManager = moduleRef.get(PriceManager);
  });

  describe('wrapCartWithCatch', () => {
    it('calls cartManager.finishErrorCart', async () => {
      const mockCart = ResultCartFactory({
        state: CartState.PROCESSING,
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      });
      jest
        .spyOn(cartManager, 'fetchCartById')
        .mockRejectedValueOnce(new Error('test'))
        .mockResolvedValue(mockCart);
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await expect(
        cartService.finalizeProcessingCart(mockCart.id)
      ).rejects.toThrow(Error);

      expect(cartManager.finishErrorCart).toHaveBeenCalled();
    });

    it('cancels a created subscription', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockCustomer.id,
          latest_invoice: null,
        })
      );
      const mockCart = ResultCartFactory({
        state: CartState.PROCESSING,
        stripeSubscriptionId: mockSubscription.id,
        stripeCustomerId: mockCustomer.id,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });

      jest
        .spyOn(cartManager, 'fetchCartById')
        .mockRejectedValueOnce(new Error('test'))
        .mockResolvedValue(mockCart);

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(mockSubscription);

      await expect(
        cartService.finalizeProcessingCart(mockCart.id)
      ).rejects.toThrow(Error);

      expect(subscriptionManager.cancel).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          cancellation_details: {
            comment: 'Automatic Cancellation: Cart checkout failed.',
          },
        }
      );
    });

    it('finalizes and voids a draft invoice', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({ status: 'draft' })
      );
      const mockFinalizedInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          ...mockInvoice,
          status: 'open',
          auto_advance: false,
        })
      );
      const mockVoidedInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          ...mockFinalizedInvoice,
          status: 'void',
        })
      );
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockCustomer.id,
          latest_invoice: mockInvoice.id,
        })
      );
      const mockCart = ResultCartFactory({
        state: CartState.PROCESSING,
        stripeSubscriptionId: mockSubscription.id,
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(cartManager, 'fetchCartById')
        .mockRejectedValueOnce(new Error('test'))
        .mockResolvedValue(mockCart);

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(mockInvoice);
      jest
        .spyOn(invoiceManager, 'safeFinalizeWithoutAutoAdvance')
        .mockResolvedValue(mockFinalizedInvoice);
      jest.spyOn(invoiceManager, 'void').mockResolvedValue(mockVoidedInvoice);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(mockSubscription);

      await expect(
        cartService.finalizeProcessingCart(mockCart.id)
      ).rejects.toThrow(Error);

      expect(
        invoiceManager.safeFinalizeWithoutAutoAdvance
      ).toHaveBeenCalledWith(mockInvoice.id);
      expect(invoiceManager.void).toHaveBeenCalledWith(mockInvoice.id);
    });

    it('voids a created finalized invoice', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({ status: 'open' })
      );
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockCustomer.id,
          latest_invoice: mockInvoice.id,
        })
      );
      const mockCart = ResultCartFactory({
        state: CartState.PROCESSING,
        stripeSubscriptionId: mockSubscription.id,
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(cartManager, 'fetchCartById')
        .mockRejectedValueOnce(new Error('test'))
        .mockResolvedValue(mockCart);

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(invoiceManager, 'retrieve').mockResolvedValue(mockInvoice);
      jest.spyOn(invoiceManager, 'void').mockResolvedValue(mockInvoice);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(mockSubscription);

      await expect(
        cartService.finalizeProcessingCart(mockCart.id)
      ).rejects.toThrow(Error);

      expect(invoiceManager.void).toHaveBeenCalledWith(mockInvoice.id);
    });

    it('cancels a created payment intent', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPaymentIntent = StripeResponseFactory(
        StripePaymentIntentFactory({ status: 'processing' })
      );
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockCustomer.id,
          latest_invoice: null,
        })
      );
      const mockCart = ResultCartFactory({
        state: CartState.PROCESSING,
        stripeSubscriptionId: mockSubscription.id,
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(cartManager, 'fetchCartById')
        .mockRejectedValueOnce(new Error('test'))
        .mockResolvedValue(mockCart);

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(mockPaymentIntent);
      jest
        .spyOn(paymentIntentManager, 'cancel')
        .mockResolvedValue(mockPaymentIntent);
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(mockSubscription);

      await expect(
        cartService.finalizeProcessingCart(mockCart.id)
      ).rejects.toThrow(Error);

      expect(paymentIntentManager.cancel).toHaveBeenCalledWith(
        mockPaymentIntent.id
      );
    });

    it('does not delete a customer with preexisting subscriptions', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockCustomer.id,
          latest_invoice: null,
        })
      );
      const mockPreviousSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockCart = ResultCartFactory({
        state: CartState.PROCESSING,
        stripeSubscriptionId: mockSubscription.id,
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(cartManager, 'fetchCartById')
        .mockRejectedValueOnce(new Error('test'))
        .mockResolvedValue(mockCart);

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockPreviousSubscription]);
      jest.spyOn(customerManager, 'delete');

      await expect(
        cartService.finalizeProcessingCart(mockCart.id)
      ).rejects.toThrow(Error);

      expect(customerManager.delete).not.toHaveBeenCalledWith(mockCustomer.id);
    });
  });

  describe('setupCart', () => {
    const taxAddress = TaxAddressFactory();
    const args = {
      interval: SubplatInterval.Monthly,
      offeringConfigId: faker.string.uuid(),
      experiment: faker.string.uuid(),
      promoCode: faker.word.noun(),
      uid: faker.string.hexadecimal({
        length: 32,
        prefix: '',
        casing: 'lower',
      }),
      taxAddress,
      currency: faker.finance.currencyCode(),
      ip: faker.internet.ipv4(),
    };

    const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
    const mockAccountCustomer = ResultAccountCustomerFactory({
      stripeCustomerId: mockCustomer.id,
    });
    const mockInvoicePreview = InvoicePreviewFactory();
    const mockResultCart = ResultCartFactory();
    const mockPrice = StripePriceFactory();

    beforeEach(async () => {
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest.spyOn(geodbManager, 'getTaxAddress').mockReturnValue(taxAddress);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockInvoicePreview);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });
    });

    it('calls createCart with expected parameters', async () => {
      const mockResultCart = ResultCartFactory();
      const mockResolvedCurrency = faker.finance.currencyCode();

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockResolvedCurrency);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockResultCart);
      jest.spyOn(accountManager, 'getAccounts').mockResolvedValue([]);

      const result = await cartService.setupCart(args);

      expect(cartManager.createCart).toHaveBeenCalledWith({
        interval: args.interval,
        offeringConfigId: args.offeringConfigId,
        amount: mockInvoicePreview.subtotal,
        uid: args.uid,
        stripeCustomerId: mockAccountCustomer.stripeCustomerId,
        experiment: args.experiment,
        taxAddress,
        currency: mockResolvedCurrency,
        eligibilityStatus: CartEligibilityStatus.CREATE,
        couponCode: args.promoCode,
      });
      expect(result).toEqual(mockResultCart);
    });

    it('throws an error when couponCode is invalid', async () => {
      const mockAccount = AccountFactory();
      const mockResolvedCurrency = faker.finance.currencyCode();

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockRejectedValue(undefined);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockResultCart);
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockResolvedCurrency);

      await expect(() => cartService.setupCart(args)).rejects.toThrowError(
        CartInvalidPromoCodeError
      );

      expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice
      ).toHaveBeenCalledWith(args.promoCode, mockPrice, mockResolvedCurrency);
      expect(cartManager.createCart).not.toHaveBeenCalled();
    });

    it('throws an error when country to currency result is invalid', async () => {
      const mockAccount = AccountFactory();

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(undefined);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockResultCart);
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);

      await expect(() => cartService.setupCart(args)).rejects.toThrowError(
        CartCurrencyNotFoundError
      );

      expect(cartManager.createCart).not.toHaveBeenCalled();
    });

    it('returns cart eligibility status blocked_iap', async () => {
      const mockErrorCart = ResultCartFactory({
        state: CartState.FAIL,
      });
      const mockResolvedCurrency = faker.finance.currencyCode();

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockResolvedCurrency);
      jest
        .spyOn(cartManager, 'createErrorCart')
        .mockResolvedValue(mockErrorCart);
      jest.spyOn(accountManager, 'getAccounts').mockResolvedValue([]);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue(
        SubscriptionEligibilityResultFactory({
          subscriptionEligibilityResult: EligibilityStatus.BLOCKED_IAP,
        })
      );

      const result = await cartService.setupCart(args);

      expect(cartManager.createErrorCart).toHaveBeenCalledWith(
        {
          interval: args.interval,
          offeringConfigId: args.offeringConfigId,
          amount: mockInvoicePreview.subtotal,
          uid: args.uid,
          stripeCustomerId: mockAccountCustomer.stripeCustomerId,
          experiment: args.experiment,
          taxAddress,
          currency: mockResolvedCurrency,
          eligibilityStatus: CartEligibilityStatus.BLOCKED_IAP,
          couponCode: args.promoCode,
        },
        CartErrorReasonId.IAP_UPGRADE_CONTACT_SUPPORT
      );
      expect(result).toEqual(mockErrorCart);
    });

    it('returns cart eligibility status downgrade', async () => {
      const mockErrorCart = ResultCartFactory({
        state: CartState.FAIL,
      });
      const mockResolvedCurrency = faker.finance.currencyCode();

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockResolvedCurrency);
      jest
        .spyOn(cartManager, 'createErrorCart')
        .mockResolvedValue(mockErrorCart);
      jest.spyOn(accountManager, 'getAccounts').mockResolvedValue([]);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue(
        SubscriptionEligibilityUpgradeDowngradeResultFactory({
          subscriptionEligibilityResult: EligibilityStatus.DOWNGRADE,
        })
      );

      const result = await cartService.setupCart(args);

      expect(cartManager.createErrorCart).toHaveBeenCalledWith(
        {
          interval: args.interval,
          offeringConfigId: args.offeringConfigId,
          amount: mockInvoicePreview.subtotal,
          uid: args.uid,
          stripeCustomerId: mockAccountCustomer.stripeCustomerId,
          experiment: args.experiment,
          taxAddress,
          currency: mockResolvedCurrency,
          eligibilityStatus: CartEligibilityStatus.DOWNGRADE,
          couponCode: args.promoCode,
        },
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_DOWNGRADE
      );
      expect(result).toEqual(mockErrorCart);
    });

    it('returns cart eligibility status invalid', async () => {
      const mockErrorCart = ResultCartFactory({
        state: CartState.FAIL,
      });
      const mockResolvedCurrency = faker.finance.currencyCode();

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockResolvedCurrency);
      jest
        .spyOn(cartManager, 'createErrorCart')
        .mockResolvedValue(mockErrorCart);
      jest.spyOn(accountManager, 'getAccounts').mockResolvedValue([]);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.INVALID,
      });

      const result = await cartService.setupCart(args);

      expect(cartManager.createErrorCart).toHaveBeenCalledWith(
        {
          interval: args.interval,
          offeringConfigId: args.offeringConfigId,
          amount: mockInvoicePreview.subtotal,
          uid: args.uid,
          stripeCustomerId: mockAccountCustomer.stripeCustomerId,
          experiment: args.experiment,
          taxAddress,
          currency: mockResolvedCurrency,
          eligibilityStatus: CartEligibilityStatus.INVALID,
          couponCode: args.promoCode,
        },
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_INVALID
      );
      expect(result).toEqual(mockErrorCart);
    });

    it('returns cart eligibility status same', async () => {
      const mockErrorCart = ResultCartFactory({
        state: CartState.FAIL,
      });
      const mockResolvedCurrency = faker.finance.currencyCode();

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockResolvedCurrency);
      jest
        .spyOn(cartManager, 'createErrorCart')
        .mockResolvedValue(mockErrorCart);
      jest.spyOn(accountManager, 'getAccounts').mockResolvedValue([]);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.SAME,
      });

      const result = await cartService.setupCart(args);

      expect(cartManager.createErrorCart).toHaveBeenCalledWith(
        {
          interval: args.interval,
          offeringConfigId: args.offeringConfigId,
          amount: mockInvoicePreview.subtotal,
          uid: args.uid,
          stripeCustomerId: mockAccountCustomer.stripeCustomerId,
          experiment: args.experiment,
          taxAddress,
          currency: mockResolvedCurrency,
          eligibilityStatus: CartEligibilityStatus.INVALID,
          couponCode: args.promoCode,
        },
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_SAME
      );
      expect(result).toEqual(mockErrorCart);
    });
  });

  describe('restartCart', () => {
    const mockStripeCustomerId = faker.string.uuid();
    const mockAccountCustomer = ResultAccountCustomerFactory({
      stripeCustomerId: mockStripeCustomerId,
    });
    const mockOldCart = ResultCartFactory({
      uid: mockAccountCustomer.uid,
      couponCode: faker.word.noun(),
      stripeSubscriptionId: undefined,
    });
    const mockNewCart = ResultCartFactory();
    const mockPrice = StripePriceFactory();

    beforeEach(async () => {
      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockOldCart);
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
    });

    it('fetches old cart and creates new cart with same details', async () => {
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockNewCart);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      const result = await cartService.restartCart(mockOldCart.id);

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockOldCart.id);
      expect(cartManager.createCart).toHaveBeenCalledWith({
        uid: mockOldCart.uid,
        interval: mockOldCart.interval,
        offeringConfigId: mockOldCart.offeringConfigId,
        couponCode: mockOldCart.couponCode,
        taxAddress: mockOldCart.taxAddress,
        currency: mockOldCart.currency,
        stripeCustomerId: mockAccountCustomer.stripeCustomerId,
        amount: mockOldCart.amount,
        eligibilityStatus: mockOldCart.eligibilityStatus,
      });
      expect(result).toEqual(mockNewCart);
    });

    it('throws an error when couponCode is invalid', async () => {
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockRejectedValue(undefined);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockNewCart);

      await expect(() =>
        cartService.restartCart(mockOldCart.id)
      ).rejects.toThrowError(CartInvalidPromoCodeError);

      expect(
        promotionCodeManager.assertValidPromotionCodeNameForPrice
      ).toHaveBeenCalledWith(
        mockOldCart.couponCode,
        mockPrice,
        mockOldCart.currency
      );
      expect(cartManager.createCart).not.toHaveBeenCalled();
      expect(cartManager.finishErrorCart).toHaveBeenCalled();
    });
  });

  describe('checkoutCartWithStripe', () => {
    const mockCustomerData = CheckoutCustomerDataFactory();

    it('accepts payment with stripe', async () => {
      const mockCart = ResultCartFactory();
      const mockPaymentMethodId = faker.string.uuid();

      jest
        .spyOn(cartManager, 'fetchAndValidateCartVersion')
        .mockResolvedValue(mockCart);
      jest.spyOn(cartManager, 'setProcessingCart').mockResolvedValue();
      jest.spyOn(checkoutService, 'payWithStripe').mockResolvedValue();
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await cartService.checkoutCartWithStripe(
        mockCart.id,
        mockCart.version,
        mockPaymentMethodId,
        mockCustomerData
      );

      expect(checkoutService.payWithStripe).toHaveBeenCalledWith(
        mockCart,
        mockPaymentMethodId,
        mockCustomerData
      );
      expect(cartManager.finishErrorCart).not.toHaveBeenCalled();
    });

    it('throws an error when cart version does not match', async () => {
      const mockCart = ResultCartFactory();
      const mockPaymentMethodId = faker.string.uuid();

      jest
        .spyOn(cartManager, 'fetchAndValidateCartVersion')
        .mockRejectedValue(new Error());
      jest.spyOn(checkoutService, 'payWithStripe').mockResolvedValue();
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await expect(
        cartService.checkoutCartWithStripe(
          mockCart.id,
          mockCart.version,
          mockPaymentMethodId,
          mockCustomerData
        )
      ).rejects.toBeInstanceOf(CartStateProcessingError);

      expect(checkoutService.payWithStripe).not.toHaveBeenCalled();
      expect(cartManager.finishErrorCart).toHaveBeenCalled();
    });
  });

  describe('checkoutCartWithPaypal', () => {
    const mockCustomerData = CheckoutCustomerDataFactory();

    it('accepts payment with Paypal', async () => {
      const mockCart = ResultCartFactory();
      const mockToken = faker.string.uuid();

      jest
        .spyOn(cartManager, 'fetchAndValidateCartVersion')
        .mockResolvedValue(mockCart);
      jest.spyOn(cartManager, 'setProcessingCart').mockResolvedValue();
      jest.spyOn(checkoutService, 'payWithPaypal').mockResolvedValue();
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await cartService.checkoutCartWithPaypal(
        mockCart.id,
        mockCart.version,
        mockCustomerData,
        mockToken
      );

      expect(checkoutService.payWithPaypal).toHaveBeenCalledWith(
        mockCart,
        mockCustomerData,
        mockToken
      );
      expect(cartManager.finishErrorCart).not.toHaveBeenCalled();
    });

    it('reject with CartStateProcessingError if cart could not be set to processing', async () => {
      const mockCart = ResultCartFactory();
      const mockToken = faker.string.uuid();

      jest
        .spyOn(cartManager, 'fetchAndValidateCartVersion')
        .mockRejectedValue(new Error('test'));
      jest.spyOn(checkoutService, 'payWithPaypal').mockResolvedValue();
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await expect(
        cartService.checkoutCartWithPaypal(
          mockCart.id,
          mockCart.version,
          mockCustomerData,
          mockToken
        )
      ).rejects.toBeInstanceOf(CartStateProcessingError);

      expect(checkoutService.payWithPaypal).not.toHaveBeenCalled();
      expect(cartManager.finishErrorCart).toHaveBeenCalled();
    });
  });

  describe('finalizeProcessingCart', () => {
    it('throws an error for a cart that has no uid', async () => {
      const mockCart = ResultCartFactory();

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await expect(
        cartService.finalizeProcessingCart(mockCart.id)
      ).rejects.toThrowError(CartError);
      expect(cartManager.finishErrorCart).toHaveBeenCalled();
    });
    it('throws a CartSubscriptionNotFoundError', async () => {
      const mockCart = ResultCartFactory({
        uid: faker.string.hexadecimal({
          length: 32,
          prefix: '',
          casing: 'lower',
        }),
        stripeSubscriptionId: null,
      });

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);

      await expect(
        cartService.finalizeProcessingCart(mockCart.id)
      ).rejects.toThrowError(CartSubscriptionNotFoundError);
      expect(cartManager.finishErrorCart).toHaveBeenCalled();
    });
    it('calls checkoutService.postPaySteps', async () => {
      const mockCart = ResultCartFactory({
        uid: faker.string.hexadecimal({
          length: 32,
          prefix: '',
          casing: 'lower',
        }),
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(checkoutService, 'postPaySteps').mockResolvedValue();

      await cartService.finalizeProcessingCart(mockCart.id);

      expect(checkoutService.postPaySteps).toHaveBeenCalledWith({
        cart: mockCart,
        version: mockCart.version,
        subscription: mockSubscription,
        uid: mockCart.uid,
        paymentProvider: 'stripe',
      });
    });
  });

  describe('finalizeCartWithError', () => {
    it('calls cartManager.finishErrorCart', async () => {
      const mockCart = ResultCartFactory();
      const mockErrorCart = FinishErrorCartFactory();

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await cartService.finalizeCartWithError(
        mockCart.id,
        mockErrorCart.errorReasonId
      );

      expect(cartManager.finishErrorCart).toHaveBeenCalledWith(mockCart.id, {
        errorReasonId: mockErrorCart.errorReasonId,
      });
    });

    it('should swallow error if cart already in fail state', async () => {
      const mockCart = ResultCartFactory({
        state: CartState.FAIL,
      });
      const mockErrorCart = FinishErrorCartFactory();

      jest.spyOn(cartManager, 'finishErrorCart').mockRejectedValue(undefined);
      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);

      await cartService.finalizeCartWithError(
        mockCart.id,
        mockErrorCart.errorReasonId
      );

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
    });

    it('should throw error if cart is not in fail state and finishErrorCart failed', async () => {
      const mockCart = ResultCartFactory({
        state: CartState.SUCCESS,
      });
      const mockErrorCart = FinishErrorCartFactory();

      jest.spyOn(cartManager, 'finishErrorCart').mockRejectedValue(new Error());
      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);

      await expect(
        cartService.finalizeCartWithError(
          mockCart.id,
          mockErrorCart.errorReasonId
        )
      ).rejects.toThrow(Error);

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
    });

    it('should throw error if fetchCart fails and finishErrorCart failed', async () => {
      const mockCart = ResultCartFactory();
      const mockErrorCart = FinishErrorCartFactory();

      jest.spyOn(cartManager, 'finishErrorCart').mockRejectedValue(undefined);
      jest.spyOn(cartManager, 'fetchCartById').mockRejectedValue(new Error());

      await expect(
        cartService.finalizeCartWithError(
          mockCart.id,
          mockErrorCart.errorReasonId
        )
      ).rejects.toThrow(Error);

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
    });
  });

  describe('updateCart', () => {
    describe('updates cart with tax address and currency', () => {
      const mockCurrency = faker.finance.currencyCode();
      const mockCart = ResultCartFactory({
        stripeSubscriptionId: undefined,
        currency: mockCurrency,
      });
      const mockUpdateCartInput = UpdateCartInputFactory({
        taxAddress: {
          postalCode: faker.location.zipCode(),
          countryCode: faker.location.countryCode(),
        },
      });
      const mockPrice = StripePriceFactory();
      const mockPreviewInvoice = InvoicePreviewFactory();
      const expectedUpdateCart = {
        ...mockUpdateCartInput,
        currency: mockCurrency,
      };

      beforeEach(() => {
        jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
        jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
        jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
        jest
          .spyOn(currencyManager, 'getCurrencyForCountry')
          .mockReturnValue(mockCurrency);
        jest
          .spyOn(productConfigurationManager, 'retrieveStripePrice')
          .mockResolvedValue(mockPrice);
        jest
          .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
          .mockResolvedValue(undefined);
        jest
          .spyOn(invoiceManager, 'previewUpcoming')
          .mockResolvedValue(mockPreviewInvoice);
      });

      it('calls cartManager.updateFreshCart with no currency change', async () => {
        await cartService.updateCart(
          mockCart.id,
          mockCart.version,
          mockUpdateCartInput
        );

        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
          mockCart.id,
          mockCart.version,
          expectedUpdateCart
        );
        expect(cartManager.finishErrorCart).not.toHaveBeenCalled();
      });

      it('currency changes and existing coupon validates successfully', async () => {
        const mockCart = ResultCartFactory({
          stripeSubscriptionId: undefined,
          couponCode: 'PERCENTAGE_COUPON',
          currency: 'RANDOM_CURRENCY', // purposfully invalid so that in doesn't conflict
        });
        jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
        await cartService.updateCart(
          mockCart.id,
          mockCart.version,
          mockUpdateCartInput
        );

        expect(
          promotionCodeManager.assertValidPromotionCodeNameForPrice
        ).toHaveBeenCalledWith(mockCart.couponCode, mockPrice, mockCurrency);
        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
          mockCart.id,
          mockCart.version,
          {
            ...expectedUpdateCart,
            amount: mockPreviewInvoice.subtotal,
          }
        );
      });

      it('currency changes and existing coupon validation fails', async () => {
        const mockCart = ResultCartFactory({
          stripeSubscriptionId: undefined,
          couponCode: 'PERCENTAGE_COUPON',
          currency: 'RANDOM_CURRENCY', // purposfully invalid so that in doesn't conflict
        });
        jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
        jest
          .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
          .mockRejectedValue(new Error('any error'));
        await cartService.updateCart(
          mockCart.id,
          mockCart.version,
          mockUpdateCartInput
        );

        expect(
          promotionCodeManager.assertValidPromotionCodeNameForPrice
        ).toHaveBeenCalledWith(mockCart.couponCode, mockPrice, mockCurrency);
        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
          mockCart.id,
          mockCart.version,
          {
            ...expectedUpdateCart,
            couponCode: null,
            amount: mockPreviewInvoice.subtotal,
          }
        );
      });

      it('throws if country to currency result is not valid', async () => {
        jest
          .spyOn(currencyManager, 'getCurrencyForCountry')
          .mockReturnValue(undefined);
        jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

        await expect(
          cartService.updateCart(
            mockCart.id,
            mockCart.version,
            mockUpdateCartInput
          )
        ).rejects.toBeInstanceOf(CartCurrencyNotFoundError);
      });
    });

    describe('updates cart with coupon code', () => {
      const mockCart = ResultCartFactory({
        stripeSubscriptionId: undefined,
      });
      const mockPrice = StripePriceFactory();
      const mockUpdateCartInput = UpdateCartInputFactory({
        couponCode: faker.word.noun(),
      });
      const expectedUpdateCart = {
        ...mockUpdateCartInput,
      };

      beforeEach(async () => {
        jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
        jest
          .spyOn(productConfigurationManager, 'retrieveStripePrice')
          .mockResolvedValue(mockPrice);
        jest
          .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
          .mockResolvedValue(undefined);
        jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
      });

      it('success if coupon is valid', async () => {
        await cartService.updateCart(
          mockCart.id,
          mockCart.version,
          mockUpdateCartInput
        );

        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
          mockCart.id,
          mockCart.version,
          expectedUpdateCart
        );
      });

      it('throws if coupon is not valid', async () => {
        jest
          .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
          .mockRejectedValue(new CouponErrorExpired());
        jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

        await expect(
          cartService.updateCart(
            mockCart.id,
            mockCart.version,
            mockUpdateCartInput
          )
        ).rejects.toBeInstanceOf(CouponErrorExpired);

        expect(
          promotionCodeManager.assertValidPromotionCodeNameForPrice
        ).toHaveBeenCalledWith(
          mockUpdateCartInput.couponCode,
          mockPrice,
          mockCart.currency
        );
        expect(cartManager.updateFreshCart).not.toHaveBeenCalled();
        expect(cartManager.finishErrorCart).not.toHaveBeenCalled();
      });
    });
  });

  describe('getCartState', () => {
    it('returns cart state', async () => {
      const mockCart = ResultCartFactory({
        state: CartState.START,
        stripeSubscriptionId: null,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);

      const result = await cartService.getCartState(mockCart.id);
      expect(result).toEqual({
        state: mockCart.state
      });

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
    });
  });

  describe('getCart', () => {
    const mockCustomerSession = StripeResponseFactory(
      StripeCustomerSessionFactory()
    );
    const mockSubscription = StripeSubscriptionFactory();
    const mockListSubscriptions = StripeApiListFactory([mockSubscription]);
    const mockPaymentMethod = StripeResponseFactory(
      StripePaymentMethodFactory({})
    );

    beforeEach(() => {
      jest
        .spyOn(customerSessionManager, 'create')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue(mockListSubscriptions.data);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);
    });

    it('returns cart and upcomingInvoicePreview', async () => {
      const mockCart = ResultCartFactory({
        state: CartState.START,
        stripeSubscriptionId: null,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPrice = StripePriceFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockInvoicePreview);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });

      const result = await cartService.getCart(mockCart.id);
      expect(result).toEqual({
        ...mockCart,
        upcomingInvoicePreview: mockInvoicePreview,
        paymentInfo: {
          type: mockPaymentMethod.type,
          last4: mockPaymentMethod.card?.last4,
          brand: mockPaymentMethod.card?.brand,
          customerSessionClientSecret: mockCustomerSession.client_secret,
        },
        metricsOptedOut: false,
        hasActiveSubscriptions: true,
      });

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalledWith(mockCart.offeringConfigId, mockCart.interval);
      expect(customerManager.retrieve).toHaveBeenCalledWith(
        mockCart.stripeCustomerId
      );
      expect(invoiceManager.previewUpcoming).toHaveBeenCalledWith({
        priceId: mockPrice.id,
        currency: mockCart.currency,
        customer: mockCustomer,
        taxAddress: mockCart.taxAddress,
      });
    });

    it('returns cart and upcomingInvoicePreview and latestInvoicePreview', async () => {
      const mockCart = ResultCartFactory({
        stripeSubscriptionId: mockSubscription.id,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPrice = StripePriceFactory();
      const mockUpcomingInvoicePreview = InvoicePreviewFactory();
      const mockLatestInvoicePreview = InvoicePreviewFactory();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockUpcomingInvoicePreview);
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(mockLatestInvoicePreview);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);

      const result = await cartService.getCart(mockCart.id);
      expect(result).toEqual({
        ...mockCart,
        upcomingInvoicePreview: mockUpcomingInvoicePreview,
        latestInvoicePreview: mockLatestInvoicePreview,
        metricsOptedOut: false,
        paymentInfo: {
          type: mockPaymentMethod.type,
          last4: mockPaymentMethod.card?.last4,
          brand: mockPaymentMethod.card?.brand,
          customerSessionClientSecret: mockCustomerSession.client_secret,
        },
        hasActiveSubscriptions: true,
      });
      expect(
        'latestInvoicePreview' in result && result.latestInvoicePreview
      ).not.toEqual(result.upcomingInvoicePreview);

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalledWith(mockCart.offeringConfigId, mockCart.interval);
      expect(customerManager.retrieve).toHaveBeenCalledWith(
        mockCart.stripeCustomerId
      );
      expect(invoiceManager.previewUpcoming).toHaveBeenCalledWith({
        priceId: mockPrice.id,
        currency: mockCart.currency,
        customer: mockCustomer,
        taxAddress: mockCart.taxAddress,
      });
      expect(invoiceManager.preview).toHaveBeenCalledWith(
        mockSubscription.latest_invoice
      );
    });

    it('returns cart and upcomingInvoicePreview if customer is undefined', async () => {
      const mockCart = ResultCartFactory({
        stripeCustomerId: null,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });
      const mockPrice = StripePriceFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(customerManager, 'retrieve');
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockInvoicePreview);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });

      const result = await cartService.getCart(mockCart.id);
      expect(result).toEqual({
        ...mockCart,
        upcomingInvoicePreview: mockInvoicePreview,
        metricsOptedOut: false,
        hasActiveSubscriptions: false,
      });

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalledWith(mockCart.offeringConfigId, mockCart.interval);
      expect(customerManager.retrieve).not.toHaveBeenCalled();
      expect(invoiceManager.previewUpcoming).toHaveBeenCalledWith({
        priceId: mockPrice.id,
        currency: mockCart.currency,
        customer: undefined,
        taxAddress: mockCart.taxAddress,
      });
    });

    it('returns cart with upgrade eligibility status', async () => {
      const mockCart = ResultCartFactory({
        state: CartState.START,
        stripeSubscriptionId: null,
        eligibilityStatus: CartEligibilityStatus.UPGRADE,
      });
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPrice = StripePriceFactory({ currency: mockCart.currency });
      const mockInvoicePreview = InvoicePreviewFactory();
      const mockFromOfferingId = faker.string.uuid();
      const mockFromPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({ interval: 'month' })
      });
      const mockPricingForCurrency = PricingForCurrencyFactory({ price: mockFromPrice })
      const mockSubscription = StripeSubscriptionFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'previewUpcomingForUpgrade')
        .mockResolvedValue(mockInvoicePreview);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.UPGRADE,
        fromOfferingConfigId: mockFromOfferingId,
        fromPrice: mockFromPrice,
      });
      jest
        .spyOn(subscriptionManager, 'retrieveForCustomerAndPrice')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(priceManager, 'retrievePricingForCurrency').mockResolvedValue(mockPricingForCurrency);

      const result = await cartService.getCart(mockCart.id);
      expect(result).toEqual({
        ...mockCart,
        upcomingInvoicePreview: mockInvoicePreview,
        paymentInfo: {
          type: mockPaymentMethod.type,
          last4: mockPaymentMethod.card?.last4,
          brand: mockPaymentMethod.card?.brand,
          customerSessionClientSecret: mockCustomerSession.client_secret,
        },
        metricsOptedOut: false,
        fromOfferingConfigId: mockFromOfferingId,
        fromPrice: {
          currency: mockCart.currency,
          interval: 'monthly',
          unitAmount: mockFromPrice.unit_amount,
        },
        hasActiveSubscriptions: true,
      });

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalledWith(mockCart.offeringConfigId, mockCart.interval);
      expect(customerManager.retrieve).toHaveBeenCalledWith(
        mockCart.stripeCustomerId
      );
      expect(invoiceManager.previewUpcomingForUpgrade).toHaveBeenCalledWith({
        priceId: mockPrice.id,
        customer: mockCustomer,
        fromSubscriptionItem: mockSubscription.items.data[0],
      });
    });

    it("has metricsOptedOut set to true if the cart's account has opted out of metrics", async () => {
      const mockUid = faker.string.hexadecimal({
        length: 32,
        prefix: '',
        casing: 'lower',
      });
      const mockAccount = AccountFactory({
        uid: Buffer.from(mockUid, 'hex'),
        metricsOptOutAt: faker.date.recent().valueOf(),
      });
      const mockCart = ResultCartFactory({
        uid: mockUid,
        stripeSubscriptionId: null,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPrice = StripePriceFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockInvoicePreview);
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });

      const result = await cartService.getCart(mockCart.id);
      expect(accountManager.getAccounts).toHaveBeenCalledWith([mockUid]);
      expect(result.metricsOptedOut).toBeTruthy();
    });

    it("has metricsOptedOut set to false if the cart's account has not opted out of metrics", async () => {
      const mockUid = faker.string.hexadecimal({
        length: 32,
        prefix: '',
        casing: 'lower',
      });
      const mockAccount = AccountFactory({
        uid: Buffer.from(mockUid, 'hex'),
      });
      const mockCart = ResultCartFactory({
        uid: mockUid,
        stripeSubscriptionId: null,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPrice = StripePriceFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockInvoicePreview);
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });

      const result = await cartService.getCart(mockCart.id);
      expect(accountManager.getAccounts).toHaveBeenCalledWith([mockUid]);
      expect(result.metricsOptedOut).toBeFalsy();
    });

    it('has metricsOptedOut set to false if the cart has no associated account', async () => {
      const mockCart = ResultCartFactory({
        stripeSubscriptionId: null,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPrice = StripePriceFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockInvoicePreview);
      jest.spyOn(accountManager, 'getAccounts').mockResolvedValue([]);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });

      const result = await cartService.getCart(mockCart.id);
      expect(accountManager.getAccounts).not.toHaveBeenCalled();
      expect(result.metricsOptedOut).toBeFalsy();
    });
  });

  describe('metricsOptedOut', () => {
    it('returns true if account has opted out of metrics', async () => {
      const mockUid = faker.string.hexadecimal({
        length: 32,
        prefix: '',
        casing: 'lower',
      });
      const mockAccount = AccountFactory({
        uid: Buffer.from(mockUid, 'hex'),
        metricsOptOutAt: faker.date.recent().valueOf(),
      });

      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);

      const result = await cartService.metricsOptedOut(mockUid);
      expect(accountManager.getAccounts).toHaveBeenCalledWith([mockUid]);
      expect(result).toBeTruthy();
    });
    it('returns false if account has not opted out of metrics', async () => {
      const mockUid = faker.string.hexadecimal({
        length: 32,
        prefix: '',
        casing: 'lower',
      });
      const mockAccount = AccountFactory({
        uid: Buffer.from(mockUid, 'hex'),
      });

      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);

      const result = await cartService.metricsOptedOut(mockUid);
      expect(accountManager.getAccounts).toHaveBeenCalledWith([mockUid]);
      expect(result).toBeFalsy();
    });
  });

  describe('getNeedsInput', () => {
    it('returns StripeHandleNextActionResponse for requires_action payment intents', async () => {
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockCart = ResultCartFactory({
        state: CartState.NEEDS_INPUT,
        stripeSubscriptionId: mockSubscription.id,
      });
      const mockPaymentIntent = StripeResponseFactory(
        StripePaymentIntentFactory({ status: 'requires_action' })
      );

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(mockPaymentIntent);

      const result = await cartService.getNeedsInput(mockCart.id);
      expect(result).toEqual({
        inputType: NeedsInputType.StripeHandleNextAction,
        data: { clientSecret: mockPaymentIntent.client_secret },
      });
    });
    it('returns NoInputNeededResponse for non requires_action payment intents', async () => {
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockCart = ResultCartFactory({
        state: CartState.NEEDS_INPUT,
        stripeSubscriptionId: mockSubscription.id,
      });
      const mockPaymentIntent = StripeResponseFactory(
        StripePaymentIntentFactory({ status: 'processing' })
      );

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(mockPaymentIntent);
      jest.spyOn(cartManager, 'setProcessingCart').mockResolvedValue();

      const result = await cartService.getNeedsInput(mockCart.id);
      expect(result).toEqual({
        inputType: NeedsInputType.NotRequired,
      });
    });
    it('throws an error if the cart is not in the NEEDS_INPUT state', async () => {
      const mockCart = ResultCartFactory({ state: CartState.SUCCESS });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockPaymentIntent = StripeResponseFactory(
        StripePaymentIntentFactory({ status: 'processing' })
      );

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'processStripeSubscription')
        .mockResolvedValue(mockPaymentIntent);

      await expect(() =>
        cartService.getNeedsInput(mockCart.id)
      ).rejects.toThrowError(CartInvalidStateForActionError);
    });
  });

  describe('submitNeedsInput', () => {
    it('changes the cart state and calls postPaySteps', async () => {
      const mockCart = ResultCartFactory({
        state: CartState.NEEDS_INPUT,
        uid: faker.string.hexadecimal({
          length: 32,
          prefix: '',
          casing: 'lower',
        }),
      });
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockPaymentIntent = StripeResponseFactory(
        StripePaymentIntentFactory({
          status: 'succeeded',
          payment_method: mockPaymentMethod.id,
        })
      );
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(paymentIntentManager, 'retrieve')
        .mockResolvedValue(mockPaymentIntent);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(mockPaymentIntent);
      jest.spyOn(checkoutService, 'postPaySteps').mockResolvedValue();
      jest.spyOn(cartService, 'finalizeCartWithError').mockResolvedValue();
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
      jest.mocked(redirect).mockImplementation();

      await cartService.submitNeedsInput(mockCart.id);

      expect(customerManager.update).toHaveBeenCalledWith(mockCustomer.id, {
        invoice_settings: {
          default_payment_method: mockPaymentMethod.id,
        },
      });
      expect(checkoutService.postPaySteps).toHaveBeenCalledWith({
        cart: mockCart,
        version: mockCart.version,
        subscription: mockSubscription,
        uid: mockCart.uid,
        paymentProvider: 'stripe',
      });
      expect(cartManager.finishErrorCart).not.toHaveBeenCalled();
    });

    it('throws an error if the cart is not in the NEEDS_INPUT state', async () => {
      const mockCart = ResultCartFactory({
        state: CartState.SUCCESS,
        uid: faker.string.hexadecimal({
          length: 32,
          prefix: '',
          casing: 'lower',
        }),
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          latest_invoice: undefined,
        })
      );

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest.spyOn(cartService, 'finalizeCartWithError').mockResolvedValue();
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getLatestPaymentIntent')
        .mockResolvedValue(undefined);

      await expect(() =>
        cartService.submitNeedsInput(mockCart.id)
      ).rejects.toThrowError(CartInvalidStateForActionError);
      expect(cartManager.finishErrorCart).toHaveBeenCalled();
    });
  });
});
