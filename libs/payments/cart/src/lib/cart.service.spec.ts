/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import {
  EligibilityService,
  EligibilityStatus,
} from '@fxa/payments/eligibility';
import {
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
} from '@fxa/shared/db/mysql/account';
import {
  GeoDBManager,
  GeoDBManagerConfig,
  GeoDBManagerConfigFactory,
  GeoDBProvider,
  TaxAddressFactory,
} from '@fxa/shared/geodb';
import {
  AccountCustomerManager,
  ResultAccountCustomerFactory,
} from '@fxa/payments/stripe';
import { CheckoutService } from './checkout.service';

import {
  FinishErrorCartFactory,
  ResultCartFactory,
  UpdateCartFactory,
} from './cart.factories';
import { CartManager } from './cart.manager';
import { CartService } from './cart.service';

describe('#payments-cart - service', () => {
  let cartService: CartService;
  let cartManager: CartManager;
  let checkoutService: CheckoutService;
  let accountCustomerManager: AccountCustomerManager;
  let eligibilityService: EligibilityService;
  let geodbManager: GeoDBManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CartService,
        CartManager,
        AccountCustomerManager,
        EligibilityService,
        CheckoutService,
        GeoDBManager,
        GeoDBManagerConfig,
        { provide: GeoDBProvider, useValue: {} },
      ],
    })
      .overrideProvider(CartManager)
      .useValue({
        checkActionForValidCartState: jest.fn(),
        createCart: jest.fn(),
        fetchCartById: jest.fn(),
        updateFreshCart: jest.fn(),
        finishCart: jest.fn(),
        finishErrorCart: jest.fn(),
        deleteCart: jest.fn(),
      })
      .overrideProvider(AccountCustomerManager)
      .useValue({
        getAccountCustomerByUid: jest.fn(),
      })
      .overrideProvider(CheckoutService)
      .useValue({
        payWithStripe: jest.fn(),
        payWithPaypal: jest.fn(),
      })
      .overrideProvider(EligibilityService)
      .useValue({
        checkEligibility: jest.fn(),
      })
      .overrideProvider(GeoDBManager)
      .useValue({
        getTaxAddress: jest.fn(),
      })
      .overrideProvider(GeoDBManagerConfig)
      .useValue(GeoDBManagerConfigFactory())
      .compile();

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
      const args = {
        interval: faker.string.uuid(),
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

      await cartService.setupCart(args);

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
    it('calls checkoutService.payWithStripe', async () => {
      const mockCart = ResultCartFactory();
      const mockPaymentMethodId = faker.string.uuid();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);

      await cartService.checkoutCartWithStripe(
        mockCart.id,
        mockCart.version,
        mockPaymentMethodId
      );

      expect(checkoutService.payWithStripe).toHaveBeenCalledWith(
        mockCart,
        mockPaymentMethodId
      );
    });

    it('calls cartManager.finishCart', async () => {
      const mockCart = ResultCartFactory();
      const mockPaymentMethodId = faker.string.uuid();

      await cartService.checkoutCartWithStripe(
        mockCart.id,
        mockCart.version,
        mockPaymentMethodId
      );

      expect(cartManager.finishCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        {}
      );
    });

    it('calls cartManager.finishErrorCart when error occurs during checkout', async () => {
      const mockCart = ResultCartFactory();
      const mockPaymentMethodId = faker.string.uuid();

      jest.spyOn(cartManager, 'finishCart').mockRejectedValue(undefined);

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
    it('calls checkoutService.payWithPaypal', async () => {
      const mockCart = ResultCartFactory();
      const mockToken = faker.string.uuid();

      jest.spyOn(cartManager, 'fetchCartById').mockResolvedValue(mockCart);

      await cartService.checkoutCartWithPaypal(
        mockCart.id,
        mockCart.version,
        mockToken
      );

      expect(checkoutService.payWithPaypal).toHaveBeenCalledWith(
        mockCart,
        mockToken
      );
    });

    it('calls cartManager.finishCart', async () => {
      const mockCart = ResultCartFactory();
      const mockToken = faker.string.uuid();

      await cartService.checkoutCartWithPaypal(
        mockCart.id,
        mockCart.version,
        mockToken
      );

      expect(cartManager.finishCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        {}
      );
    });

    it('calls cartManager.finishErrorCart when error occurs during checkout', async () => {
      const mockCart = ResultCartFactory();
      const mockToken = faker.string.uuid();

      jest.spyOn(cartManager, 'finishCart').mockRejectedValue(undefined);

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

      try {
        await cartService.finalizeCartWithError(
          mockCart.id,
          mockCart.version,
          mockErrorCart.errorReasonId
        );
      } catch (error) {
        expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should throw error if fetchCart fails and finishErrorCart failed', async () => {
      const mockCart = ResultCartFactory();
      const mockErrorCart = FinishErrorCartFactory();

      jest.spyOn(cartManager, 'finishErrorCart').mockRejectedValue(undefined);
      jest.spyOn(cartManager, 'fetchCartById').mockRejectedValue(new Error());

      try {
        await cartService.finalizeCartWithError(
          mockCart.id,
          mockCart.version,
          mockErrorCart.errorReasonId
        );
      } catch (error) {
        expect(cartManager.fetchCartById).toHaveBeenCalledWith(mockCart.id);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('updateCart', () => {
    it('calls cartManager.updateFreshCart', async () => {
      const mockCart = ResultCartFactory();
      const mockUpdateCart = UpdateCartFactory();

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
