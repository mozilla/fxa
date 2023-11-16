/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import {
  ContentfulManager,
  EligibilityContentByPlanIdsResultUtil,
  EligibilityOfferingResultFactory,
  EligibilitySubgroupOfferingResultFactory,
  EligibilitySubgroupResultFactory,
} from '@fxa/shared/contentful';
import { EligibilityManager } from './eligibility.manager';
import { OfferingComparison } from './eligibility.types';

describe('EligibilityManager', () => {
  let manager: EligibilityManager;
  let mockContentfulManager: ContentfulManager;
  let mockResult: EligibilityContentByPlanIdsResultUtil;

  beforeEach(async () => {
    mockResult = {} as EligibilityContentByPlanIdsResultUtil;
    mockContentfulManager = {
      getPurchaseDetailsForEligibility: jest
        .fn()
        .mockResolvedValueOnce(mockResult),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ContentfulManager, useValue: mockContentfulManager },
        EligibilityManager,
      ],
    }).compile();

    manager = module.get<EligibilityManager>(EligibilityManager);
  });

  describe('getOfferingOverlap', () => {
    it('should return empty result', async () => {
      mockResult.offeringForPlanId = jest.fn().mockReturnValueOnce(undefined);
      const result = await manager.getOfferingOverlap(['test'], [], 'test');
      expect(result.length).toBe(0);
    });

    it('should return same offeringStripeProductIds as same comparison', async () => {
      const offeringResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      mockResult.offeringForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult);
      const result = await manager.getOfferingOverlap(
        [],
        ['prod_test'],
        'test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.SAME);
    });

    it('should return subgroup upgrade target offeringStripeProductIds as upgrade comparison', async () => {
      const offeringResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test2',
        linkedFrom: {
          subGroupCollection: {
            items: [
              EligibilitySubgroupResultFactory({
                offeringCollection: {
                  items: [
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test',
                      countries: ['usa'],
                    }),
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test2',
                      countries: ['usa'],
                    }),
                  ],
                },
              }),
            ],
          },
        },
      });
      mockResult.offeringForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult);
      const result = await manager.getOfferingOverlap(
        [],
        ['prod_test'],
        'test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.UPGRADE);
    });

    it('should return subgroup downgrade target offeringStripeProductIds as downgrade comparison', async () => {
      const offeringResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
        linkedFrom: {
          subGroupCollection: {
            items: [
              EligibilitySubgroupResultFactory({
                offeringCollection: {
                  items: [
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test',
                      countries: ['usa'],
                    }),
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test2',
                      countries: ['usa'],
                    }),
                  ],
                },
              }),
            ],
          },
        },
      });
      mockResult.offeringForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult);
      const result = await manager.getOfferingOverlap(
        [],
        ['prod_test2'],
        'test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.DOWNGRADE);
    });

    it('should return same comparison for same planId', async () => {
      const offeringResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      const existingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      mockResult.offeringForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult)
        .mockReturnValueOnce(existingResult);
      const result = await manager.getOfferingOverlap(
        ['plan_test'],
        [],
        'plan_test'
      );
      expect(result.length).toBe(1);
      expect(result[0].comparison).toBe(OfferingComparison.SAME);
    });

    it('should return upgrade comparison for upgrade planId', async () => {
      const offeringResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test2',
        linkedFrom: {
          subGroupCollection: {
            items: [
              EligibilitySubgroupResultFactory({
                offeringCollection: {
                  items: [
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test',
                      countries: ['usa'],
                    }),
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test2',
                      countries: ['usa'],
                    }),
                  ],
                },
              }),
            ],
          },
        },
      });
      const existingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      mockResult.offeringForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult)
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
      const offeringResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test2',
        linkedFrom: {
          subGroupCollection: {
            items: [
              EligibilitySubgroupResultFactory({
                offeringCollection: {
                  items: [
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test',
                      countries: ['usa'],
                    }),
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test2',
                      countries: ['usa'],
                    }),
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test3',
                      countries: ['usa'],
                    }),
                  ],
                },
              }),
              EligibilitySubgroupResultFactory({
                offeringCollection: {
                  items: [
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test',
                      countries: ['usa'],
                    }),
                    EligibilitySubgroupOfferingResultFactory({
                      stripeProductId: 'prod_test2',
                      countries: ['usa'],
                    }),
                  ],
                },
              }),
            ],
          },
        },
      });
      const existingResult = EligibilityOfferingResultFactory({
        stripeProductId: 'prod_test',
      });
      mockResult.offeringForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult)
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
        planId: 'plan_test',
        type: 'plan',
      });
    });
  });
});
