/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import { ContentfulClient } from './contentful.client';
import { ContentfulManager } from './contentful.manager';
import { EligibilityContentByPlanIdsQueryFactory } from './factories';

jest.mock('./contentful.client');

describe('ContentfulManager', () => {
  let manager: ContentfulManager;
  let mockClient: ContentfulClient;

  beforeEach(async () => {
    (ContentfulClient as jest.Mock).mockClear();
    mockClient = new ContentfulClient({
      cdnApiUri: 'test',
      graphqlApiKey: 'test',
      graphqlApiUri: 'test',
      graphqlEnvironment: 'test',
      graphqlSpaceId: 'test',
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ContentfulClient, useValue: mockClient },
        ContentfulManager,
      ],
    }).compile();

    manager = module.get<ContentfulManager>(ContentfulManager);
  });

  it('should be defined', () => {
    expect(manager).toBeDefined();
  });

  describe('getPurchaseDetailsForEligibility', () => {
    it('should return empty result', async () => {
      const result = await manager.getPurchaseDetailsForEligibility(['test']);
      expect(result).toBeDefined();
      expect(result.purchaseCollection.items).toHaveLength(0);
    });

    it('should return successfully with subgroups and offering', async () => {
      const queryData = EligibilityContentByPlanIdsQueryFactory();
      mockClient.query = jest.fn().mockResolvedValueOnce({ data: queryData });
      const result = await manager.getPurchaseDetailsForEligibility(['test']);
      const planId = result.purchaseCollection.items[0].stripePlanChoices[0];
      expect(result).toBeDefined();
      expect(result.getSubgroupsForPlanId(planId)).toHaveLength(1);
      expect(result.getOfferingForPlanId(planId)).toBeDefined();
    });
  });
});
