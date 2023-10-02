/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';

import {
  ContentfulManager,
  ServiceResultFactory,
  ServicesWithCapabilitiesResultUtil,
} from '@fxa/shared/contentful';
import { CapabilityManager } from './capability.manager';

describe('CapabilityManager', () => {
  let manager: CapabilityManager;
  let mockContentfulManager: ContentfulManager;
  let mockResult: ServicesWithCapabilitiesResultUtil;

  beforeEach(async () => {
    mockResult = {} as any;
    mockContentfulManager = {
      getServicesWithCapabilities: jest.fn().mockResolvedValueOnce(mockResult),
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

  describe('getClients', () => {
    it('should return empty results', async () => {
      mockResult.getServices = jest.fn().mockReturnValueOnce(undefined);
      const result = await manager.getClients();
      expect(result.length).toBe(0);
    });

    it('should return services with capabilities', async () => {
      const clientResults = ServiceResultFactory({
        oauthClientId: 'client1',
        capabilitiesCollection: {
          items: [
            { slug: 'exampleCap0' },
            { slug: 'exampleCap2' },
            { slug: 'exampleCap4' },
            { slug: 'exampleCap5' },
            { slug: 'exampleCap6' },
            { slug: 'exampleCap8' },
          ],
        },
      });
      mockResult.getServices = jest.fn().mockReturnValue(clientResults);
      const result = await manager.getClients();
      expect(result.length).toBe(1);
      expect(result[0].clientId).toBe('client1');

      const actualCapabilities = [
        'exampleCap0',
        'exampleCap2',
        'exampleCap4',
        'exampleCap5',
        'exampleCap6',
        'exampleCap8',
      ];
      expect(result[0].capabilities).toHaveLength(6);
      expect(result[0].capabilities).toStrictEqual(actualCapabilities);
    });
  });
});
