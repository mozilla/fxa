/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { StripeResponseFactory } from './factories/api-list.factory';
import { StripePlanFactory } from './factories/plan.factory';
import { StripeClient } from './stripe.client';
import { MockStripeConfigProvider } from './stripe.config';
import { PlanIntervalMultiplePlansError } from './stripe.error';
import { PriceManager } from './price.manager';
import { SubplatInterval } from './stripe.types';

describe('PriceManager', () => {
  let priceManager: PriceManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockStripeConfigProvider, StripeClient, PriceManager],
    }).compile();

    priceManager = module.get(PriceManager);
    stripeClient = module.get(StripeClient);
  });

  describe('retrieve', () => {
    it('returns plan', async () => {
      const mockPlan = StripeResponseFactory(StripePlanFactory());

      jest.spyOn(stripeClient, 'plansRetrieve').mockResolvedValue(mockPlan);

      const result = await priceManager.retrieve(mockPlan.id);
      expect(result).toEqual(mockPlan);
    });
  });

  describe('getPlanByInterval', () => {
    it('returns plan that matches interval', async () => {
      const mockPlan = StripeResponseFactory(
        StripePlanFactory({
          interval: 'month',
          interval_count: 1,
        })
      );
      const subplatInterval = SubplatInterval.Monthly;

      jest.spyOn(priceManager, 'retrieve').mockResolvedValue(mockPlan);

      const result = await priceManager.retrieveByInterval(
        [mockPlan.id],
        subplatInterval
      );
      expect(result).toEqual(mockPlan);
    });

    it('throw error if interval returns multiple plans', async () => {
      const mockPlan1 = StripePlanFactory({
        interval: 'month',
      });
      const mockPlan2 = StripePlanFactory({
        interval: 'month',
      });
      const subplatInterval = SubplatInterval.Monthly;

      jest
        .spyOn(priceManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockPlan1));
      jest
        .spyOn(priceManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockPlan2));

      await expect(
        priceManager.retrieveByInterval(
          [mockPlan1.id, mockPlan2.id],
          subplatInterval
        )
      ).rejects.toBeInstanceOf(PlanIntervalMultiplePlansError);
    });
  });
});
