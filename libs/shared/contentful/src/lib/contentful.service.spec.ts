/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  StripeClient,
  StripeConfig,
  PriceManager,
  StripePlanFactory,
  StripeResponseFactory,
  SubplatInterval,
} from '@fxa/payments/stripe';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { ContentfulClient } from './contentful.client';
import { ContentfulClientConfig } from './contentful.client.config';
import { ContentfulServiceError } from './contentful.error';
import { ContentfulManager } from './contentful.manager';
import { ContentfulService } from './contentful.service';
import {
  ContentfulServiceConfig,
  MockContentfulServiceConfigProvider,
} from './contentful.service.config';
import { EligibilityContentOfferingResultFactory } from './queries/eligibility-content-by-offering';
import {
  PageContentForOfferingResultUtil,
  PageContentOfferingTransformedFactory,
} from './queries/page-content-for-offering';

describe('ContentfulService', () => {
  let contentfulManager: ContentfulManager;
  let contentfulService: ContentfulService;
  let priceManager: PriceManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContentfulClientConfig,
        ContentfulClient,
        ContentfulManager,
        ContentfulService,
        ContentfulServiceConfig,
        MockContentfulServiceConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        StripeClient,
        StripeConfig,
        PriceManager,
      ],
    }).compile();

    contentfulService = moduleRef.get(ContentfulService);
    contentfulManager = moduleRef.get(ContentfulManager);
    priceManager = moduleRef.get(PriceManager);
  });

  describe('fetchContentfulData', () => {
    it('fetches Contentful data successfully', async () => {
      const mockOffering = PageContentOfferingTransformedFactory();

      jest
        .spyOn(contentfulManager, 'getPageContentForOffering')
        .mockResolvedValue({
          getOffering: jest.fn().mockResolvedValue(mockOffering),
        } as unknown as PageContentForOfferingResultUtil);

      const result = await contentfulService.fetchContentfulData(
        mockOffering.apiIdentifier,
        'en'
      );

      expect(result).toEqual(mockOffering);
    });
  });

  describe('retrieveStripePlanId', () => {
    it('returns plan based on offeringId and interval', async () => {
      const mockPlan = StripeResponseFactory(StripePlanFactory());
      const mockInterval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory({
        defaultPurchase: { stripePlanChoices: [mockPlan.id] },
      });

      jest
        .spyOn(contentfulManager, 'getOfferingPlanIds')
        .mockResolvedValue([mockPlan.id]);

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPlan);

      const result = await contentfulService.retrieveStripePlanId(
        mockOffering.apiIdentifier,
        mockInterval
      );
      expect(result).toEqual(mockPlan.id);
    });

    it('throws error if no plans are found', async () => {
      const mockInterval = SubplatInterval.Yearly;
      const mockOffering = EligibilityContentOfferingResultFactory();
      const mockPlan = StripeResponseFactory(StripePlanFactory());

      jest
        .spyOn(contentfulManager, 'getOfferingPlanIds')
        .mockResolvedValue([mockPlan.id]);

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(undefined);

      await expect(
        contentfulService.retrieveStripePlanId(
          mockOffering.apiIdentifier,
          mockInterval
        )
      ).rejects.toThrow(ContentfulServiceError);
    });
  });
});
