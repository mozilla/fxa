/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';

import {
  CapabilityCapabilitiesResultFactory,
  CapabilityOfferingResultFactory,
  CapabilitiesResultFactory,
  CapabilityServiceByPlanIdsResultUtil,
  CapabilityServicesResultFactory,
  ContentfulClientConfig,
  CapabilityServiceByPlanIdsQueryFactory,
  CapabilityServiceByPlanIdsResult,
  CapabilityPurchaseResultFactory,
  ProductConfigurationManager,
  ServiceResultFactory,
  ServicesWithCapabilitiesResultUtil,
  ServicesWithCapabilitiesQueryFactory,
  ServicesWithCapabilitiesResult,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { CapabilityManager } from './capability.manager';

describe('CapabilityManager', () => {
  let capabilityManager: CapabilityManager;
  let productConfigurationManager: ProductConfigurationManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CapabilityManager,
        ContentfulClientConfig,
        MockFirestoreProvider,
        MockStatsDProvider,
        ProductConfigurationManager,
        StrapiClient,
      ],
    }).compile();

    productConfigurationManager = module.get(ProductConfigurationManager);
    capabilityManager = module.get(CapabilityManager);
  });

  describe('getClients', () => {
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
      const mockServicesWithCapabilitiesQuery =
        ServicesWithCapabilitiesQueryFactory({
          serviceCollection: {
            items: clientResults,
          },
        });
      jest
        .spyOn(productConfigurationManager, 'getServicesWithCapabilities')
        .mockResolvedValue(
          new ServicesWithCapabilitiesResultUtil(
            mockServicesWithCapabilitiesQuery as ServicesWithCapabilitiesResult
          )
        );

      const result = await capabilityManager.getClients();
      expect(result.length).toBe(1);
      expect(result.at(0)?.clientId).toBe('client1');

      const actualCapabilities = clientResults[0].capabilitiesCollection.items
        .map((capability) => capability.slug)
        .sort();

      expect(result.at(0)?.capabilities).toHaveLength(6);
      expect(result.at(0)?.capabilities).toStrictEqual(actualCapabilities);
    });
  });

  describe('priceIdsToClientCapabilities', () => {
    it('should return empty results', async () => {
      const mockCapabilityServiceByPlanIdsQuery =
        CapabilityServiceByPlanIdsQueryFactory();
      jest
        .spyOn(
          productConfigurationManager,
          'getPurchaseDetailsForCapabilityServiceByPlanIds'
        )
        .mockResolvedValue(
          new CapabilityServiceByPlanIdsResultUtil([
            mockCapabilityServiceByPlanIdsQuery,
          ] as CapabilityServiceByPlanIdsResult[])
        );
      const result = await capabilityManager.priceIdsToClientCapabilities([
        'planId1',
      ]);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should return empty results when there are no capability collection items', async () => {
      const mockCapabilityOfferingResult = CapabilityOfferingResultFactory({
        capabilitiesCollection: {
          items: [],
        },
      });
      const mockCapabilityPurchaseResult = CapabilityPurchaseResultFactory({
        offering: mockCapabilityOfferingResult,
      });
      const mockCapabilityServiceByPlanIdsQuery =
        CapabilityServiceByPlanIdsQueryFactory({
          purchaseCollection: {
            total: 1,
            items: [mockCapabilityPurchaseResult],
          },
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getPurchaseDetailsForCapabilityServiceByPlanIds'
        )
        .mockResolvedValue(
          new CapabilityServiceByPlanIdsResultUtil([
            mockCapabilityServiceByPlanIdsQuery,
          ] as CapabilityServiceByPlanIdsResult[])
        );

      const result = await capabilityManager.priceIdsToClientCapabilities([
        'planId1',
      ]);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should return empty results when there are no service collection items', async () => {
      const mockCapabilityOfferingResult = CapabilityOfferingResultFactory({
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
      const mockCapabilityPurchaseResult = CapabilityPurchaseResultFactory({
        offering: mockCapabilityOfferingResult,
      });
      const mockCapabilityServiceByPlanIdsQuery =
        CapabilityServiceByPlanIdsQueryFactory({
          purchaseCollection: {
            total: 1,
            items: [mockCapabilityPurchaseResult],
          },
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getPurchaseDetailsForCapabilityServiceByPlanIds'
        )
        .mockResolvedValue(
          new CapabilityServiceByPlanIdsResultUtil([
            mockCapabilityServiceByPlanIdsQuery,
          ] as CapabilityServiceByPlanIdsResult[])
        );

      const result = await capabilityManager.priceIdsToClientCapabilities([
        'planId1',
      ]);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should return planIds to client capabilities', async () => {
      const mockCapabilityOfferingResult = CapabilityOfferingResultFactory({
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
      const mockCapabilityPurchaseResult = CapabilityPurchaseResultFactory({
        stripePlanChoices: ['planId1'],
        offering: mockCapabilityOfferingResult,
      });
      const mockCapabilityServiceByPlanIdsQuery =
        CapabilityServiceByPlanIdsQueryFactory({
          purchaseCollection: {
            total: 1,
            items: [mockCapabilityPurchaseResult],
          },
        });
      jest
        .spyOn(
          productConfigurationManager,
          'getPurchaseDetailsForCapabilityServiceByPlanIds'
        )
        .mockResolvedValue(
          new CapabilityServiceByPlanIdsResultUtil([
            mockCapabilityServiceByPlanIdsQuery,
          ] as CapabilityServiceByPlanIdsResult[])
        );

      const result = await capabilityManager.priceIdsToClientCapabilities([
        'planId1',
      ]);
      expect(Object.keys(result).length).toBe(2);
      expect(result).toStrictEqual({
        clientId1: ['slug1'],
        clientId2: ['slug2a', 'slug2b'],
      });
    });
  });
});
