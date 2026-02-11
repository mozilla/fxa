/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import { NVPSetExpressCheckoutResponseFactory } from './factories';
import { PayPalClient } from './paypal.client';
import { CheckoutTokenManager } from './checkoutToken.manager';
import { MockPaypalClientConfigProvider } from './paypal.client.config';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('CheckoutTokenManager', () => {
  let checkoutTokenManager: CheckoutTokenManager;
  let paypalClient: PayPalClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockPaypalClientConfigProvider,
        CheckoutTokenManager,
        PayPalClient,
        MockStatsDProvider,
      ],
    }).compile();

    checkoutTokenManager = moduleRef.get(CheckoutTokenManager);
    paypalClient = moduleRef.get(PayPalClient);
  });

  describe('getCheckoutToken', () => {
    it('returns token and calls setExpressCheckout with passed options', async () => {
      const currencyCode = faker.finance.currencyCode();
      const token = faker.string.uuid();
      const successfulSetExpressCheckoutResponse =
        NVPSetExpressCheckoutResponseFactory({
          TOKEN: token,
        });

      jest
        .spyOn(paypalClient, 'setExpressCheckout')
        .mockResolvedValue(successfulSetExpressCheckoutResponse);

      const result = await checkoutTokenManager.get(currencyCode);

      expect(result).toEqual(successfulSetExpressCheckoutResponse.TOKEN);
      expect(paypalClient.setExpressCheckout).toBeCalledTimes(1);
      expect(paypalClient.setExpressCheckout).toBeCalledWith({ currencyCode });
    });
  });
});
