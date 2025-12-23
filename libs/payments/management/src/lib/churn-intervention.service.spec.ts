/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChurnInterventionService } from './churn-intervention.service';
import { ChurnInterventionManager, ChurnInterventionEntryFactory } from '@fxa/payments/cart';
import {
  ChurnInterventionByProductIdResultFactory,
  ChurnInterventionByProductIdRawResultFactory,
  ChurnInterventionByProductIdResultUtil
} from '@fxa/shared/cms';
import {
  EligibilityService,
  EligibilityStatus,
} from '@fxa/payments/eligibility';
import {
  StripeSubscriptionFactory,
  StripeResponseFactory,
  StripePriceFactory,
  StripePriceRecurringFactory,
} from '@fxa/payments/stripe';
import {
  ProductConfigurationManager,
  CancelInterstitialOfferTransformedFactory,
  CancelInterstitialOfferResultFactory,
  CancelInterstitialOfferUtil,
} from '@fxa/shared/cms';
import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { SubplatInterval, SubscriptionManager } from '@fxa/payments/customer';

describe('ChurnInterventionService', () => {
  let churnInterventionService: ChurnInterventionService;
  let churnInterventionManager: ChurnInterventionManager;
  let productConfigurationManager: ProductConfigurationManager;
  let subscriptionManager: SubscriptionManager;
  let eligibilityService: EligibilityService;

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
          provide: EligibilityService,
          useValue: {
            checkEligibility: jest.fn(),
          }
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
          provide: SubscriptionManager,
          useValue: {
            getSubscriptionStatus: jest.fn(),
            applyStripeCouponToSubscription: jest.fn(),
          },
        },
        {
          provide: ProductConfigurationManager,
          useValue: {
            getChurnInterventionBySubscription: jest.fn(),
            getCancelInterstitialOffer: jest.fn(),
            getSubplatIntervalBySubscription: jest.fn(),
            retrieveStripePrice: jest.fn(),
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
    subscriptionManager = moduleRef.get(SubscriptionManager);
    eligibilityService = moduleRef.get(EligibilityService);
  });

  describe('getChurnInterventionForCustomerId', () => {
    it('returns the churn intervention entry', async () => {
      jest.spyOn(churnInterventionManager, 'getEntry')
        .mockResolvedValue(mockEntry);
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
    const customerId = 'cus_123';
    const subscriptionId = 'sub_123';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns ineligible when no churn intervention entries are found', async () => {
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      jest.spyOn(productConfigurationManager, 'getChurnInterventionBySubscription')
        .mockResolvedValue(util);
      jest.spyOn(util, 'getTransformedChurnInterventionByProductId').mockReturnValue([]);

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        customerId,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'no_churn_intervention_found',
        cmsChurnInterventionEntry: null,
      });
    });

    it('returns ineligible when redemption limit reached', async () => {
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      jest.spyOn(productConfigurationManager, 'getChurnInterventionBySubscription')
        .mockResolvedValue(util);

      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory({
        churnInterventionId: 'churn_id',
        redemptionLimit: 1
      });
      jest.spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);

      jest.spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(1);

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        customerId,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'discount_already_applied',
        cmsChurnInterventionEntry: null,
      });
    });

    it('returns ineligible when subscription is not active', async () => {
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      jest.spyOn(productConfigurationManager, 'getChurnInterventionBySubscription')
        .mockResolvedValue(util);

      jest.spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(0);
      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: false, cancelAtPeriodEnd: true });

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        customerId,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'subscription_not_active',
        cmsChurnInterventionEntry: null,
      });
    });

    it('returns ineligible when subscription is still active', async () => {
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      jest.spyOn(productConfigurationManager, 'getChurnInterventionBySubscription')
        .mockResolvedValue(util);

      jest.spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(0);
      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        customerId,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: false,
        reason: 'subscription_still_active',
        cmsChurnInterventionEntry: null,
      });
    });

    it('returns eligible on success', async () => {
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      jest.spyOn(productConfigurationManager, 'getChurnInterventionBySubscription')
        .mockResolvedValue(util);

      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory();
      jest.spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);

      jest.spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(0);
      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: true });

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        customerId,
        subscriptionId
      );

      expect(result).toEqual({
        isEligible: true,
        reason: 'eligible',
        cmsChurnInterventionEntry: mockCmsChurnEntry,
      });
    });

    it('returns general_error for general errors', async () => {
      jest.spyOn(productConfigurationManager, 'getChurnInterventionBySubscription')
        .mockRejectedValue(new Error('error'));

      const result = await churnInterventionService.determineStaySubscribedEligibility(
        uid,
        customerId,
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

      const updatedSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          id: subscriptionId,
          cancel_at_period_end: true,
        })
      );

      jest.spyOn(subscriptionManager, 'applyStripeCouponToSubscription')
        .mockResolvedValue(updatedSubscription);

      const prevCount = mockChurnInterventionEntry.redemptionCount || 0;

      const updatedEntry = ChurnInterventionEntryFactory({
        ...mockChurnInterventionEntry,
        customerId: mockChurnInterventionEntry.customerId,
        churnInterventionId: mockChurnInterventionEntry.churnInterventionId,
        redemptionCount: prevCount + 1,
      });
      jest.spyOn(churnInterventionManager, 'updateEntry')
        .mockResolvedValue(updatedEntry);

      const result = await churnInterventionService.redeemChurnCoupon(
        mockChurnInterventionEntry.customerId,
        mockChurnInterventionEntry.customerId,
        subscriptionId
      );

      expect(jest.spyOn(subscriptionManager, 'applyStripeCouponToSubscription'))
        .toHaveBeenCalledWith({
          customerId: mockChurnInterventionEntry.customerId,
          subscriptionId,
          stripeCouponId: mockCmsChurnEntry.stripeCouponId,
          setCancelAtPeriodEnd: true,
        });

      expect(jest.spyOn(churnInterventionManager, 'updateEntry'))
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

      jest.spyOn(subscriptionManager, 'applyStripeCouponToSubscription')
        .mockRejectedValue(new Error('Stripe error'));

      const result = await churnInterventionService.redeemChurnCoupon(
        mockChurnInterventionEntry.customerId,
        mockChurnInterventionEntry.customerId,
        subscriptionId
      );

      expect(jest.spyOn(subscriptionManager, 'applyStripeCouponToSubscription'))
        .toHaveBeenCalledWith({
          customerId: mockChurnInterventionEntry.customerId,
          subscriptionId,
          stripeCouponId: mockCmsChurnEntry.stripeCouponId,
          setCancelAtPeriodEnd: true,
        });

      expect(jest.spyOn(churnInterventionManager, 'updateEntry')).not.toHaveBeenCalled();
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
        mockChurnInterventionEntry.customerId,
        subscriptionId
      );

      expect(jest.spyOn(subscriptionManager, 'applyStripeCouponToSubscription'))
        .not.toHaveBeenCalled();

      expect(jest.spyOn(churnInterventionManager, 'updateEntry')).not.toHaveBeenCalled();
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

      jest.spyOn(subscriptionManager, 'applyStripeCouponToSubscription')
        .mockResolvedValue(null);

      const result = await churnInterventionService.redeemChurnCoupon(
        mockChurnInterventionEntry.customerId,
        mockChurnInterventionEntry.customerId,
        subscriptionId
      );

      expect(jest.spyOn(subscriptionManager, 'applyStripeCouponToSubscription'))
        .toHaveBeenCalledWith({
          customerId: mockChurnInterventionEntry.customerId,
          subscriptionId,
          stripeCouponId: mockCmsChurnEntry.stripeCouponId,
          setCancelAtPeriodEnd: true,
        });

      expect(jest.spyOn(churnInterventionManager, 'updateEntry')).not.toHaveBeenCalled();
      expect(result).toEqual({
        redeemed: false,
        reason: 'stripe_subscription_update_failed',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: mockCmsChurnEntry,
      });
    });
  });

  describe('determineCancellationIntervention', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns cancel_interstitial_offer when one exists', async () => {
      const args = {
        uid: 'uid_123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        offeringApiIdentifier: 'offer_123',
        currentInterval: SubplatInterval.Monthly,
        upgradeInterval: SubplatInterval.Yearly,
      };

      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      jest.spyOn(churnInterventionService, 'determineCancelChurnContentEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
        });

      const mockCancelInterstitialOffer = CancelInterstitialOfferTransformedFactory();

      jest.spyOn(churnInterventionService, 'determineCancelInterstitialOfferEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsCancelInterstitialOfferResult: mockCancelInterstitialOffer,
        });

      const result = await churnInterventionService.determineCancellationIntervention(args);

      expect(subscriptionManager.getSubscriptionStatus)
        .toHaveBeenCalledWith(args.customerId, args.subscriptionId);

      expect(result).toEqual({
        cancelChurnInterventionType: 'cancel_interstitial_offer',
        reason: 'eligible',
        cmsOfferContent: mockCancelInterstitialOffer,
      });
    });

    it('returns cancel_interstitial_offer when all checks pass', async () => {
      const args = {
        uid: 'uid_123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        offeringApiIdentifier: 'offer_123',
        currentInterval: SubplatInterval.Monthly,
        upgradeInterval: SubplatInterval.Yearly,
      };

      jest.spyOn(churnInterventionService, 'determineCancelChurnContentEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
        });

      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      const rawResult = CancelInterstitialOfferResultFactory();
      const util = new CancelInterstitialOfferUtil(rawResult);
      jest.spyOn(productConfigurationManager, 'getCancelInterstitialOffer')
        .mockResolvedValue(util);
      const mockCancelInterstitialOffer = CancelInterstitialOfferTransformedFactory();
      jest.spyOn(util, 'getTransformedResult').mockReturnValue(mockCancelInterstitialOffer);

      jest.spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);

      const mockPrice = StripeResponseFactory(StripePriceFactory());
      jest.spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);

      const mockFromOfferingId = faker.string.uuid();
      const mockFromPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({ interval: 'month' }),
      });
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.UPGRADE,
        fromOfferingConfigId: mockFromOfferingId,
        fromPrice: mockFromPrice,
      });

      const result = await churnInterventionService.determineCancellationIntervention(args);

      expect(subscriptionManager.getSubscriptionStatus)
        .toHaveBeenCalledWith(args.customerId, args.subscriptionId);
      expect(productConfigurationManager.retrieveStripePrice)
        .toHaveBeenCalledWith(args.offeringApiIdentifier, args.upgradeInterval);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision', {
          type: 'cancel_interstitial_offer',
        });

      expect(result).toEqual({
        cancelChurnInterventionType: 'cancel_interstitial_offer',
        reason: 'eligible',
        cmsOfferContent: mockCancelInterstitialOffer,
      });
    });

    it('returns cancel_churn_intervention when one exists', async () => {
      const args = {
        uid: 'uid_123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        offeringApiIdentifier: 'offer_123',
        currentInterval: SubplatInterval.Monthly,
        upgradeInterval: SubplatInterval.Yearly,
      };

      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      jest.spyOn(churnInterventionService, 'determineCancelInterstitialOfferEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_cancel_interstitial_offer_found',
          cmsCancelInterstitialOfferResult: null,
        });

      const mockCmsOffer = ChurnInterventionByProductIdResultFactory();
      jest.spyOn(churnInterventionService, 'determineCancelChurnContentEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockCmsOffer,
        });

      const result = await churnInterventionService.determineCancellationIntervention(args);

      expect(subscriptionManager.getSubscriptionStatus)
        .toHaveBeenCalledWith(args.customerId, args.subscriptionId);

      expect(result).toEqual({
        cancelChurnInterventionType: 'cancel_churn_intervention',
        reason: 'eligible',
        cmsOfferContent: mockCmsOffer,
      });
    });

    it('returns none when no cancel offers exist', async () => {
      const args = {
        uid: 'uid_123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        offeringApiIdentifier: 'offer_123',
        currentInterval: SubplatInterval.Monthly,
        upgradeInterval: SubplatInterval.Yearly,
      };

      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      jest.spyOn(churnInterventionService, 'determineCancelInterstitialOfferEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_cancel_interstitial_offer_found',
          cmsCancelInterstitialOfferResult: null,
        });

      jest.spyOn(churnInterventionService, 'determineCancelChurnContentEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
        });

      const result = await churnInterventionService.determineCancellationIntervention(args);

      expect(subscriptionManager.getSubscriptionStatus)
        .toHaveBeenCalledWith(args.customerId, args.subscriptionId);

      expect(churnInterventionService.determineCancelInterstitialOfferEligibility)
        .toHaveBeenCalledWith(args);
      expect(churnInterventionService.determineCancelInterstitialOfferEligibility)
        .toHaveBeenCalledTimes(1);

        expect(churnInterventionService.determineCancelChurnContentEligibility)
        .toHaveBeenCalledWith({
          uid: args.uid,
          subscriptionId: args.subscriptionId,
          acceptLanguage: undefined,
          selectedLanguage: undefined,
        });
      expect(churnInterventionService.determineCancelChurnContentEligibility)
        .toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'no_churn_intervention_found',
        cmsOfferContent: null,
      });
    });

    it('returns none when currentInterval does not match current subscription plan interval', async () => {
      const args = {
        uid: 'uid_123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        offeringApiIdentifier: 'offer_123',
        currentInterval: SubplatInterval.Monthly,
        upgradeInterval: SubplatInterval.Yearly,
      };

      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      const raw = CancelInterstitialOfferResultFactory();
      const util = new CancelInterstitialOfferUtil(raw);
      jest.spyOn(productConfigurationManager, 'getCancelInterstitialOffer')
        .mockResolvedValue(util);

      jest.spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Yearly);

      jest.spyOn(churnInterventionService, 'determineCancelChurnContentEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
        });

      const result = await churnInterventionService.determineCancellationIntervention(args);

      expect(subscriptionManager.getSubscriptionStatus)
        .toHaveBeenCalledWith(args.customerId, args.subscriptionId);
      expect(productConfigurationManager.retrieveStripePrice).not.toHaveBeenCalled();

      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision', {
          type: 'none',
          reason: 'current_interval_mismatch',
      });

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'no_churn_intervention_found',
        cmsOfferContent: null,
      });
    });

    it('returns none when there is no upgrade plan', async () => {
      const args = {
        uid: 'uid_123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        offeringApiIdentifier: 'offer_123',
        currentInterval: SubplatInterval.Monthly,
        upgradeInterval: SubplatInterval.Yearly,
      };

      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      const rawResult = CancelInterstitialOfferResultFactory();
      const util = new CancelInterstitialOfferUtil(rawResult);
      jest.spyOn(productConfigurationManager, 'getCancelInterstitialOffer')
        .mockResolvedValue(util);

      jest.spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);
      jest.spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockRejectedValue(new Error('error'));

      jest.spyOn(churnInterventionService, 'determineCancelChurnContentEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
        });

      const result = await churnInterventionService.determineCancellationIntervention(args);

      expect(subscriptionManager.getSubscriptionStatus)
        .toHaveBeenCalledWith(args.customerId, args.subscriptionId);
      expect(productConfigurationManager.retrieveStripePrice)
        .toHaveBeenCalledWith(args.offeringApiIdentifier, args.upgradeInterval);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision', {
          type: 'none',
          reason: 'no_upgrade_plan_found',
      });

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'no_churn_intervention_found',
        cmsOfferContent: null,
      });
    });

    it('returns none when customer is not eligible for the upgrade interval plan', async () => {
      const args = {
        uid: 'uid_123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        offeringApiIdentifier: 'offer_123',
        currentInterval: SubplatInterval.Monthly,
        upgradeInterval: SubplatInterval.Monthly,
      };

      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      const rawResult = CancelInterstitialOfferResultFactory();
      const util = new CancelInterstitialOfferUtil(rawResult);
      jest.spyOn(productConfigurationManager, 'getCancelInterstitialOffer')
        .mockResolvedValue(util);

      jest.spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);

      const mockPrice = StripeResponseFactory(StripePriceFactory());
      jest.spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(eligibilityService, 'checkEligibility')
        .mockResolvedValue({ subscriptionEligibilityResult: EligibilityStatus.SAME });

      jest.spyOn(churnInterventionService, 'determineCancelChurnContentEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
        });

      const result = await churnInterventionService.determineCancellationIntervention(args);

      expect(subscriptionManager.getSubscriptionStatus)
        .toHaveBeenCalledWith(args.customerId, args.subscriptionId);
      expect(productConfigurationManager.retrieveStripePrice)
        .toHaveBeenCalledWith(args.offeringApiIdentifier, args.upgradeInterval);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision', {
          type: 'none',
          reason: 'not_eligible_for_upgrade_interval',
        });

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'no_churn_intervention_found',
        cmsOfferContent: null,
      });
    });

    it('returns none with discount_already_applied when customer is not eligible to redeem', async () => {
      const args = {
        uid: 'uid_123',
        customerId: 'cus_123',
        subscriptionId: 'sub_123',
        offeringApiIdentifier: 'offer_123',
        currentInterval: SubplatInterval.Monthly,
        upgradeInterval: SubplatInterval.Yearly,
      };

      jest.spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      jest.spyOn(churnInterventionService, 'determineCancelInterstitialOfferEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_cancel_interstitial_offer_found',
          cmsCancelInterstitialOfferResult: null,
        });

      const raw = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(raw);
      const cmsEntry = ChurnInterventionByProductIdResultFactory({
        redemptionLimit: 1,
      });

      jest
        .spyOn(productConfigurationManager, 'getChurnInterventionBySubscription')
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([cmsEntry]);
      jest
        .spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(1);

      const result = await churnInterventionService.determineCancellationIntervention(args);

      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision', {
          type: 'none',
          reason: 'discount_already_applied',
        });

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'discount_already_applied',
        cmsOfferContent: null,
      });
    });
  });
});
