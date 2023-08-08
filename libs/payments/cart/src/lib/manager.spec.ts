/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Knex } from 'knex';
import { NotFoundError } from 'objection';
import { v4 as uuidv4 } from 'uuid';
import { Cart, CartFactory } from '../../../../shared/db/mysql/account/src';
import { Logger } from '../../../../shared/log/src';
import { SetupCartFactory, UpdateCartFactory } from './factories';
import { CartManager, ERRORS } from './manager';
import { testCartDatabaseSetup } from './tests';
import { CartState } from '../../../../shared/db/mysql/account/src';
import { uuidTransformer } from '../../../../shared/db/mysql/core/src';

const CART_ID = '8730e0d5939c450286e6e6cc1bbeeab2';
const RANDOM_ID = uuidv4({}, Buffer.alloc(16)).toString('hex');

describe('#payments-cart - manager', () => {
  let knex: Knex;
  let cartManager: CartManager;
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

  describe('setupCart', () => {
    it('should successfully create a new cart', async () => {
      const setupCart = SetupCartFactory({
        interval: 'annually',
      });
      const cart = await cartManager.setupCart(setupCart);
      expect(cart).toEqual(expect.objectContaining(setupCart));
    });
  });

  describe('restartCart', () => {
    it('should successfully set cart state to "START"', async () => {
      await Cart.query()
        .update({ state: CartState.PROCESSING })
        .where('id', uuidTransformer.to(CART_ID));
      const cart = await cartManager.restartCart(CART_ID);
      expect(cart?.state).toBe(CartState.START);
    });

    it('should throw NotFoundError if no cart with provided ID is found', async () => {
      try {
        await cartManager.restartCart(RANDOM_ID);
      } catch (error) {
        expect(error).toStrictEqual(
          new NotFoundError({ message: ERRORS.CART_NOT_FOUND })
        );
      }
    });
  });

  describe('checkoutCart', () => {
    it('should successfully set cart state to "PROCESSING"', async () => {
      await Cart.query()
        .update({ state: CartState.START })
        .where('id', uuidTransformer.to(CART_ID));
      const cart = await cartManager.checkoutCart(CART_ID);
      expect(cart?.state).toBe(CartState.PROCESSING);
    });

    it('should throw NotFoundError if no cart with provided ID is found', async () => {
      try {
        await cartManager.checkoutCart(RANDOM_ID);
      } catch (error) {
        expect(error).toStrictEqual(
          new NotFoundError({ message: ERRORS.CART_NOT_FOUND })
        );
      }
    });
  });

  describe('updateCart', () => {
    it('should successfully update an existing cart', async () => {
      const updateCart = UpdateCartFactory({
        id: CART_ID,
      });
      const cart = await cartManager.updateCart(updateCart);
      expect(cart).toEqual(expect.objectContaining(updateCart));
    });

    it('should throw NotFoundError if no cart with provided ID is found', async () => {
      const updateCart = UpdateCartFactory({
        id: RANDOM_ID,
      });
      try {
        await cartManager.updateCart(updateCart);
      } catch (error) {
        expect(error).toStrictEqual(
          new NotFoundError({ message: ERRORS.CART_NOT_FOUND })
        );
      }
    });
  });
});
