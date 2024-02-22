/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import { CustomerFactory } from './factories/customer.factory';
import { StripeClient } from './stripe.client';
import { StripeManager } from './stripe.manager';

describe('StripeManager', () => {
  describe('isCustomerStripeTaxEligible', () => {
    let manager: StripeManager;
    let mockStripeClient: StripeClient;
    let mockResult: any;

    beforeEach(async () => {
      mockResult = {};
      mockStripeClient = {};

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          { provide: StripeClient, useValue: mockStripeClient },
          StripeManager,
        ],
      }).compile();

      manager = module.get<StripeManager>(StripeManager);
    });

    it('should be defined', async () => {
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(StripeManager);
    });

    it('should throw an error if no tax in customer', async () => {
      const mockCustomer = CustomerFactory();

      expect(manager.isCustomerStripeTaxEligible(mockCustomer)).rejects.toThrow(
        'customer.tax is not present'
      );
    });

    it('should return true for a taxable customer', async () => {
      const mockCustomer = CustomerFactory({
        tax: {
          automatic_tax: 'supported',
          ip_address: null,
          location: { country: 'US', state: 'CA', source: 'billing_address' },
        },
      });

      mockResult.isCustomerStripeTaxEligible = jest
        .fn()
        .mockReturnValueOnce(true);

      const result = await manager.isCustomerStripeTaxEligible(mockCustomer);
      expect(result).toEqual(true);
    });

    it('should return true for a customer in a not-collecting location', async () => {
      const mockCustomer = CustomerFactory({
        tax: {
          automatic_tax: 'not_collecting',
          ip_address: null,
          location: null,
        },
      });

      mockResult.isCustomerStripeTaxEligible = jest
        .fn()
        .mockReturnValueOnce(true);

      const result = await manager.isCustomerStripeTaxEligible(mockCustomer);
      expect(result).toEqual(true);
    });
  });
});
