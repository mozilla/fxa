/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { PaymentMethodManager } from './paymentMethod.manager';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeResponseFactory,
  StripeCustomerFactory,
  StripePaymentMethodFactory,
} from '@fxa/payments/stripe';

describe('PaymentMethodManager', () => {
  let paymentMethodManager: PaymentMethodManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MockStripeConfigProvider, PaymentMethodManager, StripeClient],
    }).compile();

    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    stripeClient = moduleRef.get(StripeClient);
  });

  describe('attach', () => {
    it('should attach a payment method to a customer', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPaymentMethod = StripePaymentMethodFactory();
      const mockResponse = StripeResponseFactory(mockPaymentMethod);

      jest
        .spyOn(stripeClient, 'paymentMethodsAttach')
        .mockResolvedValue(mockResponse);

      const result = await paymentMethodManager.attach(mockPaymentMethod.id, {
        customer: mockCustomer.id,
      });

      expect(stripeClient.paymentMethodsAttach).toHaveBeenCalledWith(
        mockPaymentMethod.id,
        {
          customer: mockCustomer.id,
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
