/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';

import {
  PriceManager,
  SubplatInterval,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripePriceFactory,
} from '@fxa/payments/stripe';
import {
  EligibilityContentByOfferingResultFactory,
  EligibilityContentByOfferingResultUtil,
  EligibilityContentOfferingResultFactory,
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import { EligibilityManager } from './eligibility.manager';
import { EligibilityService } from './eligibility.service';
import {
  EligibilityStatus,
  OfferingComparison,
  OfferingOverlapResult,
} from './eligibility.types';

describe('EligibilityService', () => {
  let productConfigurationManager: ProductConfigurationManager;
  let eligibilityManager: EligibilityManager;
  let eligibilityService: EligibilityService;
  let subscriptionManager: SubscriptionManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStrapiClientConfigProvider,
        EligibilityManager,
        EligibilityService,
        MockFirestoreProvider,
        MockStatsDProvider,
        PriceManager,
        ProductConfigurationManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
      ],
    }).compile();

    eligibilityManager = module.get(EligibilityManager);
    eligibilityService = module.get(EligibilityService);
    productConfigurationManager = module.get(ProductConfigurationManager);
    subscriptionManager = module.get(SubscriptionManager);
  });

  describe('checkEligibility', () => {
    it('returns create eligibility status for a new customer', async () => {
      const interval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory();

      const result = await eligibilityService.checkEligibility(
        interval,
        mockOffering.apiIdentifier,
        undefined
      );
      expect(result).toEqual({
        subscriptionEligibilityResult: EligibilityStatus.CREATE,
      });
    });

    it('throws an error for no offering for offeringConfigId', async () => {
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;

      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(
          new EligibilityContentByOfferingResultUtil(
            EligibilityContentByOfferingResultFactory({
              offerings: [],
            })
          )
        );

      await expect(
        eligibilityService.checkEligibility(
          interval,
          'prod_test1',
          mockCustomer.id
        )
      ).rejects.toThrowError('getOffering - No offering exists');
    });

    it('returns eligibility status successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory();
      const mockFromPrice = StripePriceFactory();
      const mockFromOfferingId = 'prod_test';
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.UPGRADE,
          priceId: 'prod_test',
          fromOfferingId: mockOffering.apiIdentifier,
        },
      ] satisfies OfferingOverlapResult[];

      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(
          new EligibilityContentByOfferingResultUtil(
            EligibilityContentByOfferingResultFactory({
              offerings: [mockOffering],
            })
          )
        );

      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);

      jest
        .spyOn(eligibilityManager, 'getOfferingOverlap')
        .mockResolvedValue(mockOverlapResult);

      jest.spyOn(eligibilityManager, 'compareOverlap').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.UPGRADE,
        fromOfferingConfigId: mockFromOfferingId,
        fromPrice: mockFromPrice,
      });

      await eligibilityService.checkEligibility(
        interval,
        mockOffering.apiIdentifier,
        mockCustomer.id
      );

      expect(
        productConfigurationManager.getEligibilityContentByOffering
      ).toHaveBeenCalledWith(mockOffering.apiIdentifier);
      expect(subscriptionManager.listForCustomer).toHaveBeenCalledWith(
        mockCustomer.id
      );
      expect(eligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
        priceIds: [],
        providedTargetOffering: mockOffering,
      });
      expect(eligibilityManager.compareOverlap).toHaveBeenCalledWith(
        mockOverlapResult,
        mockOffering,
        interval,
        []
      );
    });
  });
});
