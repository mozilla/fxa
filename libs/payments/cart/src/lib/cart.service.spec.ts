/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import {
  EligibilityManager,
  EligibilityService,
  EligibilityStatus,
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
  InvoiceManager,
  InvoicePreviewFactory,
  PaymentIntentManager,
  PaymentMethodManager,
  PriceManager,
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
  StripePaymentIntentFactory,
  StripeSubscriptionFactory,
  StripePaymentMethodFactory,
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
  SuccessCartFactory,
  UpdateCartFactory,
} from './cart.factories';
import { CartManager } from './cart.manager';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import {
  CartInvalidCurrencyError,
  CartInvalidPromoCodeError,
  CartInvalidStateForActionError,
  CartStateProcessingError,
  CartSuccessMissingRequired,
} from './cart.error';
import { CurrencyManager } from '@fxa/payments/currency';
import { MockCurrencyConfigProvider } from 'libs/payments/currency/src/lib/currency.config';

describe('CartService', () => {
  let accountManager: AccountManager;
  let accountCustomerManager: AccountCustomerManager;
  let cartService: CartService;
  let cartManager: CartManager;
  let checkoutService: CheckoutService;
  let customerManager: CustomerManager;
  let currencyManager: CurrencyManager;
  let promotionCodeManager: PromotionCodeManager;
  let eligibilityService: EligibilityService;
  let geodbManager: GeoDBManager;
  let invoiceManager: InvoiceManager;
  let productConfigurationManager: ProductConfigurationManager;
  let subscriptionManager: SubscriptionManager;
  let paymentMethodManager: PaymentMethodManager;

  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
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
        EligibilityManager,
        EligibilityService,
        GeoDBManager,
        GeoDBManagerConfig,
        InvoiceManager,
        MockAccountDatabaseNestFactory,
        MockFirestoreProvider,
        MockGeoDBNestFactory,
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
    currencyManager = moduleRef.get(CurrencyManager);
    promotionCodeManager = moduleRef.get(PromotionCodeManager);
    eligibilityService = moduleRef.get(EligibilityService);
    geodbManager = moduleRef.get(GeoDBManager);
    invoiceManager = moduleRef.get(InvoiceManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
  });

  describe('setupCart', () => {
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
      ip: faker.internet.ipv4(),
    };

    const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
    const mockAccountCustomer = ResultAccountCustomerFactory({
      stripeCustomerId: mockCustomer.id,
    });
    const mockInvoicePreview = InvoicePreviewFactory();
    const mockResultCart = ResultCartFactory();
    const mockPrice = StripePriceFactory();
    const taxAddress = TaxAddressFactory();

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
      jest
        .spyOn(eligibilityService, 'checkEligibility')
        .mockResolvedValue(EligibilityStatus.CREATE);
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

      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockRejectedValue(undefined);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockResultCart);
      jest
        .spyOn(accountManager, 'getAccounts')
        .mockResolvedValue([mockAccount]);

      await expect(() => cartService.setupCart(args)).rejects.toThrowError(
        CartInvalidPromoCodeError
      );

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
        CartInvalidCurrencyError
      );

      expect(cartManager.createCart).not.toHaveBeenCalled();
    });
  });

  describe('restartCart', () => {
    const mockOldCart = ResultCartFactory({
      couponCode: faker.word.noun(),
    });
    const mockNewCart = ResultCartFactory();
    const mockPrice = StripePriceFactory();

    beforeEach(async () => {
      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockOldCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
    });

    it('fetches old cart and creates new cart with same details', async () => {
      jest
        .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
        .mockResolvedValue(undefined);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockNewCart);

      const result = await cartService.restartCart(mockOldCart.id);

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockOldCart.id);
      expect(cartManager.createCart).toHaveBeenCalledWith({
        uid: mockOldCart.uid,
        interval: mockOldCart.interval,
        offeringConfigId: mockOldCart.offeringConfigId,
        couponCode: mockOldCart.couponCode,
        taxAddress: mockOldCart.taxAddress,
        currency: mockOldCart.currency,
        stripeCustomerId: mockOldCart.stripeCustomerId,
        email: mockOldCart.email,
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

      expect(cartManager.createCart).not.toHaveBeenCalled();
    });
  });

  describe('checkoutCartWithStripe', () => {
    const mockCustomerData = CheckoutCustomerDataFactory();

    it('accepts payment with stripe', async () => {
      const mockCart = ResultCartFactory();
      const mockPaymentMethodId = faker.string.uuid();
      const mockPaymentIntent = StripePaymentIntentFactory({
        payment_method: mockPaymentMethodId,
        status: 'succeeded',
      });

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(checkoutService, 'payWithStripe')
        .mockResolvedValue(mockPaymentIntent.status);
      jest.spyOn(cartManager, 'finishCart').mockResolvedValue();
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
      expect(cartManager.finishCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        {}
      );
      expect(cartManager.finishErrorCart).not.toHaveBeenCalled();
    });

    it('calls cartManager.finishErrorCart when error occurs during checkout', async () => {
      const mockCart = ResultCartFactory();
      const mockPaymentMethodId = faker.string.uuid();
      const mockPaymentIntent = StripePaymentIntentFactory({
        payment_method: mockPaymentMethodId,
        status: 'succeeded',
      });

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(checkoutService, 'payWithStripe')
        .mockResolvedValue(mockPaymentIntent.status);
      jest.spyOn(cartManager, 'finishCart').mockRejectedValue(undefined);
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await cartService.checkoutCartWithStripe(
        mockCart.id,
        mockCart.version,
        mockPaymentMethodId,
        mockCustomerData
      );

      expect(cartManager.finishErrorCart).toHaveBeenCalledWith(mockCart.id, {
        errorReasonId: CartErrorReasonId.Unknown,
      });
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
        { ...mockCart, version: mockCart.version + 1 },
        mockCustomerData,
        mockToken
      );
      expect(cartManager.finishErrorCart).not.toHaveBeenCalled();
    });

    it('calls cartManager.finishErrorCart when error occurs during checkout', async () => {
      const mockCart = ResultCartFactory();
      const mockToken = faker.string.uuid();

      jest
        .spyOn(cartManager, 'fetchAndValidateCartVersion')
        .mockResolvedValue(mockCart);
      jest.spyOn(cartManager, 'setProcessingCart').mockResolvedValue();
      jest
        .spyOn(checkoutService, 'payWithPaypal')
        .mockRejectedValue(new Error('test'));
      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await cartService.checkoutCartWithPaypal(
        mockCart.id,
        mockCart.version,
        mockCustomerData,
        mockToken
      );

      expect(cartManager.finishErrorCart).toHaveBeenCalledWith(mockCart.id, {
        errorReasonId: CartErrorReasonId.Unknown,
      });
    });

    it('reject with CartStateProcessingError if cart could not be set to processing', async () => {
      const mockCart = ResultCartFactory();
      const mockToken = faker.string.uuid();

      jest
        .spyOn(cartManager, 'fetchAndValidateCartVersion')
        .mockRejectedValue(new Error('test'));
      jest
        .spyOn(checkoutService, 'payWithPaypal')
        .mockRejectedValue(new Error('test'));

      await expect(
        cartService.checkoutCartWithPaypal(
          mockCart.id,
          mockCart.version,
          mockCustomerData,
          mockToken
        )
      ).rejects.toBeInstanceOf(CartStateProcessingError);

      expect(checkoutService.payWithPaypal).not.toHaveBeenCalled();
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
    it('calls cartManager.updateFreshCart', async () => {
      const mockCart = ResultCartFactory();
      const mockUpdateCart = UpdateCartFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();

      await cartService.updateCart(
        mockCart.id,
        mockCart.version,
        mockUpdateCart
      );

      expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        mockUpdateCart
      );
    });

    describe('updates cart with coupon code', () => {
      const mockCart = ResultCartFactory();
      const mockPrice = StripePriceFactory();
      const mockUpdateCart = UpdateCartFactory({
        couponCode: faker.word.noun(),
        taxAddress: {
          postalCode: faker.location.zipCode(),
          countryCode: faker.location.countryCode(),
        },
      });

      beforeEach(async () => {
        jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
        jest
          .spyOn(productConfigurationManager, 'retrieveStripePrice')
          .mockResolvedValue(mockPrice);
        jest
          .spyOn(currencyManager, 'getCurrencyForCountry')
          .mockReturnValue(faker.finance.currencyCode());
        jest
          .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
          .mockResolvedValue(undefined);
        jest.spyOn(cartManager, 'updateFreshCart').mockResolvedValue();
      });

      it('success if coupon is valid', async () => {
        await cartService.updateCart(
          mockCart.id,
          mockCart.version,
          mockUpdateCart
        );

        expect(cartManager.updateFreshCart).toHaveBeenCalledWith(
          mockCart.id,
          mockCart.version,
          mockUpdateCart
        );
      });

      it('throws if coupon is not valid', async () => {
        jest
          .spyOn(promotionCodeManager, 'assertValidPromotionCodeNameForPrice')
          .mockImplementation(() => {
            throw new CouponErrorExpired();
          });

        await expect(
          cartService.updateCart(mockCart.id, mockCart.version, mockUpdateCart)
        ).rejects.toBeInstanceOf(CouponErrorExpired);

        expect(cartManager.updateFreshCart).not.toHaveBeenCalledWith();
      });

      it('throws if country to currency result is not valid', async () => {
        jest
          .spyOn(currencyManager, 'getCurrencyForCountry')
          .mockReturnValue(undefined);

        await expect(
          cartService.updateCart(mockCart.id, mockCart.version, mockUpdateCart)
        ).rejects.toBeInstanceOf(CartInvalidCurrencyError);

        expect(cartManager.updateFreshCart).not.toHaveBeenCalledWith();
      });
    });
  });

  describe('getCart', () => {
    it('returns cart and upcomingInvoicePreview', async () => {
      const mockCart = ResultCartFactory({ stripeSubscriptionId: null });
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

      const result = await cartService.getCart(mockCart.id);
      expect(result).toEqual({
        ...mockCart,
        upcomingInvoicePreview: mockInvoicePreview,
        metricsOptedOut: false,
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
        customer: mockCustomer,
        taxAddress: mockCart.taxAddress,
      });
    });

    it('returns cart and upcomingInvoicePreview and latestInvoicePreview', async () => {
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockCart = ResultCartFactory({
        stripeSubscriptionId: mockSubscription.id,
      });
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPrice = StripePriceFactory();
      const mockUpcomingInvoicePreview = InvoicePreviewFactory();
      const mockLatestInvoicePreview = InvoicePreviewFactory();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockUpcomingInvoicePreview);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
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
        },
      });
      expect(result.latestInvoicePreview).not.toEqual(
        result.upcomingInvoicePreview
      );

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalledWith(mockCart.offeringConfigId, mockCart.interval);
      expect(customerManager.retrieve).toHaveBeenCalledWith(
        mockCart.stripeCustomerId
      );
      expect(invoiceManager.previewUpcoming).toHaveBeenCalledWith({
        priceId: mockPrice.id,
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

      const result = await cartService.getCart(mockCart.id);
      expect(result).toEqual({
        ...mockCart,
        upcomingInvoicePreview: mockInvoicePreview,
        metricsOptedOut: false,
      });

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(
        productConfigurationManager.retrieveStripePrice
      ).toHaveBeenCalledWith(mockCart.offeringConfigId, mockCart.interval);
      expect(customerManager.retrieve).not.toHaveBeenCalled();
      expect(invoiceManager.previewUpcoming).toHaveBeenCalledWith({
        priceId: mockPrice.id,
        customer: undefined,
        taxAddress: mockCart.taxAddress,
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

      const result = await cartService.getCart(mockCart.id);
      expect(accountManager.getAccounts).toHaveBeenCalledWith([mockUid]);
      expect(result.metricsOptedOut).toBeFalsy();
    });

    it('has metricsOptedOut set to false if the cart has no associated account', async () => {
      const mockCart = ResultCartFactory({ stripeSubscriptionId: null });
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

      const result = await cartService.getCart(mockCart.id);
      expect(accountManager.getAccounts).not.toHaveBeenCalled();
      expect(result.metricsOptedOut).toBeFalsy();
    });
  });

  describe('getSuccessCart', () => {
    const mockSuccessCart = SuccessCartFactory();
    it('should return success cart', async () => {
      jest.spyOn(cartService, 'getCart').mockResolvedValue(mockSuccessCart);
      const result = await cartService.getSuccessCart(mockSuccessCart.id);
      expect(result).toEqual(mockSuccessCart);
    });

    it('should throw error if cart state is not success', async () => {
      jest
        .spyOn(cartService, 'getCart')
        .mockResolvedValue(SuccessCartFactory({ state: CartState.FAIL }));
      await expect(
        cartService.getSuccessCart(mockSuccessCart.id)
      ).rejects.toThrowError(CartInvalidStateForActionError);
    });

    it('should throw error if latestInvoicePreview is undefined', async () => {
      jest
        .spyOn(cartService, 'getCart')
        .mockResolvedValue(
          SuccessCartFactory({ latestInvoicePreview: undefined })
        );
      await expect(
        cartService.getSuccessCart(mockSuccessCart.id)
      ).rejects.toThrowError(CartSuccessMissingRequired);
    });

    it('should throw error if payment method type is undefined', async () => {
      jest
        .spyOn(cartService, 'getCart')
        .mockResolvedValue(SuccessCartFactory({ paymentInfo: undefined }));
      await expect(
        cartService.getSuccessCart(mockSuccessCart.id)
      ).rejects.toThrowError(CartSuccessMissingRequired);
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
});
