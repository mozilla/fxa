/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  StripeApiListFactory,
  StripeResponseFactory,
} from './factories/api-list.factory';
import { StripePromotionCodeFactory } from './factories/promotion-code.factory';
import { StripeClient } from './stripe.client';
import { MockStripeConfigProvider } from './stripe.config';
import { PromotionCodeManager } from './promotionCode.manager';

describe('PromotionCodeManager', () => {
  let promotionCodeManager: PromotionCodeManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockStripeConfigProvider, StripeClient, PromotionCodeManager],
    }).compile();

    promotionCodeManager = module.get(PromotionCodeManager);
    stripeClient = module.get(StripeClient);
  });

  describe('retrieve', () => {
    it('retrieves promotion code', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockResponse = StripeResponseFactory(mockPromotionCode);

      jest
        .spyOn(stripeClient, 'promotionCodesRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await promotionCodeManager.retrieve(mockPromotionCode.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieveByName', () => {
    it('queries for promotionCodes from stripe and returns first', async () => {
      const mockPromotionCode = StripePromotionCodeFactory();
      const mockPromotionCode2 = StripePromotionCodeFactory();
      const mockPromotionCodesResponse = StripeApiListFactory([
        mockPromotionCode,
        mockPromotionCode2,
      ]);

      jest
        .spyOn(stripeClient, 'promotionCodesList')
        .mockResolvedValue(StripeResponseFactory(mockPromotionCodesResponse));

      const result = await promotionCodeManager.retrieveByName(
        mockPromotionCode.code
      );
      expect(result).toEqual(mockPromotionCode);
    });
  });
});
