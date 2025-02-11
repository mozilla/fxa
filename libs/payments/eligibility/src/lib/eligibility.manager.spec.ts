/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { PriceManager, SubplatInterval } from '@fxa/payments/customer';
import {
  StripeClient,
  StripeConfig,
  StripePrice,
  StripePriceFactory,
  StripePriceRecurringFactory,
} from '@fxa/payments/stripe';
import {
  EligibilityContentByOfferingResultFactory,
  EligibilityContentByOfferingResultUtil,
  EligibilityContentByPlanIdsResultFactory,
  EligibilityContentByPlanIdsResultUtil,
  EligibilityContentOfferingResultFactory,
  EligibilityContentSubgroupOfferingResultFactory,
  EligibilityContentSubgroupResultFactory,
  EligibilityOfferingResultFactory,
  EligibilitySubgroupOfferingResultFactory,
  EligibilitySubgroupResultFactory,
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { CartEligibilityStatus } from '@fxa/shared/db/mysql/account';

import { EligibilityManager } from './eligibility.manager';
import { OfferingComparison, OfferingOverlapResult } from './eligibility.types';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { faker } from '@faker-js/faker';

describe('EligibilityManager', () => {
  let manager: EligibilityManager;
  let priceManager: PriceManager;
  let productConfigurationManager: ProductConfigurationManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStrapiClientConfigProvider,
        EligibilityManager,
        MockFirestoreProvider,
        MockStatsDProvider,
        PriceManager,
        ProductConfigurationManager,
        StripeClient,
        StripeConfig,
        StrapiClient,
      ],
    }).compile();

    priceManager = module.get(PriceManager);
    productConfigurationManager = module.get(ProductConfigurationManager);
    manager = module.get(EligibilityManager);
  });

  describe('getOfferingOverlap', () => {
    it('should return empty result when no target offering is found', async () => {
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(
          new EligibilityContentByPlanIdsResultUtil(
            EligibilityContentByPlanIdsResultFactory()
          )
        );

      const result = await manager.getOfferingOverlap({
        priceIds: [faker.string.uuid()],
        targetPriceId: faker.string.uuid(),
      });
      expect(result).toHaveLength(0);
    });

    it('should return empty result when targetOffering or targetPriceId not provided', async () => {
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil({ purchases: [] });

      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);

      const result = await manager.getOfferingOverlap({
        priceIds: [faker.string.uuid()],
      });
      expect(result).toHaveLength(0);
    });

    it('should return empty result when no from offering is found', async () => {
      const targetOfferingId = faker.string.uuid();
      const targetOffering = EligibilityOfferingResultFactory({
        apiIdentifier: targetOfferingId,
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil({ purchases: [] });
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(targetOffering);

      const result = await manager.getOfferingOverlap({
        priceIds: [faker.string.uuid()],
        targetPriceId: faker.string.uuid(),
      });
      expect(result).toHaveLength(0);
    });

    it('should return empty result when no overlaps are found between offerings', async () => {
      const targetOfferingId = faker.string.uuid();
      const fromOfferingId = faker.string.uuid();
      const targetOffering = EligibilityOfferingResultFactory({
        apiIdentifier: targetOfferingId,
        subGroups: [
          EligibilitySubgroupResultFactory({
            offerings: [
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: faker.string.uuid(),
              }),
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: faker.string.uuid(),
              }),
            ],
          }),
        ],
      });
      const fromOffering = EligibilityOfferingResultFactory({
        apiIdentifier: fromOfferingId,
        subGroups: [
          EligibilitySubgroupResultFactory({
            offerings: [
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: faker.string.uuid(),
              }),
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: faker.string.uuid(),
              }),
            ],
          }),
        ],
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil({ purchases: [] });
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(targetOffering)
        .mockReturnValueOnce(fromOffering);

      const result = await manager.getOfferingOverlap({
        priceIds: [faker.string.uuid()],
        targetPriceId: faker.string.uuid(),
      });
      expect(result).toHaveLength(0);
    });

    it('should return same comparison for same priceId', async () => {
      const targetOfferingId = faker.string.uuid();
      const fromOfferingId = targetOfferingId;
      const targetOffering = EligibilityOfferingResultFactory({
        apiIdentifier: targetOfferingId,
      });
      const fromOffering = EligibilityOfferingResultFactory({
        apiIdentifier: fromOfferingId,
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil({ purchases: [] });
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(targetOffering)
        .mockReturnValueOnce(fromOffering);

      const priceId = faker.string.uuid();
      const result = await manager.getOfferingOverlap({
        priceIds: [priceId],
        targetPriceId: priceId,
      });
      expect(
        productConfigurationManager.getPurchaseDetailsForEligibility
      ).toHaveBeenCalledWith([priceId]);
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.SAME);
    });

    it('should return same comparison for same price from offeringConfigId', async () => {
      const targetOfferingId = faker.string.uuid();
      const fromOfferingId = targetOfferingId;
      const targetOffering = EligibilityContentOfferingResultFactory({
        apiIdentifier: targetOfferingId,
      });
      const fromOffering = EligibilityOfferingResultFactory({
        apiIdentifier: fromOfferingId,
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil({ purchases: [] });

      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(
          new EligibilityContentByOfferingResultUtil(
            EligibilityContentByOfferingResultFactory({
              offerings: [targetOffering],
            })
          )
        );
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(fromOffering);

      const priceId = faker.string.uuid();
      const result = await manager.getOfferingOverlap({
        priceIds: [priceId],
        targetOffering: targetOffering,
      });
      expect(
        productConfigurationManager.getPurchaseDetailsForEligibility
      ).toHaveBeenCalledWith([priceId]);
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.SAME);
    });

    it('should return upgrade comparison for upgrade priceId', async () => {
      const targetOfferingId = faker.string.uuid();
      const fromOfferingId = faker.string.uuid();
      const targetOffering = EligibilityOfferingResultFactory({
        apiIdentifier: targetOfferingId,
        subGroups: [
          EligibilitySubgroupResultFactory({
            offerings: [
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: fromOfferingId,
              }),
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: targetOfferingId,
              }),
            ],
          }),
        ],
      });
      const fromOffering = EligibilityOfferingResultFactory({
        apiIdentifier: fromOfferingId,
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil({ purchases: [] });
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(targetOffering)
        .mockReturnValueOnce(fromOffering);

      const targetPriceId = faker.string.uuid();
      const fromPriceId = faker.string.uuid();
      const result = await manager.getOfferingOverlap({
        priceIds: [fromPriceId],
        targetPriceId,
      });
      expect(
        productConfigurationManager.getPurchaseDetailsForEligibility
      ).toHaveBeenCalledWith([fromPriceId, targetPriceId]);
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.UPGRADE);
    });

    it('should return upgrade comparison for upgrade - targetOffering', async () => {
      const targetOfferingId = faker.string.uuid();
      const fromOfferingId = faker.string.uuid();
      const targetOffering = EligibilityContentOfferingResultFactory({
        apiIdentifier: targetOfferingId,
        subGroups: [
          EligibilityContentSubgroupResultFactory({
            offerings: [
              EligibilityContentSubgroupOfferingResultFactory({
                apiIdentifier: fromOfferingId,
              }),
              EligibilityContentSubgroupOfferingResultFactory({
                apiIdentifier: targetOfferingId,
              }),
            ],
          }),
        ],
      });
      const fromOffering = EligibilityOfferingResultFactory({
        apiIdentifier: fromOfferingId,
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil({ purchases: [] });

      jest
        .spyOn(productConfigurationManager, 'getEligibilityContentByOffering')
        .mockResolvedValue(
          new EligibilityContentByOfferingResultUtil(
            EligibilityContentByOfferingResultFactory({
              offerings: [targetOffering],
            })
          )
        );
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(fromOffering);

      const fromPriceId = faker.string.uuid();
      const result = await manager.getOfferingOverlap({
        priceIds: [fromPriceId],
        targetOffering: targetOffering,
      });
      expect(
        productConfigurationManager.getPurchaseDetailsForEligibility
      ).toHaveBeenCalledWith([fromPriceId]);
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.UPGRADE);
    });

    it('should return multiple comparisons in multiple subgroups', async () => {
      const targetOfferingId = faker.string.uuid();
      const fromOfferingId1 = faker.string.uuid();
      const fromOfferingId2 = faker.string.uuid();
      const targetOffering = EligibilityOfferingResultFactory({
        apiIdentifier: targetOfferingId,
        subGroups: [
          EligibilitySubgroupResultFactory({
            offerings: [
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: faker.string.uuid(),
              }),
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: targetOfferingId,
              }),
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: fromOfferingId1,
              }),
            ],
          }),
          EligibilitySubgroupResultFactory({
            offerings: [
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: fromOfferingId2,
              }),
              EligibilitySubgroupOfferingResultFactory({
                apiIdentifier: targetOfferingId,
              }),
            ],
          }),
        ],
      });
      const fromOffering1 = EligibilityOfferingResultFactory({
        apiIdentifier: fromOfferingId1,
      });
      const fromOffering2 = EligibilityOfferingResultFactory({
        apiIdentifier: fromOfferingId2,
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil({ purchases: [] });
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(targetOffering)
        .mockReturnValueOnce(fromOffering1)
        .mockReturnValueOnce(fromOffering2);

      const targetPriceId = faker.string.uuid();
      const fromPriceId1 = faker.string.uuid();
      const fromPriceId2 = faker.string.uuid();
      const result = await manager.getOfferingOverlap({
        priceIds: [fromPriceId1, fromPriceId2],
        targetPriceId,
      });
      expect(
        productConfigurationManager.getPurchaseDetailsForEligibility
      ).toHaveBeenCalledWith([fromPriceId1, fromPriceId2, targetPriceId]);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        comparison: OfferingComparison.DOWNGRADE,
        priceId: fromPriceId1,
        fromOfferingId: fromOffering1.apiIdentifier,
      });
      expect(result[1]).toEqual({
        comparison: OfferingComparison.UPGRADE,
        priceId: fromPriceId2,
        fromOfferingId: fromOffering2.apiIdentifier,
      });
    });
  });

  describe('compareOverlap', () => {
    it('returns create status when there are no overlaps', async () => {
      const mockOverlapResult = [] as OfferingOverlapResult[];
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;
      const mockSubscribedPrices = [] as StripePrice[];

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        mockSubscribedPrices
      );
      expect(result.subscriptionEligibilityResult).toEqual(
        CartEligibilityStatus.CREATE
      );
    });

    it('returns invalid when there are multiple existing overlap prices', async () => {
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          priceId: 'prod_test1',
        },
        {
          comparison: OfferingComparison.SAME,
          priceId: 'prod_test2',
        },
      ] as OfferingOverlapResult[];
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;
      const mockPrice = StripePriceFactory();
      const mockSubscribedPrices = [mockPrice, mockPrice];

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        mockSubscribedPrices
      );
      expect(result.subscriptionEligibilityResult).toEqual(
        CartEligibilityStatus.INVALID
      );
    });

    it('returns downgrade when comparison is downgrade', async () => {
      const mockFromOffering = EligibilityContentOfferingResultFactory();
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;
      const mockFromPrice = StripePriceFactory();
      const mockTargetPrice = StripePriceFactory();
      const mockSubscribedPrices = [mockFromPrice];
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.DOWNGRADE,
          priceId: mockFromPrice.id,
          fromOfferingId: mockFromOffering.apiIdentifier,
        },
      ] as OfferingOverlapResult[];

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockTargetPrice);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        mockSubscribedPrices
      );
      expect(result).toEqual({
        subscriptionEligibilityResult: CartEligibilityStatus.DOWNGRADE,
        fromOfferingConfigId: mockFromOffering.apiIdentifier,
        fromPrice: mockFromPrice,
      });
    });

    it('returns invalid if there is no matching subscribed price for the passed overlap', async () => {
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          priceId: 'price_test1',
        },
      ] as OfferingOverlapResult[];
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;

      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
        id: faker.string.uuid(), // Does not match priceId from overlap
      });

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        []
      );
      expect(result.subscriptionEligibilityResult).toEqual(
        CartEligibilityStatus.INVALID
      );
    });

    it('returns invalid if subscribed price with same id as target price', async () => {
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          priceId: 'prod_test1',
        },
      ] as OfferingOverlapResult[];
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;
      const mockPrice = StripePriceFactory();

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        [mockPrice]
      );
      expect(result.subscriptionEligibilityResult).toEqual(
        CartEligibilityStatus.INVALID
      );
    });

    it('returns downgrade when target price interval is shorter than the subscribed price', async () => {
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const mockFromPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'year',
        }),
      });
      const mockTargetPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
      });
      const interval = SubplatInterval.Monthly;
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          priceId: mockFromPrice.id,
          fromOfferingId: mockTargetOffering.apiIdentifier,
        },
      ] as OfferingOverlapResult[];

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockTargetPrice);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        [mockFromPrice]
      );
      expect(result).toEqual({
        subscriptionEligibilityResult: CartEligibilityStatus.DOWNGRADE,
        fromOfferingConfigId: mockTargetOffering.apiIdentifier,
        fromPrice: mockFromPrice,
      });
    });

    it('returns upgrade when comparison is upgrade', async () => {
      const mockCurrentOffering = EligibilityContentOfferingResultFactory();
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const mockPrice1 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
      });
      const mockPrice2 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'year',
        }),
      });
      const interval = SubplatInterval.Yearly;
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.UPGRADE,
          priceId: mockPrice1.id,
          fromOfferingId: mockCurrentOffering.apiIdentifier,
        },
      ] as OfferingOverlapResult[];

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice2);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        [mockPrice1]
      );
      expect(result).toEqual({
        subscriptionEligibilityResult: CartEligibilityStatus.UPGRADE,
        fromPrice: mockPrice1,
        fromOfferingConfigId: mockCurrentOffering.apiIdentifier,
      });
    });

    it('returns upgrade when target price interval is longer than the subscribed price', async () => {
      const mockFromOfferingId = faker.string.uuid();
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;
      const mockFromPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
      });
      const mockTargetPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'year',
        }),
      });
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          priceId: mockFromPrice.id,
          fromOfferingId: mockFromOfferingId,
        },
      ] as OfferingOverlapResult[];

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockTargetPrice);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        [mockFromPrice]
      );
      expect(result).toEqual({
        subscriptionEligibilityResult: CartEligibilityStatus.UPGRADE,
        fromPrice: mockFromPrice,
        fromOfferingConfigId: mockFromOfferingId,
      });
    });
  });
});
