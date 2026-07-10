/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { MockLoggerProvider } from '@fxa/shared/log';

import { ConfirmationTokenManager } from './confirmationToken.manager';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeConfirmationTokenFactory,
  StripeResponseFactory,
} from '@fxa/payments/stripe';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('ConfirmationTokenManager', () => {
  let confirmationTokenManager: ConfirmationTokenManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ConfirmationTokenManager,
        MockStripeConfigProvider,
        StripeClient,
        MockStatsDProvider,
        MockLoggerProvider,
      ],
    }).compile();

    confirmationTokenManager = moduleRef.get(ConfirmationTokenManager);
    stripeClient = moduleRef.get(StripeClient);
  });

  describe('retrieve', () => {
    it('should retrieve a confirmation token', async () => {
      const mockResponse = StripeResponseFactory(
        StripeConfirmationTokenFactory()
      );

      jest
        .spyOn(stripeClient, 'confirmationTokenRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await confirmationTokenManager.retrieve(mockResponse.id);

      expect(stripeClient.confirmationTokenRetrieve).toHaveBeenCalledWith(
        mockResponse.id
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
