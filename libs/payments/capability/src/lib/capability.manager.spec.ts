/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import {
  ContentfulManager,
  CapabilityCapabilitiesResultFactory,
  CapabilityOfferingResultFactory,
  CapabilitiesResultFactory,
  CapabilityServiceByPlanIdsResultUtil,
  CapabilityServicesResultFactory,
  ServiceResultFactory,
  ServicesWithCapabilitiesResultUtil,
} from '@fxa/shared/contentful';
import { CapabilityManager } from './capability.manager';

describe('CapabilityManager', () => {
  describe('getClients', () => {
    let manager: CapabilityManager;
    let mockContentfulManager: ContentfulManager;
    let mockResult: ServicesWithCapabilitiesResultUtil;

    beforeEach(async () => {
      mockResult = {} as ServicesWithCapabilitiesResultUtil;
      mockContentfulManager = {
        getServicesWithCapabilities: jest
          .fn()
          .mockResolvedValueOnce(mockResult),
      } as any;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          { provide: ContentfulManager, useValue: mockContentfulManager },
          CapabilityManager,
        ],
      }).compile();

      manager = module.get<CapabilityManager>(CapabilityManager);
    });

    it('should be defined', async () => {
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(CapabilityManager);
    });

    it('should return empty results', async () => {
      mockResult.getServices = jest.fn().mockReturnValueOnce(undefined);
      const result = await manager.getClients();
      expect(result.length).toBe(0);
    });

    it('should return services with capabilities', async () => {
      const clientResults = [
        ServiceResultFactory({
          oauthClientId: 'client1',
          capabilitiesCollection: {
            items: [
              CapabilitiesResultFactory({ slug: 'exampleCap8' }),
              CapabilitiesResultFactory({ slug: 'exampleCap0' }),
              CapabilitiesResultFactory({ slug: 'exampleCap2' }),
              CapabilitiesResultFactory({ slug: 'exampleCap4' }),
              CapabilitiesResultFactory({ slug: 'exampleCap5' }),
              CapabilitiesResultFactory({ slug: 'exampleCap6' }),
            ],
          },
        }),
      ];
      mockResult.getServices = jest.fn().mockReturnValue(clientResults);
      const result = await manager.getClients();
      expect(result.length).toBe(1);
      expect(result[0].clientId).toBe('client1');

      const actualCapabilities = clientResults[0].capabilitiesCollection.items
        .map((capability) => capability.slug)
        .sort();

      expect(result[0].capabilities).toHaveLength(6);
      expect(result[0].capabilities).toStrictEqual(actualCapabilities);
    });
  });

  describe('planIdsToClientCapabilities', () => {
    let manager: CapabilityManager;
    let mockContentfulManager: ContentfulManager;
    let mockResult: CapabilityServiceByPlanIdsResultUtil;

    beforeEach(async () => {
      mockResult = {} as CapabilityServiceByPlanIdsResultUtil;
      mockContentfulManager = {
        getPurchaseDetailsForCapabilityServiceByPlanIds: jest
          .fn()
          .mockResolvedValueOnce(mockResult),
      } as any;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          { provide: ContentfulManager, useValue: mockContentfulManager },
          CapabilityManager,
        ],
      }).compile();

      manager = module.get<CapabilityManager>(CapabilityManager);
    });

    it('should be defined', async () => {
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(CapabilityManager);
    });

    it('should return empty results', async () => {
      mockResult.capabilityOfferingForPlanId = jest
        .fn()
        .mockReturnValueOnce(undefined);
      const result = await manager.planIdsToClientCapabilities(['planId1']);
      expect(Object.keys(result).length).toBe(0);
    });

    it('should return empty results when there are no capability collection items', async () => {
      const offeringResult = CapabilityOfferingResultFactory({
        capabilitiesCollection: {
          items: [],
        },
      });
      mockResult.capabilityOfferingForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult);
      const result = await manager.planIdsToClientCapabilities(['planId1']);
      expect(Object.keys(result).length).toBe(0);
    });

    it('should return empty results when there are no service collection items', async () => {
      const offeringResult = CapabilityOfferingResultFactory({
        capabilitiesCollection: {
          items: [
            CapabilityCapabilitiesResultFactory({
              slug: 'slug1',
              servicesCollection: {
                items: [],
              },
            }),
          ],
        },
      });
      mockResult.capabilityOfferingForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult);
      const result = await manager.planIdsToClientCapabilities(['planId1']);
      expect(Object.keys(result).length).toBe(0);
    });

    it('should return planIds to client capabilities', async () => {
      const offeringResult = CapabilityOfferingResultFactory({
        capabilitiesCollection: {
          items: [
            CapabilityCapabilitiesResultFactory({
              slug: 'slug1',
              servicesCollection: {
                items: [
                  CapabilityServicesResultFactory({
                    oauthClientId: 'clientId1',
                  }),
                ],
              },
            }),
            CapabilityCapabilitiesResultFactory({
              slug: 'slug2a',
              servicesCollection: {
                items: [
                  CapabilityServicesResultFactory({
                    oauthClientId: 'clientId2',
                  }),
                ],
              },
            }),
            CapabilityCapabilitiesResultFactory({
              slug: 'slug2b',
              servicesCollection: {
                items: [
                  CapabilityServicesResultFactory({
                    oauthClientId: 'clientId2',
                  }),
                ],
              },
            }),
          ],
        },
      });
      mockResult.capabilityOfferingForPlanId = jest
        .fn()
        .mockReturnValueOnce(offeringResult);
      const result = await manager.planIdsToClientCapabilities(['planId1']);
      expect(Object.keys(result).length).toBe(2);
      expect(result).toStrictEqual({
        clientId1: ['slug1'],
        clientId2: ['slug2a', 'slug2b'],
      });
    });
  });
});
