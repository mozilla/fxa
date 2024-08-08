/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
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
  AccountCustomerManager,
  CustomerManager,
  InvoiceManager,
  InvoicePreviewFactory,
  MockStripeConfigProvider,
  ResultAccountCustomerFactory,
  PriceManager,
  ProductManager,
  PromotionCodeManager,
  StripeClient,
  StripeCustomerFactory,
  StripePriceFactory,
  StripeResponseFactory,
  SubplatInterval,
  SubscriptionManager,
  TaxAddressFactory,
} from '@fxa/payments/stripe';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import {
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
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { AccountManager } from '@fxa/shared/account/account';
import {
  CheckoutCustomerDataFactory,
  FinishErrorCartFactory,
  ResultCartFactory,
  UpdateCartFactory,
} from './cart.factories';
import { CartManager } from './cart.manager';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';

describe('CartService', () => {
  let accountCustomerManager: AccountCustomerManager;
  let cartService: CartService;
  let cartManager: CartManager;
  let checkoutService: CheckoutService;
  let customerManager: CustomerManager;
  let eligibilityService: EligibilityService;
  let geodbManager: GeoDBManager;
  let invoiceManager: InvoiceManager;
  let productConfigurationManager: ProductConfigurationManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountCustomerManager,
        AccountManager,
        CartManager,
        CartService,
        CheckoutService,
        ConfigService,
        CustomerManager,
        EligibilityManager,
        EligibilityService,
        GeoDBManager,
        GeoDBManagerConfig,
        InvoiceManager,
        MockAccountDatabaseNestFactory,
        MockFirestoreProvider,
        MockGeoDBNestFactory,
        MockPaypalClientConfigProvider,
        MockStatsDProvider,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalCustomerManager,
        PriceManager,
        ProductConfigurationManager,
        ProductManager,
        PromotionCodeManager,
        StrapiClient,
        StripeClient,
        SubscriptionManager,
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    cartManager = moduleRef.get(CartManager);
    cartService = moduleRef.get(CartService);
    checkoutService = moduleRef.get(CheckoutService);
    customerManager = moduleRef.get(CustomerManager);
    eligibilityService = moduleRef.get(EligibilityService);
    geodbManager = moduleRef.get(GeoDBManager);
    invoiceManager = moduleRef.get(InvoiceManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
  });

  describe('setupCart', () => {
    it('calls createCart with expected parameters', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });
      const mockResultCart = ResultCartFactory();
      const args = {
        interval: SubplatInterval.Monthly,
        offeringConfigId: faker.string.uuid(),
        experiment: faker.string.uuid(),
        promoCode: faker.word.noun(),
        uid: faker.string.uuid(),
        ip: faker.internet.ipv4(),
      };
      const taxAddress = TaxAddressFactory();
      const mockPrice = StripePriceFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest
        .spyOn(eligibilityService, 'checkEligibility')
        .mockResolvedValue(EligibilityStatus.CREATE);
      jest.spyOn(geodbManager, 'getTaxAddress').mockReturnValue(taxAddress);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePriceId')
        .mockResolvedValue(mockPrice.id);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(mockInvoicePreview);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockResultCart);

      const result = await cartService.setupCart(args);

      expect(cartManager.createCart).toHaveBeenCalledWith({
        interval: args.interval,
        offeringConfigId: args.offeringConfigId,
        amount: mockInvoicePreview.subtotal,
        uid: args.uid,
        stripeCustomerId: mockAccountCustomer.stripeCustomerId,
        experiment: args.experiment,
        taxAddress,
        eligibilityStatus: CartEligibilityStatus.CREATE,
      });
      expect(result).toEqual(mockResultCart);
    });
  });

  describe('restartCart', () => {
    it('fetches old cart and creates new cart with same details', async () => {
      const mockOldCart = ResultCartFactory();
      const mockNewCart = ResultCartFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockOldCart);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockNewCart);

      const result = await cartService.restartCart(mockOldCart.id);

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockOldCart.id);
      expect(cartManager.createCart).toHaveBeenCalledWith({
        uid: mockOldCart.uid,
        interval: mockOldCart.interval,
        offeringConfigId: mockOldCart.offeringConfigId,
        taxAddress: mockOldCart.taxAddress,
        stripeCustomerId: mockOldCart.stripeCustomerId,
        email: mockOldCart.email,
        amount: mockOldCart.amount,
        eligibilityStatus: mockOldCart.eligibilityStatus,
      });
      expect(result).toEqual(mockNewCart);
    });
  });

  describe('checkoutCartWithStripe', () => {
    const mockCustomerData = CheckoutCustomerDataFactory();

    it('accepts payment with stripe', async () => {
      const mockCart = ResultCartFactory();
      const mockPaymentMethodId = faker.string.uuid();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest.spyOn(checkoutService, 'payWithStripe').mockResolvedValue();
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

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest.spyOn(checkoutService, 'payWithStripe').mockResolvedValue();
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

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest.spyOn(checkoutService, 'payWithPaypal').mockResolvedValue();
      jest.spyOn(cartManager, 'finishCart').mockResolvedValue();
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
      expect(cartManager.finishCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        {}
      );
      expect(cartManager.finishErrorCart).not.toHaveBeenCalled();
    });

    it('calls cartManager.finishErrorCart when error occurs during checkout', async () => {
      const mockCart = ResultCartFactory();
      const mockToken = faker.string.uuid();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest.spyOn(checkoutService, 'payWithPaypal').mockResolvedValue();
      jest.spyOn(cartManager, 'finishCart').mockRejectedValue(undefined);
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
  });

  describe('getCart', () => {
    it('returns cart and invoicePreview', async () => {
      const mockCart = ResultCartFactory();
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPrice = StripePriceFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePriceId')
        .mockResolvedValue(mockPrice.id);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(mockInvoicePreview);

      const result = await cartService.getCart(mockCart.id);
      expect(result).toEqual({
        ...mockCart,
        invoicePreview: mockInvoicePreview,
      });

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(
        productConfigurationManager.retrieveStripePriceId
      ).toHaveBeenCalledWith(mockCart.offeringConfigId, mockCart.interval);
      expect(customerManager.retrieve).toHaveBeenCalledWith(
        mockCart.stripeCustomerId
      );
      expect(invoiceManager.preview).toHaveBeenCalledWith({
        priceId: mockPrice.id,
        customer: mockCustomer,
        taxAddress: mockCart.taxAddress,
      });
    });

    it('returns cart and invoicePreview if customer is undefined', async () => {
      const mockCart = ResultCartFactory({
        stripeCustomerId: null,
      });
      const mockPrice = StripePriceFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePriceId')
        .mockResolvedValue(mockPrice.id);
      jest.spyOn(customerManager, 'retrieve');
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(mockInvoicePreview);

      const result = await cartService.getCart(mockCart.id);
      expect(result).toEqual({
        ...mockCart,
        invoicePreview: mockInvoicePreview,
      });

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(
        productConfigurationManager.retrieveStripePriceId
      ).toHaveBeenCalledWith(mockCart.offeringConfigId, mockCart.interval);
      expect(customerManager.retrieve).not.toHaveBeenCalled();
      expect(invoiceManager.preview).toHaveBeenCalledWith({
        priceId: mockPrice.id,
        customer: undefined,
        taxAddress: mockCart.taxAddress,
      });
    });
  });
});
