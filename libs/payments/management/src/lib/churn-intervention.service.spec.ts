/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChurnInterventionService } from './churn-intervention.service';
import { ChurnInterventionManager, ChurnInterventionEntryFactory } from '@fxa/payments/cart';
import { ChurnInterventionByProductIdResultFactory } from '@fxa/shared/cms';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { SubscriptionManagementService } from './subscriptionManagement.service';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { StatsDService } from '@fxa/shared/metrics/statsd';

describe('ChurnInterventionService', () => {
  let churnInterventionService: ChurnInterventionService;
  let churnInterventionManager: ChurnInterventionManager;
  let productConfigurationManager: ProductConfigurationManager;
  let subscriptionManagementService: SubscriptionManagementService;

  const mockEntry = ChurnInterventionEntryFactory();
  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };

  const mockStatsD = {
    increment: jest.fn(),
    gauge: jest.fn(),
    timing: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChurnInterventionService,
        {
          provide: Logger,
          useValue: mockLogger
        },
        {
          provide: ChurnInterventionManager,
          useValue: {
            getEntry: jest.fn(),
            getRedemptionCountForUid: jest.fn(),
            updateEntry: jest.fn(),
          }
        },
        {
          provide: SubscriptionManagementService,
          useValue: {
            getSubscriptionStatus: jest.fn(),
            applyStripeCouponToSubscription: jest.fn(),
          },
        },
        {
          provide: ProductConfigurationManager,
          useValue: {
            getChurnInterventionBySubscription: jest.fn(),
          },
        },
        {
          provide: StatsDService,
          useValue: mockStatsD,
        },
      ],
    }).compile();

    churnInterventionService = moduleRef.get(ChurnInterventionService);
    churnInterventionManager = moduleRef.get(ChurnInterventionManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    subscriptionManagementService = moduleRef.get(SubscriptionManagementService);
  });

  describe('getChurnInterventionForCustomerId', () => {
    it('returns the churn intervention entry', async () => {
      (churnInterventionManager.getEntry as jest.Mock).mockResolvedValue(mockEntry);
      const result = await churnInterventionService.getChurnInterventionForCustomerId(mockEntry.customerId, mockEntry.churnInterventionId);

      expect(churnInterventionManager.getEntry).toHaveBeenCalledWith(
        mockEntry.customerId,
        mockEntry.churnInterventionId
      );
      expect(result).toEqual(mockEntry);
    });
  });

  describe('determineStaySubscribedEligibility', () => {
    const uid = 'uid_123';
    const subscriptionId = 'sub_123';

    const cmsResult = (entries: any[]) => ({
      getTransformedChurnInterventionByProductId: () => entries,
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns ineligible when no churn intervention entries are found', async () => {
      (productConfigurationManager.getChurnInterventionBySubscription as jest.Mock)
        .mockResolvedValue(cmsResult([]));

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'no_churn_intervention_found',
        cmsChurnInterventionEntry: null,
      });
    });

    it('returns ineligible when redemption limit reached', async () => {
      const entry = {
        churnInterventionId: 'churn_id',
        redemptionLimit: 1
      };
      (productConfigurationManager.getChurnInterventionBySubscription as jest.Mock)
        .mockResolvedValue(cmsResult([entry]));
      (churnInterventionManager.getRedemptionCountForUid as jest.Mock)
        .mockResolvedValue(1);

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'discount_already_applied',
        cmsChurnInterventionEntry: null,
      });
    });

    it('returns ineligible when subscription is not active', async () => {
      const entry = {
        churnInterventionId: 'churn_id',
        redemptionLimit: null
      };
      (productConfigurationManager.getChurnInterventionBySubscription as jest.Mock)
        .mockResolvedValue(cmsResult([entry]));
      (churnInterventionManager.getRedemptionCountForUid as jest.Mock)
        .mockResolvedValue(0);
      (subscriptionManagementService.getSubscriptionStatus as jest.Mock)
        .mockResolvedValue({ active: false, cancelAtPeriodEnd: true });

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'subscription_not_active',
        cmsChurnInterventionEntry: null,
      });
    });

    it('returns ineligible when subscription is still active', async () => {
      const entry = {
        churnInterventionId: 'churn_id',
        redemptionLimit: null
      };
      (productConfigurationManager.getChurnInterventionBySubscription as jest.Mock)
        .mockResolvedValue(cmsResult([entry]));
      (churnInterventionManager.getRedemptionCountForUid as jest.Mock)
        .mockResolvedValue(0);
      (subscriptionManagementService.getSubscriptionStatus as jest.Mock)
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'subscription_still_active',
        cmsChurnInterventionEntry: null,
      });
    });

    it('returns eligible on success', async () => {
      const entry = {
        churnInterventionId: 'churn_id',
        redemptionLimit: null
      };
      (productConfigurationManager.getChurnInterventionBySubscription as jest.Mock)
        .mockResolvedValue(cmsResult([entry]));
      (churnInterventionManager.getRedemptionCountForUid as jest.Mock)
        .mockResolvedValue(0);
      (subscriptionManagementService.getSubscriptionStatus as jest.Mock)
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: true });

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: true,
        reason: 'eligible',
        cmsChurnInterventionEntry: entry,
      });
    });

    it('returns general_error for general errors', async () => {
      (productConfigurationManager.getChurnInterventionBySubscription as jest.Mock)
        .mockRejectedValue(new Error('error'));

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'general_error',
        cmsChurnInterventionEntry: null,
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });


  describe('redeemChurnCoupon', () => {
    const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory();
    const mockChurnInterventionEntry = ChurnInterventionEntryFactory();
    const subscriptionId = 'sub_123';
    it('successfully redeems a churn coupon', async () => {
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockCmsChurnEntry,
        });

      (subscriptionManagementService.applyStripeCouponToSubscription as jest.Mock)
        .mockResolvedValue({ id: subscriptionId, cancel_at_period_end: true });

      const prevCount = mockChurnInterventionEntry.redemptionCount || 0;

      const updatedEntry = ChurnInterventionEntryFactory({
        ...mockChurnInterventionEntry,
        customerId: mockChurnInterventionEntry.customerId,
        churnInterventionId: mockChurnInterventionEntry.churnInterventionId,
        redemptionCount: prevCount + 1,
      });
      (churnInterventionManager.updateEntry as jest.Mock)
        .mockResolvedValue(updatedEntry);

      const result = await churnInterventionService.redeemChurnCoupon(
        mockChurnInterventionEntry.customerId,
        subscriptionId
      );

      expect(subscriptionManagementService.applyStripeCouponToSubscription as jest.Mock)
        .toHaveBeenCalledWith({
          uid: mockChurnInterventionEntry.customerId,
          subscriptionId,
          stripeCouponId: mockCmsChurnEntry.stripeCouponId,
          setCancelAtPeriodEnd: true,
        });

      expect(churnInterventionManager.updateEntry as jest.Mock)
        .toHaveBeenCalledWith(
          mockChurnInterventionEntry.customerId,
          mockCmsChurnEntry.churnInterventionId,
          1
        );
      expect(result.updatedChurnInterventionEntryData?.redemptionCount).toBe(prevCount + 1);

      expect(result).toEqual({
        redeemed: true,
        reason: 'successfully_redeemed',
        updatedChurnInterventionEntryData: updatedEntry,
        cmsChurnInterventionEntry: mockCmsChurnEntry,
      });
    });

    it('fails to redeem a churn coupon when an error is thrown', async () => {
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockCmsChurnEntry,
        });

      (subscriptionManagementService.applyStripeCouponToSubscription as jest.Mock)
        .mockRejectedValue(new Error('Stripe error'));

      const result = await churnInterventionService.redeemChurnCoupon(
        mockChurnInterventionEntry.customerId,
        subscriptionId
      );

      expect(subscriptionManagementService.applyStripeCouponToSubscription as jest.Mock)
        .toHaveBeenCalledWith({
          uid: mockChurnInterventionEntry.customerId,
          subscriptionId,
          stripeCouponId: mockCmsChurnEntry.stripeCouponId,
          setCancelAtPeriodEnd: true,
        });

      expect(churnInterventionManager.updateEntry as jest.Mock).not.toHaveBeenCalled();
      expect(result).toEqual({
        redeemed: false,
        reason: 'failed_to_redeem_coupon',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: mockCmsChurnEntry,
      });
    });

   it('fails to redeem a churn coupon when not eligible', async () => {
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'discount_already_applied',
          cmsChurnInterventionEntry: null,
        });

      const result = await churnInterventionService.redeemChurnCoupon(
        mockChurnInterventionEntry.customerId,
        subscriptionId
      );

      expect(subscriptionManagementService.applyStripeCouponToSubscription as jest.Mock)
        .not.toHaveBeenCalled();

      expect(churnInterventionManager.updateEntry as jest.Mock).not.toHaveBeenCalled();
      expect(result).toEqual({
        redeemed: false,
        reason: 'discount_already_applied',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: null,
      });
    });

    it('fails to redeem a churn coupon when applyStripeCouponToSubscription fails', async () => {
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockCmsChurnEntry,
        });

      (subscriptionManagementService.applyStripeCouponToSubscription as jest.Mock)
        .mockResolvedValue(null);

      const result = await churnInterventionService.redeemChurnCoupon(
        mockChurnInterventionEntry.customerId,
        subscriptionId
      );

      expect(subscriptionManagementService.applyStripeCouponToSubscription as jest.Mock)
        .toHaveBeenCalledWith({
          uid: mockChurnInterventionEntry.customerId,
          subscriptionId,
          stripeCouponId: mockCmsChurnEntry.stripeCouponId,
          setCancelAtPeriodEnd: true,
        });

      expect(churnInterventionManager.updateEntry as jest.Mock).not.toHaveBeenCalled();
      expect(result).toEqual({
        redeemed: false,
        reason: 'stripe_subscription_update_failed',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: mockCmsChurnEntry,
      });
    });
  });
});
