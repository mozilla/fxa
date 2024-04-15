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
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';

import { EligibilityManager } from './eligibility.manager';
import { EligibilityService } from './eligibility.service';
import { OfferingComparison, OfferingOverlapResult } from './eligibility.types';

const mockSubscribedPlans = jest.fn();
const mockSubscribedProductIds = jest.fn();

jest.mock('../../../stripe/src/lib/stripe.utils.ts', () => {
  return {
    getSubscribedPlans: function () {
      return mockSubscribedPlans();
    },
    getSubscribedProductIds: function () {
      return mockSubscribedProductIds();
    },
  };
});

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
      expect(result).toEqual({
        eligibilityStatus: CartEligibilityStatus.CREATE,
        state: CartState.START,
      });
    });

    it('throws an error for no offering for offeringConfigId', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockInterval = 'month';

      jest
        .spyOn(contentfulManager, 'getEligibilityContentByOffering')
        .mockResolvedValueOnce(mockOfferingResult);

      mockOfferingResult.getOffering = jest.fn().mockReturnValue(undefined);

      const result = await eligibilityService.checkEligibility(
        mockInterval,
        'prod_test1',
        mockCustomer.id
      );
      expect(result).toEqual({
        eligibilityStatus: CartEligibilityStatus.INVALID,
        state: CartState.FAIL,
      });
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
      ] as OfferingOverlapResult[];
      const mockSubscription = StripeSubscriptionFactory();
      const mockSubscriptionList = StripeApiListFactory([mockSubscription]);
      const mockTargetPlanIds = mockOffering.defaultPurchase.stripePlanChoices;

      jest
        .spyOn(contentfulManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(mockOfferingResult);

      mockOfferingResult.getOffering = jest.fn().mockReturnValue(mockOffering);

      jest
        .spyOn(stripeManager, 'getSubscriptions')
        .mockResolvedValue(mockSubscriptionList);

      mockSubscribedPlans.mockReturnValue([]);
      mockSubscribedProductIds.mockReturnValue([]);

      jest
        .spyOn(eligibilityManager, 'getProductIdOverlap')
        .mockResolvedValue(mockOverlapResult);

      jest.spyOn(eligibilityManager, 'compareOverlap').mockResolvedValue({
        eligibilityStatus: CartEligibilityStatus.UPGRADE,
        state: CartState.START,
      });

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
        mockTargetPlanIds,
        mockInterval,
        []
      );
    });
  });
});
