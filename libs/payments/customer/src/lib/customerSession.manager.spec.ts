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

  describe('createCheckoutSession', () => {
    it('should create a checkoutcustomer session', async () => {
      const customerId = 'customerId';
      const mockCustomerSession = StripeCustomerSessionFactory();
      const mockResponse = StripeResponseFactory(mockCustomerSession);

      jest
        .spyOn(stripeClient, 'customersSessionsCreate')
        .mockResolvedValue(mockResponse);

      const result =
        await customerSessionManager.createCheckoutSession(customerId);

      expect(stripeClient.customersSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: customerId,
          components: {
            payment_element: {
              enabled: true,
              features: {
                payment_method_redisplay: 'enabled',
                payment_method_save: 'disabled',
                payment_method_remove: 'disabled',
                payment_method_allow_redisplay_filters: [
                  'always',
                  'limited',
                  'unspecified',
                ],
              },
            },
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createManagementSession', () => {
    it('should create a checkout customer session', async () => {
      const customerId = 'customerId';
      const mockCustomerSession = StripeCustomerSessionFactory();
      const mockResponse = StripeResponseFactory(mockCustomerSession);

      jest
        .spyOn(stripeClient, 'customersSessionsCreate')
        .mockResolvedValue(mockResponse);

      const result =
        await customerSessionManager.createManagementSession(customerId);

      expect(stripeClient.customersSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: customerId,
          components: {
            payment_element: {
              enabled: true,
              features: {
                payment_method_redisplay: 'enabled',
                payment_method_remove: 'disabled',
                payment_method_allow_redisplay_filters: [
                  'always',
                  'limited',
                  'unspecified',
                ],
              },
            },
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
