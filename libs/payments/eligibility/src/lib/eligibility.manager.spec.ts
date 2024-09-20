/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  PriceManager,
  StripeClient,
  StripeConfig,
  StripePrice,
  StripePriceFactory,
  StripePriceRecurringFactory,
  SubplatInterval,
} from '@fxa/payments/stripe';
import {
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
  StrapiEntityFactory,
} from '@fxa/shared/cms';
import { CartEligibilityStatus } from '@fxa/shared/db/mysql/account';

import { EligibilityManager } from './eligibility.manager';
import {
  OfferingComparison,
  OfferingOverlapProductResult,
} from './eligibility.types';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

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
    it('should return empty result', async () => {
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(
          new EligibilityContentByPlanIdsResultUtil([
            EligibilityContentByPlanIdsResultFactory(),
          ])
        );

      const result = await manager.getOfferingOverlap(['test'], [], 'test');
      expect(result).toHaveLength(0);
    });

    it('should return same offeringStripeProductIds as same comparison', async () => {
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil([]);
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      const mockOfferingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValue(mockOfferingResult);

      const result = await manager.getOfferingOverlap(
        [],
        ['prod_test'],
        'test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.SAME);
    });

    it('should return subgroup upgrade target offeringStripeProductIds as upgrade comparison', async () => {
      const mockOfferingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test3',
        subGroups: {
          data: [
            StrapiEntityFactory(
              EligibilitySubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                        countries: ['usa'],
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                        countries: ['usa'],
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test3',
                        countries: ['usa'],
                      })
                    ),
                  ],
                },
              })
            ),
          ],
        },
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil([]);
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValue(mockOfferingResult);

      const result = await manager.getOfferingOverlap(
        [],
        ['prod_test'],
        'test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.UPGRADE);
    });

    it('should return subgroup downgrade target offeringStripeProductIds as downgrade comparison', async () => {
      const mockOfferingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
        subGroups: {
          data: [
            StrapiEntityFactory(
              EligibilitySubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                        countries: ['usa'],
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                        countries: ['usa'],
                      })
                    ),
                  ],
                },
              })
            ),
          ],
        },
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil([]);
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValue(mockOfferingResult);

      const result = await manager.getOfferingOverlap(
        [],
        ['prod_test2'],
        'test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.DOWNGRADE);
    });

    it('should return same comparison for same priceId', async () => {
      const mockOfferingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      const existingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil([]);
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(mockOfferingResult)
        .mockReturnValueOnce(existingResult);

      const result = await manager.getOfferingOverlap(
        ['plan_test'],
        [],
        'plan_test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.SAME);
    });

    it('should return upgrade comparison for upgrade priceId', async () => {
      const mockOfferingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test2',
        subGroups: {
          data: [
            StrapiEntityFactory(
              EligibilitySubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                        countries: ['usa'],
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                        countries: ['usa'],
                      })
                    ),
                  ],
                },
              })
            ),
          ],
        },
      });
      const existingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil([]);
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(mockOfferingResult)
        .mockReturnValueOnce(existingResult);

      const result = await manager.getOfferingOverlap(
        ['plan_test'],
        [],
        'plan_test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.UPGRADE);
    });

    it('should return multiple comparisons in multiple subgroups', async () => {
      const mockOfferingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test2',
        subGroups: {
          data: [
            StrapiEntityFactory(
              EligibilitySubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                        countries: ['usa'],
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                        countries: ['usa'],
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test3',
                        countries: ['usa'],
                      })
                    ),
                  ],
                },
              })
            ),
            StrapiEntityFactory(
              EligibilitySubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                        countries: ['usa'],
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilitySubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                        countries: ['usa'],
                      })
                    ),
                  ],
                },
              })
            ),
          ],
        },
      });
      const existingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      const eligibilityContentByPlanIdsResultUtil =
        new EligibilityContentByPlanIdsResultUtil([]);
      jest
        .spyOn(productConfigurationManager, 'getPurchaseDetailsForEligibility')
        .mockResolvedValue(eligibilityContentByPlanIdsResultUtil);
      jest
        .spyOn(eligibilityContentByPlanIdsResultUtil, 'offeringForPlanId')
        .mockReturnValueOnce(mockOfferingResult)
        .mockReturnValueOnce(existingResult);

      const result = await manager.getOfferingOverlap(
        ['plan_test'],
        ['prod_test3'],
        'plan_test'
      );
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        comparison: OfferingComparison.DOWNGRADE,
        offeringProductId: 'prod_test3',
        type: 'offering',
      });
      expect(result[1]).toEqual({
        comparison: OfferingComparison.UPGRADE,
        priceId: 'plan_test',
        type: 'price',
      });
    });
  });

  describe('getProductIdOverlap', () => {
    it('should return empty result', async () => {
      const mockTargetOffering = EligibilityContentOfferingResultFactory();

      const result = manager.getProductIdOverlap([], mockTargetOffering);
      expect(result).toHaveLength(0);

      const result2 = manager.getProductIdOverlap(['test'], mockTargetOffering);
      expect(result2).toHaveLength(0);
    });

    it('should return same offeringStripeProductIds as same comparison', async () => {
      const mockProductId = 'prod_test';
      const mockTargetOfferingResult = EligibilityContentOfferingResultFactory({
        stripeProductId: mockProductId,
      });

      const result = manager.getProductIdOverlap(
        [mockProductId],
        mockTargetOfferingResult
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.SAME);
    });

    it('should return subgroup upgrade target offeringStripeProductIds as upgrade comparison', async () => {
      const mockTargetOfferingResult = EligibilityContentOfferingResultFactory({
        stripeProductId: 'prod_test3',
        subGroups: {
          data: [
            StrapiEntityFactory(
              EligibilityContentSubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test3',
                      })
                    ),
                  ],
                },
              })
            ),
          ],
        },
      });

      const result = manager.getProductIdOverlap(
        ['prod_test'],
        mockTargetOfferingResult
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.UPGRADE);
    });

    it('should return subgroup downgrade target offeringStripeProductIds as downgrade comparison', async () => {
      const mockTargetOfferingResult = EligibilityContentOfferingResultFactory({
        stripeProductId: 'prod_test',
        subGroups: {
          data: [
            StrapiEntityFactory(
              EligibilityContentSubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                      })
                    ),
                  ],
                },
              })
            ),
          ],
        },
      });

      const result = manager.getProductIdOverlap(
        ['prod_test2'],
        mockTargetOfferingResult
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.DOWNGRADE);
    });

    it('should return same comparison for same productId', async () => {
      const mockTargetOfferingResult = EligibilityContentOfferingResultFactory({
        stripeProductId: 'prod_test',
      });

      const result = manager.getProductIdOverlap(
        ['prod_test'],
        mockTargetOfferingResult
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.SAME);
    });

    it('should return upgrade comparison for upgrade priceId', async () => {
      const mockTargetOfferingResult = EligibilityContentOfferingResultFactory({
        stripeProductId: 'prod_test2',
        subGroups: {
          data: [
            StrapiEntityFactory(
              EligibilityContentSubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                      })
                    ),
                  ],
                },
              })
            ),
          ],
        },
      });
      const result = manager.getProductIdOverlap(
        ['prod_test'],
        mockTargetOfferingResult
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.UPGRADE);
    });

    it('should return multiple comparisons in multiple subgroups', async () => {
      const mockTargetOfferingResult = EligibilityContentOfferingResultFactory({
        stripeProductId: 'prod_test2',
        subGroups: {
          data: [
            StrapiEntityFactory(
              EligibilityContentSubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test3',
                      })
                    ),
                  ],
                },
              })
            ),
            StrapiEntityFactory(
              EligibilityContentSubgroupResultFactory({
                offerings: {
                  data: [
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test',
                      })
                    ),
                    StrapiEntityFactory(
                      EligibilityContentSubgroupOfferingResultFactory({
                        stripeProductId: 'prod_test2',
                      })
                    ),
                  ],
                },
              })
            ),
          ],
        },
      });
      const result = manager.getProductIdOverlap(
        ['prod_test2', 'prod_test3'],
        mockTargetOfferingResult
      );
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        comparison: OfferingComparison.SAME,
        offeringProductId: 'prod_test2',
        type: 'offering',
      });
      expect(result[1]).toEqual({
        comparison: OfferingComparison.DOWNGRADE,
        offeringProductId: 'prod_test3',
        type: 'offering',
      });
    });
  });

  describe('compareOverlap', () => {
    it('returns create status when there are no overlaps', async () => {
      const mockOverlapResult = [] as OfferingOverlapProductResult[];
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;
      const mockSubscribedPrices = [] as StripePrice[];

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        mockSubscribedPrices
      );
      expect(result).toEqual(CartEligibilityStatus.CREATE);
    });

    it('returns invalid when there are multiple existing overlap prices', async () => {
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          offeringProductId: 'prod_test1',
          type: 'offering',
        },
        {
          comparison: OfferingComparison.SAME,
          offeringProductId: 'prod_test2',
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];
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
      expect(result).toEqual(CartEligibilityStatus.INVALID);
    });

    it('returns downgrade when comparison is downgrade', async () => {
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.DOWNGRADE,
          offeringProductId: 'prod_test1',
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;
      const mockPrice = StripePriceFactory();
      const mockSubscribedPrices = [mockPrice];

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        mockSubscribedPrices
      );
      expect(result).toEqual(CartEligibilityStatus.DOWNGRADE);
    });

    it('returns invalid if there is no subscribed price with same productId as target price', async () => {
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          offeringProductId: 'prod_test1',
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];
      const mockTargetOffering = EligibilityContentOfferingResultFactory();
      const interval = SubplatInterval.Monthly;

      const mockPrice = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
        product: mockTargetOffering.stripeProductId,
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
      expect(result).toEqual(CartEligibilityStatus.INVALID);
    });

    it('returns invalid if subscribed price with same product id as target price', async () => {
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          offeringProductId: 'prod_test1',
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];
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
      expect(result).toEqual(CartEligibilityStatus.INVALID);
    });

    it('returns downgrade when target price interval is shorter than the subscribed price', async () => {
      const mockTargetOffering = EligibilityContentOfferingResultFactory({
        stripeProductId: 'prod_test1',
      });
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          offeringProductId: mockTargetOffering.stripeProductId,
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];
      const mockPrice1 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'year',
        }),
        product: mockTargetOffering.stripeProductId,
      });
      const mockPrice2 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
        product: mockTargetOffering.stripeProductId,
      });
      const interval = SubplatInterval.Monthly;

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice2);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        [mockPrice1]
      );
      expect(result).toEqual(CartEligibilityStatus.DOWNGRADE);
    });

    it('returns upgrade when comparison is upgrade', async () => {
      const mockTargetOffering = EligibilityContentOfferingResultFactory({
        stripeProductId: 'prod_test1',
      });
      const mockPrice1 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
        product: mockTargetOffering.stripeProductId,
      });
      const mockPrice2 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'year',
        }),
        product: mockTargetOffering.stripeProductId,
      });
      const interval = SubplatInterval.Yearly;
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.UPGRADE,
          offeringProductId: mockTargetOffering.stripeProductId,
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice2);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        [mockPrice1]
      );
      expect(result).toEqual(CartEligibilityStatus.UPGRADE);
    });

    it('returns upgrade when target price interval is longer than the subscribed price', async () => {
      const mockTargetOffering = EligibilityContentOfferingResultFactory({
        stripeProductId: 'prod_test1',
      });
      const interval = SubplatInterval.Monthly;
      const mockPrice1 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'month',
        }),
        product: mockTargetOffering.stripeProductId,
      });
      const mockPrice2 = StripePriceFactory({
        recurring: StripePriceRecurringFactory({
          interval: 'year',
        }),
        product: mockTargetOffering.stripeProductId,
      });
      const mockOverlapResult = [
        {
          comparison: OfferingComparison.SAME,
          offeringProductId: mockTargetOffering.stripeProductId,
          type: 'offering',
        },
      ] as OfferingOverlapProductResult[];

      jest
        .spyOn(priceManager, 'retrieveByInterval')
        .mockResolvedValue(mockPrice2);

      const result = await manager.compareOverlap(
        mockOverlapResult,
        mockTargetOffering,
        interval,
        [mockPrice1]
      );
      expect(result).toEqual(CartEligibilityStatus.UPGRADE);
    });
  });
});
