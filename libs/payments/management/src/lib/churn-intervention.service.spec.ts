/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  ChurnInterventionConfig,
  ChurnInterventionManager,
  ChurnInterventionEntryFactory,
} from '@fxa/payments/cart';
import { SubplatInterval, SubscriptionManager } from '@fxa/payments/customer';
import {
  EligibilityService,
  EligibilityStatus,
} from '@fxa/payments/eligibility';
import {
  StripeSubscriptionFactory,
  StripeResponseFactory,
  StripePriceFactory,
  StripeClient,
  MockStripeConfigProvider,
  AccountCustomerManager,
  ResultAccountCustomerFactory,
  StripeCustomerFactory,
  StripeSubscriptionItemFactory,
  StripeApiListFactory,
  StripePriceRecurringFactory,
} from '@fxa/payments/stripe';
import {
  MockProfileClientConfigProvider,
  ProfileClient,
} from '@fxa/profile/client';
import {
  ChurnInterventionByProductIdResultFactory,
  ChurnInterventionByProductIdRawResultFactory,
  ChurnInterventionByProductIdResultUtil,
  CmsOfferingContentFactory,
  ProductConfigurationManager,
  PageContentByPriceIdsResultUtil,
  PageContentByPriceIdsPurchaseResultFactory,
  CancelInterstitialOfferTransformedFactory,
  CancelInterstitialOfferResultFactory,
  CancelInterstitialOfferUtil,
} from '@fxa/shared/cms';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import {
  MockNotifierSnsConfigProvider,
  NotifierService,
  NotifierSnsProvider,
} from '@fxa/shared/notifier';
import { ChurnInterventionService } from './churn-intervention.service';

