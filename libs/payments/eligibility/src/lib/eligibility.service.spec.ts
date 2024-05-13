/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockStripeUtil = {
  getSubscribedPlans: jest.fn(),
  getSubscribedProductIds: jest.fn(),
};

jest.mock('../../../stripe/src/lib/stripe.util.ts', () => mockStripeUtil);

import { Test, TestingModule } from '@nestjs/testing';

import {
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripeManager,
  StripeSubscriptionFactory,
  SubplatInterval,
} from '@fxa/payments/stripe';
import {
  ContentfulClient,
  ContentfulClientConfig,
  ContentfulManager,
  EligibilityContentByOfferingResultUtil,
  EligibilityContentOfferingResultFactory,
} from '@fxa/shared/contentful';

import { EligibilityManager } from './eligibility.manager';
import { EligibilityService } from './eligibility.service';
import {
  EligibilityStatus,
  OfferingComparison,
  OfferingOverlapProductResult,
} from './eligibility.types';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';

describe('EligibilityService', () => {
  let contentfulManager: ContentfulManager;
  let eligibilityManager: EligibilityManager;
  let eligibilityService: EligibilityService;
  let stripeManager: StripeManager;

  let mockOfferingResult: EligibilityContentByOfferingResultUtil;

  beforeEach(async () => {
    mockOfferingResult = {} as EligibilityContentByOfferingResultUtil;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockFirestoreProvider,
        ContentfulClientConfig,
        ContentfulClient,
        MockStatsDProvider,
        ContentfulManager,
        EligibilityManager,
        StripeConfig,
        StripeClient,
        StripeManager,
        EligibilityService,
      ],
    }).compile();

    contentfulManager = module.get<ContentfulManager>(ContentfulManager);
    eligibilityManager = module.get<EligibilityManager>(EligibilityManager);
    eligibilityService = module.get<EligibilityService>(EligibilityService);
    stripeManager = module.get<StripeManager>(StripeManager);
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
      expect(result).toEqual(EligibilityStatus.CREATE);
    });

    it('throws an error for no offering for offeringConfigId', async () => {
      const expectedError = new Error('No offering available');
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;

      jest
        .spyOn(contentfulManager, 'getEligibilityContentByOffering')
        .mockResolvedValue({
          getOffering: jest.fn().mockImplementation(() => {
            throw expectedError;
          }),
        } as unknown as EligibilityContentByOfferingResultUtil);

      await expect(
        eligibilityService.checkEligibility(
          interval,
          'prod_test1',
          mockCustomer.id
        )
      ).rejects.toEqual(expectedError);
    });

    it('returns eligibility status successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const interval = SubplatInterval.Monthly;
      const mockOffering = EligibilityContentOfferingResultFactory();
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.UPGRADE,
          offeringProductId: 'prod_test',
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];
      const mockSubscription = StripeSubscriptionFactory();

      jest
        .spyOn(contentfulManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(mockOfferingResult);

      mockOfferingResult.getOffering = jest.fn().mockReturnValue(mockOffering);

      jest
        .spyOn(stripeManager, 'getSubscriptions')
        .mockResolvedValue([mockSubscription]);

      mockStripeUtil.getSubscribedPlans.mockReturnValue([]);
      mockStripeUtil.getSubscribedProductIds.mockReturnValue([]);

      jest
        .spyOn(eligibilityManager, 'getProductIdOverlap')
        .mockReturnValue(mockOverlapResult);

      jest
        .spyOn(eligibilityManager, 'compareOverlap')
        .mockResolvedValue(EligibilityStatus.UPGRADE);

      await eligibilityService.checkEligibility(
        interval,
        mockOffering.apiIdentifier,
        mockCustomer.id
      );

      expect(
        contentfulManager.getEligibilityContentByOffering
      ).toHaveBeenCalledWith(mockOffering.apiIdentifier);
      expect(stripeManager.getSubscriptions).toHaveBeenCalledWith(
        mockCustomer.id
      );
      expect(eligibilityManager.getProductIdOverlap).toHaveBeenCalledWith(
        [],
        mockOffering
      );
      expect(eligibilityManager.compareOverlap).toHaveBeenCalledWith(
        mockOverlapResult,
        mockOffering,
        interval,
        []
      );
    });
  });
});
