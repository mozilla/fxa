/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { StripeResponseFactory } from './factories/api-list.factory';
import { StripeProductFactory } from './factories/product.factory';
import { StripeClient } from './stripe.client';
import { MockStripeConfigProvider } from './stripe.config';
import { ProductManager } from './product.manager';

describe('ProductManager', () => {
  let productManager: ProductManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockStripeConfigProvider, StripeClient, ProductManager],
    }).compile();

    productManager = module.get(ProductManager);
    stripeClient = module.get(StripeClient);
  });

  describe('retrieve', () => {
    it('returns product', async () => {
      const mockProduct = StripeResponseFactory(StripeProductFactory());

      jest
        .spyOn(stripeClient, 'productsRetrieve')
        .mockResolvedValue(mockProduct);

      const result = await productManager.retrieve(mockProduct.id);
      expect(result).toEqual(mockProduct);
    });
  });
});
