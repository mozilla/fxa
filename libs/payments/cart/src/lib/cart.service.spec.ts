/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { CartManager } from './cart.manager';
import { CartService } from './cart.service';
import { faker } from '@faker-js/faker';
import { ResultCartFactory, UpdateCartFactory } from './cart.factories';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import { AccountCustomerManager } from '@fxa/payments/stripe';
import {
  GeoDBManager,
  GeoDBManagerConfig,
  GeoDBManagerConfigFactory,
  GeoDBProvider,
  TaxAddressFactory,
} from '@fxa/shared/geodb';

describe('#payments-cart - service', () => {
  let cartService: CartService;
  let cartManager: CartManager;
  let accountCustomerManager: AccountCustomerManager;
  let geodbManager: GeoDBManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CartService,
        CartManager,
        AccountCustomerManager,
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
        getStripeCustomerIdByUid: jest.fn(),
      })
      .overrideProvider(GeoDBManager)
      .useValue({
        getTaxAddress: jest.fn(),
      })
      .overrideProvider(GeoDBManagerConfig)
      .useValue(GeoDBManagerConfigFactory())
      .compile();

    cartService = moduleRef.get(CartService);
    cartManager = moduleRef.get(CartManager);
    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    geodbManager = moduleRef.get(GeoDBManager);
  });

  describe('setupCart', () => {
    it('calls createCart with expected parameters', async () => {
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
        .spyOn(accountCustomerManager, 'getStripeCustomerIdByUid')
        .mockResolvedValue('cus_id');
      jest.spyOn(geodbManager, 'getTaxAddress').mockReturnValue(taxAddress);

      await cartService.setupCart(args);

      expect(cartManager.createCart).toHaveBeenCalledWith({
        interval: args.interval,
        offeringConfigId: args.offeringConfigId,
        amount: 0,
        uid: args.uid,
        stripeCustomerId: 'cus_id',
        experiment: args.experiment,
        taxAddress,
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
      });
      expect(result).toEqual(mockNewCart);
    });
  });

  describe('checkoutCart', () => {
    it('calls cartManager.finishCart', async () => {
      const mockCart = ResultCartFactory();

      await cartService.checkoutCart(mockCart.id, mockCart.version);

      expect(cartManager.finishCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        {}
      );
    });

    it('calls cartManager.finishErrorCart when error occurs during checkout', async () => {
      const mockCart = ResultCartFactory();

      jest.spyOn(cartManager, 'finishCart').mockRejectedValue(undefined);

      await cartService.checkoutCart(mockCart.id, mockCart.version);

      expect(cartManager.finishErrorCart).toHaveBeenCalledWith(
        mockCart.id,
        mockCart.version,
        {
          errorReasonId: CartErrorReasonId.Unknown,
        }
      );
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
