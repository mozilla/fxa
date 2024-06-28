/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  PriceManager,
  StripeClient,
  StripeConfig,
  StripePriceFactory,
  StripeResponseFactory,
  SubplatInterval,
} from '@fxa/payments/stripe';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { CMSConfig, MockCMSConfigProvider } from './cms.config';
import { ContentfulServiceError } from './cms.error';
import { ContentfulClientConfig } from './contentful.client.config';
import { ProductConfigurationManager } from './product-configuration.manager';
import { ContentfulService } from './contentful.service';
import { EligibilityContentOfferingResultFactory } from './queries/eligibility-content-by-offering';
import {
  PageContentForOfferingResultUtil,
  PageContentOfferingTransformedFactory,
} from './queries/page-content-for-offering';
import { StrapiClient } from './strapi.client';

describe('ContentfulService', () => {
  let productConfigurationManager: ProductConfigurationManager;
  let contentfulService: ContentfulService;
  let priceManager: PriceManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CMSConfig,
        ContentfulClientConfig,
        ContentfulService,
        MockCMSConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        PriceManager,
        ProductConfigurationManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
      ],
    }).compile();

    contentfulService = moduleRef.get(ContentfulService);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    priceManager = moduleRef.get(PriceManager);
  });

  describe('fetchCMSData', () => {
    it('fetches CMS data successfully', async () => {
      const mockOffering = PageContentOfferingTransformedFactory();

      jest
        .spyOn(productConfigurationManager, 'getPageContentForOffering')
        .mockResolvedValue({
          getOffering: jest.fn().mockResolvedValue(mockOffering),
        } as unknown as PageContentForOfferingResultUtil);

      const result = await contentfulService.fetchCMSData(
        mockOffering.apiIdentifier,
        'en'
      );

      expect(result).toEqual(mockOffering);
    });
  });

  describe('retrieveStripePlanId', () => {
    it('returns plan based on offeringId and interval', async () => {
      const mockPrice = StripeResponseFactory(StripePriceFactory());
      const mockInterval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory({
        defaultPurchase: { stripePlanChoices: [mockPrice.id] },
      });

      jest
        .spyOn(productConfigurationManager, 'getOfferingPlanIds')
        .mockResolvedValue([mockPrice.id]);

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice);

      const result = await contentfulService.retrieveStripePlanId(
        mockOffering.apiIdentifier,
        mockInterval
      );
      expect(result).toEqual(mockPrice.id);
    });

    it('throws error if no plans are found', async () => {
      const mockInterval = SubplatInterval.Yearly;
      const mockOffering = EligibilityContentOfferingResultFactory();
      const mockPrice = StripeResponseFactory(StripePriceFactory());

      jest
        .spyOn(productConfigurationManager, 'getOfferingPlanIds')
        .mockResolvedValue([mockPrice.id]);

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
