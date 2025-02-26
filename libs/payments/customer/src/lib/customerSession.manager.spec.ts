/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { CustomerSessionManager } from './customerSession.manager';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeResponseFactory,
  StripeCustomerSessionFactory,
} from '@fxa/payments/stripe';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('CustomerSessionManager', () => {
  let customerSessionManager: CustomerSessionManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        CustomerSessionManager,
        StripeClient,
        MockStatsDProvider,
      ],
    }).compile();

    customerSessionManager = moduleRef.get(CustomerSessionManager);
    stripeClient = moduleRef.get(StripeClient);
  });

  describe('create', () => {
    it('should create a customer session', async () => {
      const customerId = 'customerId';
      const mockCustomerSession = StripeCustomerSessionFactory();
      const mockResponse = StripeResponseFactory(mockCustomerSession);

      jest
        .spyOn(stripeClient, 'customersSessionsCreate')
        .mockResolvedValue(mockResponse);

      const result = await customerSessionManager.create(customerId);

      expect(stripeClient.customersSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: customerId })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
