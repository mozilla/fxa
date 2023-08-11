/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import {
  Cart,
  CartFactory,
  CartState,
} from '../../../../shared/db/mysql/account/src';
import { Logger } from '../../../../shared/log/src';
import {
  FinishCartFactory,
  FinishErrorCartFactory,
  SetupCartFactory,
  UpdateCartFactory,
} from './cart.factories';
import { CartManager } from './cart.manager';
import { testCartDatabaseSetup } from './tests';
import {
  CartInvalidStateForActionError,
  CartNotDeletedError,
  CartNotFoundError,
  CartNotUpdatedError,
  CartNotRestartedError,
  CartNotCreatedError,
} from './cart.error';

const CART_ID = '8730e0d5939c450286e6e6cc1bbeeab2';
const RANDOM_ID = uuidv4({}, Buffer.alloc(16)).toString('hex');
const RANDOM_VERSION = 1234;

describe('#payments-cart - manager', () => {
  let knex: Knex;
  let cartManager: CartManager;
  let testCart: Cart;
  const mockLogger: Logger = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
  };

  beforeAll(async () => {
    cartManager = new CartManager(mockLogger);
    knex = await testCartDatabaseSetup();
    await Cart.query().insert({
      ...CartFactory(),
      id: CART_ID,
    });
  });

  afterAll(async () => {
    await knex.destroy();
  });

  beforeEach(async () => {
    testCart = await cartManager.createCart(SetupCartFactory());
  });

  describe('createCart', () => {
    it('succeeds', async () => {
      const setupCart = SetupCartFactory({
        interval: 'annually',
      });
      const cart = await cartManager.createCart(setupCart);
      expect(cart).toEqual(expect.objectContaining(setupCart));
    });

    it('fails - with unexpected error', async () => {
      const setupCart = SetupCartFactory({
        interval: 'annually',
        uid: 0 as unknown as string,
      });
      try {
        await cartManager.createCart(setupCart);
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotCreatedError);
        expect(error.jse_cause).not.toBeUndefined();
      }
    });
  });

  describe('fetchCartById', () => {
    it('succeeds', async () => {
      const cart = await cartManager.fetchCartById(CART_ID);
      expect(cart.id).toEqual(CART_ID);
    });

    it('errors - NotFound', async () => {
      try {
        await cartManager.fetchCartById(RANDOM_ID);
        fail('Error in fetchCartById');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotFoundError);
      }
    });

    it('errors - with unexpected error', async () => {
      try {
        await cartManager.fetchCartById(0 as unknown as string);
        fail('Error in fetchCartById');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotFoundError);
        expect(error.jse_cause).not.toBeUndefined();
      }
    });
  });

  describe('updateFreshCart', () => {
    it('succeeds', async () => {
      const updateItems = UpdateCartFactory({
        couponCode: 'testcoupon',
        email: 'test@example.com',
      });

      const cart = await cartManager.updateFreshCart(testCart, updateItems);

      expect(cart).toEqual(expect.objectContaining(updateItems));
    });

    it('fails - invalid state', async () => {
      testCart.setCart({
        state: CartState.FAIL,
      });
      try {
        await cartManager.updateFreshCart(testCart, UpdateCartFactory());
        fail('Error in updateFreshCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });

    it('fails - cart could not be updated', async () => {
      testCart.setCart({
        state: CartState.START,
        version: RANDOM_VERSION,
      });
      try {
        await cartManager.updateFreshCart(testCart, UpdateCartFactory());
        fail('Error in updateFreshCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotUpdatedError);
      }
    });

    it('fails - with unexpected error', async () => {
      testCart.setCart({
        id: 0 as unknown as string,
      });
      try {
        await cartManager.updateFreshCart(testCart, UpdateCartFactory());
        fail('Error in updateFreshCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotUpdatedError);
        expect(error.jse_cause).not.toBeUndefined();
      }
    });
  });

  describe('finishCart', () => {
    it('succeeds', async () => {
      const items = FinishCartFactory();
      testCart.setCart({
        state: CartState.PROCESSING,
      });

      const cart = await cartManager.finishCart(testCart, items);

      expect(cart).toEqual(expect.objectContaining(items));
      expect(cart.state).toEqual(CartState.SUCCESS);
    });

    it('fails - invalid state', async () => {
      try {
        await cartManager.finishCart(testCart, FinishCartFactory());
        fail('Error in finishCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });

    it('fails - cart could not be updated', async () => {
      testCart.setCart({
        state: CartState.PROCESSING,
        version: RANDOM_VERSION,
      });
      try {
        await cartManager.finishCart(testCart, FinishCartFactory());
        fail('Error in finishCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotUpdatedError);
      }
    });

    it('fails - with unexpected error', async () => {
      testCart.setCart({
        id: 0 as unknown as string,
        state: CartState.PROCESSING,
      });
      try {
        await cartManager.finishCart(testCart, FinishCartFactory());
        fail('Error in finishCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotUpdatedError);
        expect(error.jse_cause).not.toBeUndefined();
      }
    });
  });

  describe('finishErrorCart', () => {
    it('succeeds', async () => {
      const items = FinishErrorCartFactory();

      const cart = await cartManager.finishErrorCart(testCart, items);

      expect(cart).toEqual(expect.objectContaining(items));
      expect(cart.state).toEqual(CartState.FAIL);
    });

    it('fails - invalid state', async () => {
      testCart.setCart({
        state: CartState.FAIL,
      });
      try {
        await cartManager.finishErrorCart(testCart, FinishErrorCartFactory());
        fail('Error in finishErrorCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });

    it('fails - cart could not be updated', async () => {
      testCart.setCart({
        state: CartState.START,
        version: RANDOM_VERSION,
      });
      try {
        await cartManager.finishErrorCart(testCart, FinishErrorCartFactory());
        fail('Error in finishErrorCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotUpdatedError);
        expect(error.jse_cause).toBeUndefined();
      }
    });

    it('fails - with unexpected error', async () => {
      testCart.setCart({
        id: 0 as unknown as string,
      });
      try {
        await cartManager.finishErrorCart(testCart, FinishErrorCartFactory());
        fail('Error in finishErrorCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotUpdatedError);
        expect(error.jse_cause).not.toBeUndefined();
      }
    });
  });

  describe('deleteCart', () => {
    it('succeeds', async () => {
      const result = await cartManager.deleteCart(testCart);

      expect(result).toEqual(1);
    });

    it('fails - invalid state', async () => {
      testCart.setCart({
        state: CartState.FAIL,
      });
      try {
        await cartManager.deleteCart(testCart);
        fail('Error in deleteCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });

    it('fails - cart could not be updated', async () => {
      testCart.setCart({
        state: CartState.START,
        version: RANDOM_VERSION,
      });
      try {
        await cartManager.deleteCart(testCart);
        fail('Error in deleteCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotDeletedError);
      }
    });

    it('fails - with unexpected error', async () => {
      testCart.setCart({
        id: 0 as unknown as string,
      });
      try {
        await cartManager.deleteCart(testCart);
        fail('Error in deleteCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotDeletedError);
        expect(error.jse_cause).not.toBeUndefined();
      }
    });
  });

  describe('restartCart', () => {
    it('succeeds', async () => {
      const cart = await cartManager.restartCart(testCart);

      expect(cart).toEqual(
        expect.objectContaining({
          state: CartState.START,
          offeringConfigId: testCart.offeringConfigId,
          interval: testCart.interval,
          amount: testCart.amount,
        })
      );
      expect(cart.id).not.toEqual(testCart.id);
      expect(cart.createdAt).not.toEqual(testCart.createdAt);
      expect(cart.updatedAt).not.toEqual(testCart.updatedAt);
    });

    it('fails - invalid state', async () => {
      testCart.setCart({
        state: CartState.SUCCESS,
      });
      try {
        await cartManager.restartCart(testCart);
        fail('Error in restartCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });

    it('fails - with unexpected error', async () => {
      testCart.setCart({
        amount: 'fakeamount' as unknown as number,
      });
      try {
        await cartManager.restartCart(testCart);
        fail('Error in restartCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotRestartedError);
        expect(error.jse_cause).not.toBeUndefined();
      }
    });
  });
});
