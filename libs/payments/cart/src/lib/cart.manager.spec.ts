/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Knex } from 'knex';

import {
  Cart,
  CartFactory,
  setupKyselyAccountDatabase,
} from '@fxa/shared/db/mysql/account';
import { Logger } from '@fxa/shared/log';

import { CartManager } from './cart.manager';
import { SetupCartFactory } from './cart.factories';
import { testCartDatabaseSetup } from './tests';

const CART_ID = '8730e0d5939c450286e6e6cc1bbeeab2';

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
    knex = await testCartDatabaseSetup();
    const kysleyDb = await setupKyselyAccountDatabase({
      host: 'localhost',
      database: 'testCart',
      password: '',
      port: 3306,
      user: 'root',
    });
    cartManager = new CartManager(mockLogger, kysleyDb);
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
      const fetchedCart = await cartManager.fetchCartById(cart.id);
      expect(fetchedCart).toEqual(expect.objectContaining(setupCart));
    });
  });
});
