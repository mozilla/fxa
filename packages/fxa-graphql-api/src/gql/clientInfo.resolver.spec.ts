/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { ClientInfoService } from '../backend/clientInfo.service';
import { ClientInfoResolver } from './clientInfo.resolver';

describe('#unit - ProductResolver', () => {
  let resolver: ClientInfoResolver;
  let mockClientInfoService: Partial<ClientInfoService>;

  const mockClientInfo = {
    clientId: 'foo',
    serviceName: 'bar',
    imageUri: 'baz',
    redirectUri: 'qux',
    trusted: true,
  };

  beforeEach(async () => {
    mockClientInfoService = {
      getClientInfo: jest.fn().mockReturnValue(mockClientInfo),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientInfoResolver,
        { provide: ClientInfoService, useValue: mockClientInfoService },
      ],
    }).compile();

    resolver = module.get<ClientInfoResolver>(ClientInfoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('calls client info service', async () => {
    const result = await resolver.clientInfo('foo');
    expect(mockClientInfoService.getClientInfo).toBeCalledWith('foo');
    expect(result).toEqual(mockClientInfo);
  });
});
