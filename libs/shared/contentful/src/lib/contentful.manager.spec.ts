/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import { ContentfulClient } from './contentful.client';
import { ContentfulManager } from './contentful.manager';
import {
  EligibilityContentByPlanIdsQueryFactory,
  EligibilityContentByPlanIdsResultUtil,
  ServicesWithCapabilitiesQueryFactory,
  ServicesWithCapabilitiesResultUtil,
} from '../../src';
import { PurchaseWithDetailsOfferingContentUtil } from './queries/purchase-with-details-offering-content';
import { PurchaseWithDetailsOfferingContentByPlanIdsResultFactory } from './queries/purchase-with-details-offering-content/factories';
describe('ContentfulManager', () => {
  let manager: ContentfulManager;
  let mockClient: ContentfulClient;

  beforeEach(async () => {
    mockClient = {} as any;
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
      mockClient.query = jest.fn().mockReturnValue({
        data: {
          purchaseCollection: { items: [] },
        },
      });
      const result = await manager.getPurchaseDetailsForEligibility(['test']);
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(result.purchaseCollection.items).toHaveLength(0);
    });

    it('should return successfully with subgroups and offering', async () => {
      const queryData = EligibilityContentByPlanIdsQueryFactory();
      mockClient.query = jest.fn().mockResolvedValueOnce({ data: queryData });
      const result = await manager.getPurchaseDetailsForEligibility(['test']);
      const planId = result.purchaseCollection.items[0].stripePlanChoices[0];
      expect(result).toBeInstanceOf(EligibilityContentByPlanIdsResultUtil);
      expect(
        result.offeringForPlanId(planId)?.linkedFrom.subGroupCollection.items
      ).toHaveLength(1);
      expect(result.offeringForPlanId(planId)).toBeDefined();
    });
  });

  describe('getServicesWithCapabilities', () => {
    it('should return results', async () => {
      mockClient.query = jest.fn().mockReturnValue({
        data: {
          serviceCollection: { items: [] },
        },
      });
      const result = await manager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.serviceCollection.items).toHaveLength(0);
    });

    it('should return successfully with services and capabilities', async () => {
      const queryData = ServicesWithCapabilitiesQueryFactory();
      mockClient.query = jest.fn().mockResolvedValueOnce({ data: queryData });
      const result = await manager.getServicesWithCapabilities();
      expect(result).toBeInstanceOf(ServicesWithCapabilitiesResultUtil);
      expect(result.serviceCollection.items).toHaveLength(1);
    });
  });

  describe('getPurchaseWithDetailsOfferingContentByPlanIds', () => {
    it('should return empty result', async () => {
      mockClient.query = jest.fn().mockReturnValue({
        data: {
          purchaseCollection: { items: [] },
        },
      });
      mockClient.getLocale = jest.fn().mockResolvedValue('en');
      const result =
        await manager.getPurchaseWithDetailsOfferingContentByPlanIds(
          ['test'],
          'en'
        );
      expect(result).toBeInstanceOf(PurchaseWithDetailsOfferingContentUtil);
      expect(result.purchaseCollection.items).toHaveLength(0);
    });

    it('should return successfully with purchase details and offering', async () => {
      const queryData =
        PurchaseWithDetailsOfferingContentByPlanIdsResultFactory();
      const queryDataItem = queryData.purchaseCollection.items[0];
      mockClient.query = jest.fn().mockResolvedValueOnce({ data: queryData });
      mockClient.getLocale = jest.fn().mockResolvedValue('en');
      const result =
        await manager.getPurchaseWithDetailsOfferingContentByPlanIds(
          ['test'],
          'en'
        );
      const planId = result.purchaseCollection.items[0].stripePlanChoices?.[0];
      expect(result).toBeInstanceOf(PurchaseWithDetailsOfferingContentUtil);
      expect(
        result.transformedPurchaseWithCommonContentForPlanId(planId ?? '')
          ?.offering
      ).toEqual(queryDataItem.offering);
      expect(
        result.transformedPurchaseWithCommonContentForPlanId(planId ?? '')
          ?.purchaseDetails
      ).toEqual(result.purchaseDetailsTransform(queryDataItem.purchaseDetails));
    });
  });
});
