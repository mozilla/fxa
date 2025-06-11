/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { SetupIntentManager } from './setupIntent.manager';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeResponseFactory,
  StripeSetupIntentFactory,
} from '@fxa/payments/stripe';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('SetupIntentManager', () => {
  let setupIntentManager: SetupIntentManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        SetupIntentManager,
        StripeClient,
        MockStatsDProvider,
      ],
    }).compile();

    setupIntentManager = moduleRef.get(SetupIntentManager);
    stripeClient = moduleRef.get(StripeClient);
  });

  describe('createAndConfirm', () => {
    it('should create and confirm intent', async () => {
      const mockConfirmationToken = 'confirmToken';
      const mockCustomerId = 'cus_12345';
      const mockResponse = StripeResponseFactory(
        StripeSetupIntentFactory()
      );

      jest
        .spyOn(stripeClient, 'setupIntentCreate')
        .mockResolvedValue(mockResponse);

      const result = await setupIntentManager.createAndConfirm(
        mockCustomerId,
        mockConfirmationToken,
      );

      expect(stripeClient.setupIntentCreate).toHaveBeenCalledWith(
        {
          customer: mockCustomerId,
          confirm: true,
          confirmation_token: mockConfirmationToken,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieve', () => {
    it('should retrieve a payment intent', async () => {
      const mockResponse = StripeResponseFactory(
        StripeSetupIntentFactory()
      );

      jest
        .spyOn(stripeClient, 'setupIntentRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await setupIntentManager.retrieve(mockResponse.id);

      expect(stripeClient.setupIntentRetrieve).toHaveBeenCalledWith(
        mockResponse.id
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

