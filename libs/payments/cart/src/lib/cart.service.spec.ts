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
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
  MockAccountDatabaseNestFactory,
} from '@fxa/shared/db/mysql/account';
import {
  GeoDBManager,
  GeoDBManagerConfig,
  MockGeoDBNestFactory,
  TaxAddressFactory,
} from '@fxa/shared/geodb';
import {
  AccountCustomerManager,
  MockStripeConfigProvider,
  ResultAccountCustomerFactory,
  StripeClient,
  StripeManager,
  SubplatInterval,
} from '@fxa/payments/stripe';
import { CheckoutService } from './checkout.service';

import {
  FinishErrorCartFactory,
  ResultCartFactory,
  UpdateCartFactory,
} from './cart.factories';
import { CartManager } from './cart.manager';
import { CartService } from './cart.service';
import {
  ContentfulClient,
  ContentfulClientConfig,
  ContentfulManager,
} from '@fxa/shared/contentful';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { ConfigService } from '@nestjs/config';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import {
  PayPalClient,
  PayPalManager,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import { MockPaypalClientConfigProvider } from 'libs/payments/paypal/src/lib/paypal.client.config';

describe('CartService', () => {
  let cartService: CartService;
  let cartManager: CartManager;
  let checkoutService: CheckoutService;
  let accountCustomerManager: AccountCustomerManager;
  let eligibilityService: EligibilityService;
  let geodbManager: GeoDBManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockAccountDatabaseNestFactory,
        CartService,
        CartManager,
        AccountCustomerManager,
        ConfigService,
        MockFirestoreProvider,
        MockStatsDProvider,
        ContentfulClientConfig,
        ContentfulClient,
        ContentfulManager,
        EligibilityManager,
        EligibilityService,
        MockStripeConfigProvider,
        StripeClient,
        StripeManager,
        MockPaypalClientConfigProvider,
        PayPalClient,
        PayPalManager,
        PaypalCustomerManager,
        CheckoutService,
        GeoDBManager,
        GeoDBManagerConfig,
        MockGeoDBNestFactory,
      ],
    }).compile();

    cartService = moduleRef.get(CartService);
    checkoutService = moduleRef.get(CheckoutService);
    cartManager = moduleRef.get(CartManager);
    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    eligibilityService = moduleRef.get(EligibilityService);
    geodbManager = moduleRef.get(GeoDBManager);
  });

  describe('setupCart', () => {
    it('calls createCart with expected parameters', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory();
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
      jest
        .spyOn(eligibilityService, 'checkEligibility')
        .mockResolvedValue(EligibilityStatus.CREATE);
      jest.spyOn(geodbManager, 'getTaxAddress').mockReturnValue(taxAddress);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(cartManager, 'createCart').mockResolvedValue(mockResultCart);

      const result = await cartService.setupCart(args);

      expect(cartManager.createCart).toHaveBeenCalledWith({
        interval: args.interval,
        offeringConfigId: args.offeringConfigId,
        amount: 0,
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
        mockPaymentMethodId
      );

      expect(checkoutService.payWithStripe).toHaveBeenCalledWith(
        mockCart,
        mockPaymentMethodId
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
        mockPaymentMethodId
      );

      expect(cartManager.finishErrorCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        {
          errorReasonId: CartErrorReasonId.Unknown,
        }
      );
    });
  });

  describe('checkoutCartWithPaypal', () => {
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
        mockToken
      );

      expect(checkoutService.payWithPaypal).toHaveBeenCalledWith(
        mockCart,
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
        mockToken
      );

      expect(cartManager.finishErrorCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        {
          errorReasonId: CartErrorReasonId.Unknown,
        }
      );
    });
  });

  describe('finalizeCartWithError', () => {
    it('calls cartManager.finishErrorCart', async () => {
      const mockCart = ResultCartFactory();
      const mockErrorCart = FinishErrorCartFactory();

      jest.spyOn(cartManager, 'finishErrorCart').mockResolvedValue();

      await cartService.finalizeCartWithError(
        mockCart.id,
        mockCart.version,
        mockErrorCart.errorReasonId
      );

      expect(cartManager.finishErrorCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        { errorReasonId: mockErrorCart.errorReasonId }
      );
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
        mockCart.version,
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
          mockCart.version,
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
          mockCart.version,
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
    it('calls cartManager.fetchCartById', async () => {
      const mockCart = ResultCartFactory();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);

      const result = await cartService.getCart(mockCart.id);

      expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
      expect(result).toEqual(mockCart);
    });
  });
});
