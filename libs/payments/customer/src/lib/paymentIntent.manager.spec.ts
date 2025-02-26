/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { PaymentIntentManager } from './paymentIntent.manager';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeResponseFactory,
  StripePaymentIntentFactory,
} from '@fxa/payments/stripe';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('PaymentIntentManager', () => {
  let paymentIntentManager: PaymentIntentManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        PaymentIntentManager,
        StripeClient,
        MockStatsDProvider,
      ],
    }).compile();

    paymentIntentManager = moduleRef.get(PaymentIntentManager);
    stripeClient = moduleRef.get(StripeClient);
  });

  describe('confirm', () => {
    it('should attach a payment method to a customer', async () => {
      const mockConfirmationToken = 'confirmToken';
      const mockPaymentIntent = StripePaymentIntentFactory();
      const mockResponse = StripeResponseFactory(mockPaymentIntent);

      jest
        .spyOn(stripeClient, 'paymentIntentConfirm')
        .mockResolvedValue(mockResponse);

      const result = await paymentIntentManager.confirm(mockPaymentIntent.id, {
        confirmation_token: mockConfirmationToken,
      });

      expect(stripeClient.paymentIntentConfirm).toHaveBeenCalledWith(
        mockPaymentIntent.id,
        {
          confirmation_token: mockConfirmationToken,
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieve', () => {
    it('should retrieve a payment intent', async () => {
      const mockPaymentIntent = StripePaymentIntentFactory();
      const mockResponse = StripeResponseFactory(mockPaymentIntent);

      jest
        .spyOn(stripeClient, 'paymentIntentRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await paymentIntentManager.retrieve(mockPaymentIntent.id);

      expect(stripeClient.paymentIntentRetrieve).toHaveBeenCalledWith(
        mockPaymentIntent.id
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