describe('ChurnInterventionService', () => {
  let accountCustomerManager: AccountCustomerManager;
  let churnInterventionService: ChurnInterventionService;
  let churnInterventionManager: ChurnInterventionManager;
  let productConfigurationManager: ProductConfigurationManager;
  let eligibilityService: EligibilityService;
  let privateCustomerChanged: any;
  let subscriptionManager: SubscriptionManager;

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

  const mockChurnInterventionConfig = {
    collectionName: 'churn-interventions',
    enabled: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ChurnInterventionService,
        {
          provide: ChurnInterventionConfig,
          useValue: mockChurnInterventionConfig,
        },
        {
          provide: EligibilityService,
          useValue: {
            checkEligibility: jest.fn(),
          },
        },
        {
          provide: ChurnInterventionManager,
          useValue: {
            getOrCreateEntry: jest.fn(),
            getRedemptionCountForUid: jest.fn(),
            updateEntry: jest.fn(),
          },
        },
        {
          provide: ProductConfigurationManager,
          useValue: {
            getChurnInterventionBySubscription: jest.fn(),
            getChurnIntervention: jest.fn(),
            getCancelInterstitialOffer: jest.fn(),
            getPageContentByPriceIds: jest.fn(),
            getSubplatIntervalBySubscription: jest.fn(),
            retrieveStripePrice: jest.fn(),
          },
        },
        {
          provide: StatsDService,
          useValue: mockStatsD,
        },
        AccountCustomerManager,
        MockAccountDatabaseNestFactory,
        MockNotifierSnsConfigProvider,
        MockProfileClientConfigProvider,
        NotifierService,
        NotifierSnsProvider,
        ProfileClient,
        SubscriptionManager,
        StripeClient,
        MockStripeConfigProvider,
        { provide: Logger, useValue: mockLogger },
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    churnInterventionService = moduleRef.get(ChurnInterventionService);
    churnInterventionManager = moduleRef.get(ChurnInterventionManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    eligibilityService = moduleRef.get(EligibilityService);
    privateCustomerChanged = jest
      .spyOn(churnInterventionService as any, 'customerChanged')
      .mockResolvedValue({});
  });

  describe('getChurnInterventionForCustomerId', () => {
    const mockEntry = ChurnInterventionEntryFactory();

    it('returns the churn intervention entry', async () => {
      jest
        .spyOn(churnInterventionManager, 'getOrCreateEntry')
        .mockResolvedValue(mockEntry);
      const result =
        await churnInterventionService.getChurnInterventionForCustomerId(
          mockEntry.customerId,
          mockEntry.churnInterventionId
        );

      expect(churnInterventionManager.getOrCreateEntry).toHaveBeenCalledWith(
        mockEntry.customerId,
        mockEntry.churnInterventionId
      );
      expect(result).toEqual(mockEntry);
    });
  });

  describe('determineStaySubscribedEligibility', () => {
    const uid = 'uid_123';
    const subscriptionId = 'sub_123';

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns ineligible when customer does not match subscription', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);

      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscriptionId
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'customer_mismatch',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: null,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'stay_subscribed_eligibility',
        {
          eligibility: 'ineligible',
          reason: 'customer_mismatch',
        }
      );
    });

    it('returns ineligible when no churn intervention entries are found', async () => {
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: true });
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([]);

      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscriptionId
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'no_churn_intervention_found',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: mockCmsOfferingContent,
      });
    });

    it('returns ineligible when coupon is already applied to subscription', async () => {
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory({
        churnInterventionId: 'churn_id',
        redemptionLimit: 2,
      });

      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: true });
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);
      jest
        .spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(1);
      jest.spyOn(subscriptionManager, 'hasCouponId').mockResolvedValue(true);

      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscriptionId
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'discount_already_applied',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: mockCmsOfferingContent,
      });
    });

    it('returns ineligible when redemption limit reached', async () => {
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory({
        churnInterventionId: 'churn_id',
        redemptionLimit: 1,
      });

      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: true });
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);
      jest
        .spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(1);

      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscriptionId
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'redemption_limit_exceeded',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: mockCmsOfferingContent,
      });
    });

    it('returns ineligible when subscription is not active', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();

      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: false, cancelAtPeriodEnd: false });

      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscriptionId
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'subscription_not_active',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: mockCmsOfferingContent,
      });
    });

    it('returns ineligible when subscription is still active', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory();
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });

      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscriptionId
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'subscription_still_active',
        cmsChurnInterventionEntry: mockCmsChurnEntry,
        cmsOfferingContent: mockCmsOfferingContent,
      });
    });

    it('returns eligible on success', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);

      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory();
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(0);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: true });
      jest.spyOn(subscriptionManager, 'hasCouponId').mockResolvedValue(false);

      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscriptionId
        );

      expect(result).toEqual({
        isEligible: true,
        reason: 'eligible',
        cmsChurnInterventionEntry: mockCmsChurnEntry,
        cmsOfferingContent: null,
      });
    });

    it('returns general_error for general errors', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({ active: true, cancelAtPeriodEnd: false });
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockRejectedValue(new Error('error'));

      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          uid,
          subscriptionId
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'general_error',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: null,
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('redeemChurnCoupon', () => {
    const mockUid = faker.string.uuid();
    const mockStripeCustomer = StripeCustomerFactory();
    const mockAccountCustomer = ResultAccountCustomerFactory({
      uid: mockUid,
      stripeCustomerId: mockStripeCustomer.id,
    });
    const mockSubscription = StripeResponseFactory(
      StripeSubscriptionFactory({
        customer: mockStripeCustomer.id,
      })
    );
    const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory();
    const mockChurnInterventionEntry = ChurnInterventionEntryFactory({
      customerId: mockStripeCustomer.id,
    });

    it('successfully redeems a churn coupon', async () => {
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockCmsChurnEntry,
          cmsOfferingContent: null,
        });

      const updatedSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          id: mockSubscription.id,
          cancel_at_period_end: false,
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);

      jest
        .spyOn(subscriptionManager, 'resubscribeWithCoupon')
        .mockResolvedValue(updatedSubscription);
      privateCustomerChanged = jest
        .spyOn(churnInterventionService as any, 'customerChanged')
        .mockResolvedValue({});

      const prevCount = mockChurnInterventionEntry.redemptionCount || 0;

      const updatedEntry = ChurnInterventionEntryFactory({
        ...mockChurnInterventionEntry,
        customerId: mockChurnInterventionEntry.customerId,
        churnInterventionId: mockChurnInterventionEntry.churnInterventionId,
        redemptionCount: prevCount + 1,
      });
      jest
        .spyOn(churnInterventionManager, 'updateEntry')
        .mockResolvedValue(updatedEntry);

      const result = await churnInterventionService.redeemChurnCoupon(
        mockUid,
        mockSubscription.id,
        'stay_subscribed'
      );

      expect(
        jest.spyOn(subscriptionManager, 'resubscribeWithCoupon')
      ).toHaveBeenCalledWith({
        customerId: mockChurnInterventionEntry.customerId,
        subscriptionId: mockSubscription.id,
        stripeCouponId: mockCmsChurnEntry.stripeCouponId,
      });

      expect(
        jest.spyOn(churnInterventionManager, 'updateEntry')
      ).toHaveBeenCalledWith(mockUid, mockCmsChurnEntry.churnInterventionId, 1);
      expect(result.updatedChurnInterventionEntryData?.redemptionCount).toBe(
        prevCount + 1
      );
      expect(privateCustomerChanged).toHaveBeenCalledWith(mockUid);

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
          cmsOfferingContent: null,
        });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'resubscribeWithCoupon')
        .mockRejectedValue(new Error('Stripe error'));

      const result = await churnInterventionService.redeemChurnCoupon(
        mockUid,
        mockSubscription.id,
        'stay_subscribed'
      );

      expect(
        jest.spyOn(subscriptionManager, 'resubscribeWithCoupon')
      ).toHaveBeenCalledWith({
        customerId: mockChurnInterventionEntry.customerId,
        subscriptionId: mockSubscription.id,
        stripeCouponId: mockCmsChurnEntry.stripeCouponId,
      });

      expect(
        jest.spyOn(churnInterventionManager, 'updateEntry')
      ).not.toHaveBeenCalled();
      expect(result).toEqual({
        redeemed: false,
        reason: 'failed_to_redeem_coupon',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: mockCmsChurnEntry,
      });
    });

    it('fails to redeem a churn coupon when not eligible', async () => {
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'redemption_limit_exceeded',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: mockCmsOfferingContent,
        });

      const result = await churnInterventionService.redeemChurnCoupon(
        mockUid,
        mockSubscription.id,
        'stay_subscribed'
      );

      expect(
        jest.spyOn(subscriptionManager, 'resubscribeWithCoupon')
      ).not.toHaveBeenCalled();

      expect(
        jest.spyOn(churnInterventionManager, 'updateEntry')
      ).not.toHaveBeenCalled();
      expect(result).toEqual({
        redeemed: false,
        reason: 'redemption_limit_exceeded',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: null,
      });
    });

    it('fails to redeem a churn coupon when resubscribeWithCoupon fails', async () => {
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockCmsChurnEntry,
          cmsOfferingContent: null,
        });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'resubscribeWithCoupon')
        .mockResolvedValue(null);

      const result = await churnInterventionService.redeemChurnCoupon(
        mockUid,
        mockSubscription.id,
        'stay_subscribed'
      );

      expect(
        jest.spyOn(subscriptionManager, 'resubscribeWithCoupon')
      ).toHaveBeenCalledWith({
        customerId: mockChurnInterventionEntry.customerId,
        subscriptionId: mockSubscription.id,
        stripeCouponId: mockCmsChurnEntry.stripeCouponId,
      });

      expect(
        jest.spyOn(churnInterventionManager, 'updateEntry')
      ).not.toHaveBeenCalled();
      expect(result).toEqual({
        redeemed: false,
        reason: 'stripe_subscription_update_failed',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: mockCmsChurnEntry,
      });
    });

    it('returns redeemed true and does not increment redemption when coupon already applied', async () => {
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockCmsChurnEntry,
          cmsOfferingContent: null,
        });
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);

      jest.spyOn(subscriptionManager, 'hasCouponId').mockResolvedValue(true);

      const result = await churnInterventionService.redeemChurnCoupon(
        mockUid,
        mockSubscription.id,
        'stay_subscribed'
      );

      expect(result).toEqual({
        redeemed: true,
        reason: 'discount_already_applied',
        updatedChurnInterventionEntryData: null,
        cmsChurnInterventionEntry: mockCmsChurnEntry,
      });

      expect(
        jest.spyOn(subscriptionManager, 'resubscribeWithCoupon')
      ).not.toHaveBeenCalled();

      expect(
        jest.spyOn(churnInterventionManager, 'updateEntry')
      ).not.toHaveBeenCalled();
    });
  });

  describe('determineCancellationIntervention', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    const mockStripeCustomer = StripeCustomerFactory();
    const mockSubscription = StripeResponseFactory(
      StripeSubscriptionFactory({
        customer: mockStripeCustomer.id,
      })
    );
    const args = {
      uid: 'uid_123',
      subscriptionId: mockSubscription.id,
    };

    it('returns cancel_interstitial_offer when one exists', async () => {
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelChurnContentEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        });

      const mockCancelInterstitialOffer =
        CancelInterstitialOfferTransformedFactory();
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();

      jest
        .spyOn(
          churnInterventionService,
          'determineCancelInterstitialOfferEligibility'
        )
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsCancelInterstitialOfferResult: mockCancelInterstitialOffer,
          webIcon: mockPurchaseResult.purchaseDetails.webIcon,
          productName: mockPurchaseResult.purchaseDetails.productName,
        });

      const result =
        await churnInterventionService.determineCancellationIntervention(args);

      expect(result).toEqual({
        cancelChurnInterventionType: 'cancel_interstitial_offer',
        reason: 'eligible',
        cmsOfferContent: mockCancelInterstitialOffer,
      });
    });

    it('returns cancel_churn_intervention when one exists', async () => {
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelInterstitialOfferEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_cancel_interstitial_offer_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon: mockPurchaseResult.purchaseDetails.webIcon,
          productName: mockPurchaseResult.purchaseDetails.productName,
        });

      const mockCmsOffer = ChurnInterventionByProductIdResultFactory();
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelChurnContentEligibility'
        )
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockCmsOffer,
          cmsOfferingContent: null,
        });

      const result =
        await churnInterventionService.determineCancellationIntervention(args);

      expect(result).toEqual({
        cancelChurnInterventionType: 'cancel_churn_intervention',
        reason: 'eligible',
        cmsOfferContent: mockCmsOffer,
      });
    });

    it('returns none when no cancel offers exist', async () => {
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelInterstitialOfferEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_cancel_interstitial_offer_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon: mockPurchaseResult.purchaseDetails.webIcon,
          productName: mockPurchaseResult.purchaseDetails.productName,
        });

      jest
        .spyOn(
          churnInterventionService,
          'determineCancelChurnContentEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        });

      const result =
        await churnInterventionService.determineCancellationIntervention(args);

      expect(
        churnInterventionService.determineCancelInterstitialOfferEligibility
      ).toHaveBeenCalledWith(args);
      expect(
        churnInterventionService.determineCancelInterstitialOfferEligibility
      ).toHaveBeenCalledTimes(1);

      expect(
        churnInterventionService.determineCancelChurnContentEligibility
      ).toHaveBeenCalledWith({
        uid: args.uid,
        subscriptionId: args.subscriptionId,
        acceptLanguage: undefined,
        selectedLanguage: undefined,
      });
      expect(
        churnInterventionService.determineCancelChurnContentEligibility
      ).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'no_churn_intervention_found',
        cmsOfferContent: null,
      });
    });

    it('returns none when there is no upgrade plan', async () => {
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelChurnContentEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        });
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelInterstitialOfferEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_upgrade_plan_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon: mockPurchaseResult.purchaseDetails.webIcon,
          productName: mockPurchaseResult.purchaseDetails.productName,
        });
      const result =
        await churnInterventionService.determineCancellationIntervention(args);

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'no_churn_intervention_found',
        cmsOfferContent: null,
      });
    });

    it('returns none when customer is not eligible for the upgrade interval plan', async () => {
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelChurnContentEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_churn_intervention_found',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        });
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelInterstitialOfferEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'not_eligible_for_upgrade_interval',
          cmsCancelInterstitialOfferResult: null,
          webIcon: mockPurchaseResult.purchaseDetails.webIcon,
          productName: mockPurchaseResult.purchaseDetails.productName,
        });

      const result =
        await churnInterventionService.determineCancellationIntervention(args);

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'no_churn_intervention_found',
        cmsOfferContent: null,
      });
    });

    it('returns none with discount_already_applied when customer is not eligible to redeem', async () => {
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelChurnContentEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'discount_already_applied',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        });

      jest
        .spyOn(
          churnInterventionService,
          'determineCancelInterstitialOfferEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_upgrade_plan_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon: mockPurchaseResult.purchaseDetails.webIcon,
          productName: mockPurchaseResult.purchaseDetails.productName,
        });

      const result =
        await churnInterventionService.determineCancellationIntervention(args);

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'discount_already_applied',
        cmsOfferContent: null,
      });
    });

    it('returns none with redemption_limit_exceeded when customer is not eligible to redeem', async () => {
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelInterstitialOfferEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'no_cancel_interstitial_offer_found',
          cmsCancelInterstitialOfferResult: null,
          webIcon: mockPurchaseResult.purchaseDetails.webIcon,
          productName: mockPurchaseResult.purchaseDetails.productName,
        });
      jest
        .spyOn(
          churnInterventionService,
          'determineCancelChurnContentEligibility'
        )
        .mockResolvedValue({
          isEligible: false,
          reason: 'redemption_limit_exceeded',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        });

      const result =
        await churnInterventionService.determineCancellationIntervention(args);

      expect(result).toEqual({
        cancelChurnInterventionType: 'none',
        reason: 'redemption_limit_exceeded',
        cmsOfferContent: null,
      });
    });
  });

  describe('determineCancelInterstitialOfferEligibility', () => {
    it('returns ineligible when customer does not match', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'customer_mismatch',
        cmsCancelInterstitialOfferResult: null,
        webIcon: null,
        productName: null,
      });
    });

    it('returns not eligible if subscription not active', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'canceled',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        mockPurchaseResult
      );
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: false,
          cancelAtPeriodEnd: false,
        });

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );
      expect(result).toEqual({
        isEligible: false,
        reason: 'subscription_not_active',
        cmsCancelInterstitialOfferResult: null,
        webIcon: mockPurchaseResult.purchaseDetails.webIcon,
        productName: mockPurchaseResult.purchaseDetails.productName,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'subscription_not_active',
        }
      );
    });

    it('returns not eligible if already canceling at period end', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        mockPurchaseResult
      );
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: true,
        });

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );
      expect(result).toEqual({
        isEligible: false,
        reason: 'already_canceling_at_period_end',
        cmsCancelInterstitialOfferResult: null,
        webIcon: mockPurchaseResult.purchaseDetails.webIcon,
        productName: mockPurchaseResult.purchaseDetails.productName,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'already_canceling_at_period_end',
        }
      );
    });

    it('returns not eligible if current interval not found', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        mockPurchaseResult
      );
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockRejectedValue(new Error());

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );
      expect(result).toEqual({
        isEligible: false,
        reason: 'current_interval_not_found',
        cmsCancelInterstitialOfferResult: null,
        webIcon: mockPurchaseResult.purchaseDetails.webIcon,
        productName: mockPurchaseResult.purchaseDetails.productName,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'current_interval_not_found',
        }
      );
    });

    it('returns not eligible if price id not found', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        id: undefined,
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'stripe_price_id_not_found',
        cmsCancelInterstitialOfferResult: null,
        webIcon: null,
        productName: null,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'stripe_price_id_not_found',
        }
      );
    });

    it('returns not eligible if offering id not found', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory({
        offering: undefined,
      });
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        mockPurchaseResult
      );

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'offering_id_not_found',
        cmsCancelInterstitialOfferResult: null,
        webIcon: mockPurchaseResult.purchaseDetails.webIcon,
        productName: mockPurchaseResult.purchaseDetails.productName,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'offering_id_not_found',
        }
      );
    });

    it('returns not eligible if no interstitial offer found', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        mockPurchaseResult
      );
      jest
        .spyOn(productConfigurationManager, 'getCancelInterstitialOffer')
        .mockResolvedValue({
          getTransformedResult: () => null,
        } as any);

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'no_cancel_interstitial_offer_found',
        cmsCancelInterstitialOfferResult: null,
        webIcon: mockPurchaseResult.purchaseDetails.webIcon,
        productName: mockPurchaseResult.purchaseDetails.productName,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'no_cancel_interstitial_offer_found',
        }
      );
    });

    it('returns not eligible if no upgrade plan found', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };
      const rawResult = CancelInterstitialOfferResultFactory();
      const util = new CancelInterstitialOfferUtil(rawResult);

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        mockPurchaseResult
      );
      jest
        .spyOn(productConfigurationManager, 'getCancelInterstitialOffer')
        .mockResolvedValue(util);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockRejectedValue(new Error('stripe price not found'));

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'no_upgrade_plan_found',
        cmsCancelInterstitialOfferResult: null,
        webIcon: mockPurchaseResult.purchaseDetails.webIcon,
        productName: mockPurchaseResult.purchaseDetails.productName,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'no_upgrade_plan_found',
        }
      );
    });

    it('returns not eligible if not eligible for upgrade', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };
      const rawResult = CancelInterstitialOfferResultFactory();
      const util = new CancelInterstitialOfferUtil(rawResult);
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        mockPurchaseResult
      );
      jest
        .spyOn(productConfigurationManager, 'getCancelInterstitialOffer')
        .mockResolvedValue(util);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.SAME,
      });

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );

      expect(result).toEqual({
        isEligible: false,
        reason: 'not_eligible_for_upgrade_interval',
        cmsCancelInterstitialOfferResult: null,
        webIcon: mockPurchaseResult.purchaseDetails.webIcon,
        productName: mockPurchaseResult.purchaseDetails.productName,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'not_eligible_for_upgrade_interval',
        }
      );
    });

    it('returns eligible for offer', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
          interval_count: 1,
        }),
      });
      const mockSubItem = StripeSubscriptionItemFactory({
        price: mockPrice,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          items: StripeApiListFactory([mockSubItem]),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };
      const rawResult = CancelInterstitialOfferResultFactory();
      const util = new CancelInterstitialOfferUtil(rawResult);
      const mockCancelInterstitialOffer =
        CancelInterstitialOfferTransformedFactory();
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(productConfigurationManager, 'getSubplatIntervalBySubscription')
        .mockResolvedValue(SubplatInterval.Monthly);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      const mockPurchaseResult = PageContentByPriceIdsPurchaseResultFactory();
      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        mockPurchaseResult
      );
      jest
        .spyOn(productConfigurationManager, 'getCancelInterstitialOffer')
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'getTransformedResult')
        .mockReturnValue(mockCancelInterstitialOffer);
      jest
        .spyOn(productConfigurationManager, 'retrieveStripePrice')
        .mockResolvedValue(mockPrice);
      jest.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
        subscriptionEligibilityResult: EligibilityStatus.UPGRADE,
        fromOfferingConfigId: 'string',
        fromPrice: mockPrice,
      });

      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: mockUid,
            subscriptionId: mockSubscription.id,
          }
        );

      expect(result).toEqual({
        isEligible: true,
        reason: 'eligible',
        cmsCancelInterstitialOfferResult: mockCancelInterstitialOffer,
        webIcon: mockPurchaseResult.purchaseDetails.webIcon,
        productName: mockPurchaseResult.purchaseDetails.productName,
      });
    });
  });

  describe('determineCancelChurnContentEligibility', () => {
    it('returns ineligible when customer does not match', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));

      const result =
        await churnInterventionService.determineCancelChurnContentEligibility({
          uid: mockUid,
          subscriptionId: mockSubscription.id,
        });

      expect(result).toEqual({
        isEligible: false,
        reason: 'customer_mismatch',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: null,
      });
    });

    it('returns not eligible if subscription not active', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'canceled',
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: false,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);

      const result =
        await churnInterventionService.determineCancelChurnContentEligibility({
          uid: mockUid,
          subscriptionId: mockSubscription.id,
        });

      expect(result).toEqual({
        isEligible: false,
        reason: 'subscription_not_active',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: mockCmsOfferingContent,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'subscription_not_active',
        }
      );
    });

    it('returns not eligible if already canceling at period end', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory();

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: true,
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);

      const result =
        await churnInterventionService.determineCancelChurnContentEligibility({
          uid: mockUid,
          subscriptionId: mockSubscription.id,
        });

      expect(result).toEqual({
        isEligible: false,
        reason: 'already_canceling_at_period_end',
        cmsChurnInterventionEntry: mockCmsChurnEntry,
        cmsOfferingContent: mockCmsOfferingContent,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'already_canceling_at_period_end',
        }
      );
    });

    it('returns not eligible if no churn intervention found', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([]);

      const result =
        await churnInterventionService.determineCancelChurnContentEligibility({
          uid: mockUid,
          subscriptionId: mockSubscription.id,
        });

      expect(result).toEqual({
        isEligible: false,
        reason: 'no_churn_intervention_found',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: mockCmsOfferingContent,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'no_churn_intervention_found',
        }
      );
    });

    it('returns not eligible if redemption limit exceeded', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory({
        churnInterventionId: 'churn_id',
        redemptionLimit: 1,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);
      jest
        .spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(1);

      const result =
        await churnInterventionService.determineCancelChurnContentEligibility({
          uid: mockUid,
          subscriptionId: mockSubscription.id,
        });

      expect(result).toEqual({
        isEligible: false,
        reason: 'redemption_limit_exceeded',
        cmsChurnInterventionEntry: null,
        cmsOfferingContent: mockCmsOfferingContent,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'redemption_limit_exceeded',
        }
      );
    });

    it('returns not eligible if discount already applied', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory({
        churnInterventionId: 'churn_id',
        redemptionLimit: 4,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);
      jest
        .spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(1);
      jest.spyOn(subscriptionManager, 'hasCouponId').mockResolvedValue(true);

      const result =
        await churnInterventionService.determineCancelChurnContentEligibility({
          uid: mockUid,
          subscriptionId: mockSubscription.id,
        });

      expect(result).toEqual({
        isEligible: false,
        reason: 'discount_already_applied',
        cmsChurnInterventionEntry: mockCmsChurnEntry,
        cmsOfferingContent: mockCmsOfferingContent,
      });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'cancel_intervention_decision',
        {
          type: 'none',
          reason: 'discount_already_applied',
        }
      );
    });

    it('returns eligible for churn intervention', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const rawResult = ChurnInterventionByProductIdRawResultFactory();
      const util = new ChurnInterventionByProductIdResultUtil(rawResult);
      const mockCmsOfferingContent = CmsOfferingContentFactory();
      const mockCmsChurnEntry = ChurnInterventionByProductIdResultFactory({
        churnInterventionId: 'churn_id',
        redemptionLimit: 4,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(mockSubscription));
      jest
        .spyOn(subscriptionManager, 'getSubscriptionStatus')
        .mockResolvedValue({
          active: true,
          cancelAtPeriodEnd: false,
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getChurnInterventionBySubscription'
        )
        .mockResolvedValue(util);
      jest
        .spyOn(util, 'cmsOfferingContent')
        .mockReturnValue(mockCmsOfferingContent);
      jest
        .spyOn(util, 'getTransformedChurnInterventionByProductId')
        .mockReturnValue([mockCmsChurnEntry]);
      jest
        .spyOn(churnInterventionManager, 'getRedemptionCountForUid')
        .mockResolvedValue(1);
      jest.spyOn(subscriptionManager, 'hasCouponId').mockResolvedValue(false);

      const result =
        await churnInterventionService.determineCancelChurnContentEligibility({
          uid: mockUid,
          subscriptionId: mockSubscription.id,
        });

      expect(result).toEqual({
        isEligible: true,
        reason: 'eligible',
        cmsChurnInterventionEntry: mockCmsChurnEntry,
        cmsOfferingContent: null,
      });
    });
  });

  describe('when feature is disabled', () => {
    beforeEach(() => {
      mockChurnInterventionConfig.enabled = false;
      jest.clearAllMocks();
    });

    afterEach(() => {
      mockChurnInterventionConfig.enabled = true;
    });

    it('returns feature_disabled when determineStaySubscribedEligibility is called', async () => {
      const result =
        await churnInterventionService.determineStaySubscribedEligibility(
          'uid_123',
          'sub_123',
          'en'
        );

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe('feature_disabled');
      expect(result.cmsChurnInterventionEntry).toBeNull();
      expect(result.cmsOfferingContent).toBeNull();
      expect(
        productConfigurationManager.getChurnInterventionBySubscription
      ).not.toHaveBeenCalled();
    });

    it('returns feature_disabled when redeemChurnCoupon is called', async () => {
      const result = await churnInterventionService.redeemChurnCoupon(
        'uid123',
        'sub_123',
        'stay_subscribed',
        'en'
      );

      expect(result.redeemed).toBe(false);
      expect(result.errorCode).toBe('feature_disabled');
    });

    it('determineCancellationIntervention returns none', async () => {
      const result =
        await churnInterventionService.determineCancellationIntervention({
          uid: 'uid123',
          subscriptionId: 'sub_123',
        });

      expect(result.cancelChurnInterventionType).toBe('none');
      expect(result.cmsOfferContent).toBeNull();
    });

    it('returns feature_disabled when determineCancelChurnContentEligibility is called', async () => {
      const result =
        await churnInterventionService.determineCancelChurnContentEligibility({
          uid: 'uid_123',
          subscriptionId: 'sub_123',
        });

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe('feature_disabled');
      expect(result.cmsChurnInterventionEntry).toBeNull();
      expect(
        productConfigurationManager.getChurnInterventionBySubscription
      ).not.toHaveBeenCalled();
    });

    it('returns feature_disabled when determineCancelInterstitialOfferEligibility is called', async () => {
      const result =
        await churnInterventionService.determineCancelInterstitialOfferEligibility(
          {
            uid: 'uid_123',
            subscriptionId: 'sub_123',
          }
        );

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe('feature_disabled');
      expect(result.cmsOfferContent).toBeNull();
      expect(result.cmsOfferingContent).toBeNull();
      expect(
        productConfigurationManager.getSubplatIntervalBySubscription
      ).not.toHaveBeenCalled();
    });

    it('returns empty array when getChurnInterventionForProduct is called', async () => {
      const result =
        await churnInterventionService.getChurnInterventionForProduct(
          SubplatInterval.Monthly,
          'cancel',
          'prod_123'
        );

      expect(result.churnInterventions).toEqual([]);
      expect(
        productConfigurationManager.getChurnIntervention
      ).not.toHaveBeenCalled();
    });
  });
});
