/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { v4 as uuidv4 } from 'uuid';

import {
  CartFactory,
  CartState,
  testAccountDatabaseSetup,
  AccountDatabase,
  CartUpdate,
  CartErrorReasonId,
} from '@fxa/shared/db/mysql/account';

import {
  CartInvalidStateForActionError,
  CartNotCreatedError,
  CartNotDeletedError,
  CartNotFoundError,
  CartVersionMismatchError,
} from './cart.error';
import {
  FinishCartFactory,
  FinishErrorCartFactory,
  SetupCartFactory,
  UpdateCartFactory,
} from './cart.factories';
import { CartManager } from './cart.manager';
import { ResultCart } from './cart.types';

// Fail action, which sometimes isn't here due to a weird issue defined here:
// https://github.com/jestjs/jest/issues/11698#issuecomment-922351139
function fail(reason = 'fail was called in a test.') {
  throw new Error(reason);
}

const CART_ID = '8730e0d5939c450286e6e6cc1bbeeab2';
const RANDOM_ID = uuidv4({}, Buffer.alloc(16)).toString('hex');
const RANDOM_VERSION = 1234;

async function directUpdate(
  db: AccountDatabase,
  cart: Omit<CartUpdate, 'id'> & { id?: Buffer },
  id: string
) {
  await db
    .updateTable('carts')
    .set(cart)
    .where('id', '=', Buffer.from(id, 'hex'))
    .execute();
}

describe('CartManager', () => {
  let db: AccountDatabase;
  let cartManager: CartManager;
  let testCart: ResultCart;

  beforeAll(async () => {
    db = await testAccountDatabaseSetup(['accounts', 'carts']);
    cartManager = new CartManager(db);
    await db
      .insertInto('carts')
      .values({
        ...CartFactory(),
        id: Buffer.from(CART_ID, 'hex'),
      })
      .execute();
  });

  afterAll(async () => {
    await db.destroy();
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

  describe('createErrorCart', () => {
    it('succeeds', async () => {
      const setupCart = SetupCartFactory({
        interval: 'annually',
      });
      const cart = await cartManager.createErrorCart(
        setupCart,
        CartErrorReasonId.CartEligibilityStatusSame
      );
      expect(cart).toEqual(expect.objectContaining(setupCart));
    });

    it('fails - with unexpected error', async () => {
      const setupCart = SetupCartFactory({
        interval: 'annually',
        uid: 0 as unknown as string,
      });
      try {
        await cartManager.createErrorCart(
          setupCart,
          CartErrorReasonId.CartEligibilityStatusInvalid
        );
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

  describe('fetchAndValidateCartVersion', () => {
    it('succeeds', async () => {
      const cart = await cartManager.fetchAndValidateCartVersion(CART_ID, 0);
      expect(cart.id).toEqual(CART_ID);
    });

    it('errors - NotFound', async () => {
      try {
        await cartManager.fetchAndValidateCartVersion(RANDOM_ID, 1);
        fail('Error in fetchCartById');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotFoundError);
      }
    });

    it('errors - with cart version mismatch', async () => {
      try {
        await cartManager.fetchAndValidateCartVersion(CART_ID, 99);
        fail('Error in fetchCartById');
      } catch (error) {
        expect(error).toBeInstanceOf(CartVersionMismatchError);
      }
    });
  });

  describe('updateFreshCart', () => {
    it('succeeds', async () => {
      const updateItems = UpdateCartFactory({
        couponCode: 'testcoupon',
      });

      await cartManager.updateFreshCart(
        testCart.id,
        testCart.version,
        updateItems
      );
      const cart = await cartManager.fetchCartById(testCart.id);

      expect(cart).toEqual(expect.objectContaining(updateItems));
    });

    it('fails - invalid state', async () => {
      await directUpdate(db, { state: CartState.FAIL }, testCart.id);
      testCart = await cartManager.fetchCartById(testCart.id);
      try {
        await cartManager.updateFreshCart(
          testCart.id,
          testCart.version,
          UpdateCartFactory()
        );
        fail('Error in updateFreshCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });

    it('fails - cart could not be updated', async () => {
      await directUpdate(
        db,
        { state: CartState.FAIL, version: RANDOM_VERSION },
        testCart.id
      );
      try {
        await cartManager.updateFreshCart(
          testCart.id,
          testCart.version,
          UpdateCartFactory()
        );
        fail('Error in updateFreshCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartVersionMismatchError);
      }
    });
  });

  describe('finishCart', () => {
    it('succeeds', async () => {
      const items = FinishCartFactory();
      await directUpdate(db, { state: CartState.PROCESSING }, testCart.id);
      testCart = await cartManager.fetchCartById(testCart.id);

      await cartManager.finishCart(testCart.id, testCart.version, items);
      const cart = await cartManager.fetchCartById(testCart.id);

      expect(cart).toEqual(expect.objectContaining(items));
      expect(cart.state).toEqual(CartState.SUCCESS);
    });

    it('fails - invalid state', async () => {
      try {
        await cartManager.finishCart(
          testCart.id,
          testCart.version,
          FinishCartFactory()
        );
        fail('Error in finishCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });
  });

  describe('setNeedsInputcart', () => {
    it('succeeds', async () => {
      await directUpdate(db, { state: CartState.PROCESSING }, testCart.id);
      testCart = await cartManager.fetchCartById(testCart.id);

      await cartManager.setNeedsInputCart(testCart.id);
      const cart = await cartManager.fetchCartById(testCart.id);

      expect(cart.state).toEqual(CartState.NEEDS_INPUT);
    });

    it('fails - invalid state', async () => {
      try {
        await cartManager.setNeedsInputCart(testCart.id);
        fail('Error in finishCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });
  });

  describe('finishErrorCart', () => {
    it('succeeds', async () => {
      const items = FinishErrorCartFactory();

      await cartManager.finishErrorCart(testCart.id, items);
      const cart = await cartManager.fetchCartById(testCart.id);

      expect(cart).toEqual(expect.objectContaining(items));
      expect(cart.state).toEqual(CartState.FAIL);
    });

    it('fails - invalid state', async () => {
      await directUpdate(db, { state: CartState.FAIL }, testCart.id);
      testCart = await cartManager.fetchCartById(testCart.id);
      try {
        await cartManager.finishErrorCart(
          testCart.id,
          FinishErrorCartFactory()
        );
        fail('Error in finishErrorCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });
  });

  describe('deleteCart', () => {
    it('succeeds', async () => {
      const result = await cartManager.deleteCart(testCart);

      expect(result).toBeTruthy();
    });

    it('fails - invalid state', async () => {
      await directUpdate(db, { state: CartState.FAIL }, testCart.id);
      try {
        testCart = await cartManager.fetchCartById(testCart.id);
        await cartManager.deleteCart(testCart);
        fail('Error in deleteCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartInvalidStateForActionError);
      }
    });

    it('fails - cart could not be updated', async () => {
      await directUpdate(
        db,
        { state: CartState.START, version: RANDOM_VERSION },
        testCart.id
      );
      try {
        await cartManager.deleteCart(testCart);
        fail('Error in deleteCart');
      } catch (error) {
        expect(error).toBeInstanceOf(CartNotDeletedError);
      }
    });
  });
});
