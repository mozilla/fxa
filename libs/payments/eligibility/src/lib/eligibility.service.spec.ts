/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';

import {
  StripeApiListFactory,
  StripeCustomerFactory,
  StripeManager,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import {
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
        ContentfulManager,
        EligibilityManager,
        StripeManager,
        EligibilityService,
      ],
    })
      .overrideProvider(ContentfulManager)
      .useValue({
        getEligibilityContentByOffering: jest
          .fn()
          .mockResolvedValue(mockOfferingResult),
      })
      .overrideProvider(EligibilityManager)
      .useValue({
        compareOverlap: jest.fn(),
        getProductIdOverlap: jest.fn(),
      })
      .overrideProvider(StripeManager)
      .useValue({
        getSubscribedPlans: jest.fn(),
        getSubscribedProductIds: jest.fn(),
        getSubscriptions: jest.fn(),
      })
      .compile();

    contentfulManager = module.get<ContentfulManager>(ContentfulManager);
    eligibilityManager = module.get<EligibilityManager>(EligibilityManager);
    eligibilityService = module.get<EligibilityService>(EligibilityService);
    stripeManager = module.get<StripeManager>(StripeManager);
  });

  describe('checkEligibility', () => {
    it('returns create eligibility status for a new customer', async () => {
      const mockInterval = 'month';
      const mockOffering = EligibilityContentOfferingResultFactory();

      const result = await eligibilityService.checkEligibility(
        mockInterval,
        mockOffering.apiIdentifier,
        null
      );
      expect(result).toEqual(EligibilityStatus.CREATE);
    });

    it('throws an error for no offering for offeringConfigId', async () => {
      const expectedError = new Error('No offering available');
      const mockCustomer = StripeCustomerFactory();
      const mockInterval = 'month';

      jest
        .spyOn(contentfulManager, 'getEligibilityContentByOffering')
        .mockResolvedValueOnce({
          getOffering: jest.fn().mockImplementation(() => {
            throw expectedError;
          }),
        } as unknown as EligibilityContentByOfferingResultUtil);

      await expect(
        eligibilityService.checkEligibility(
          mockInterval,
          'prod_test1',
          mockCustomer.id
        )
      ).rejects.toEqual(expectedError);
    });

    it('returns eligibility status successfully', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockInterval = 'month';
      const mockOffering = EligibilityContentOfferingResultFactory();
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.UPGRADE,
          offeringProductId: 'prod_test',
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];
      const mockSubscription = StripeSubscriptionFactory();
      const mockSubscriptionList = StripeApiListFactory([mockSubscription]);

      jest
        .spyOn(contentfulManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(mockOfferingResult);

      mockOfferingResult.getOffering = jest.fn().mockReturnValue(mockOffering);

      jest
        .spyOn(stripeManager, 'getSubscriptions')
        .mockResolvedValue(mockSubscriptionList);

      jest.spyOn(stripeManager, 'getSubscribedPlans').mockReturnValue([]);
      jest.spyOn(stripeManager, 'getSubscribedProductIds').mockReturnValue([]);

      jest
        .spyOn(eligibilityManager, 'getProductIdOverlap')
        .mockReturnValue(mockOverlapResult);

      jest
        .spyOn(eligibilityManager, 'compareOverlap')
        .mockResolvedValue(EligibilityStatus.UPGRADE);

      await eligibilityService.checkEligibility(
        mockInterval,
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
        mockInterval,
        []
      );
    });
  });
});
