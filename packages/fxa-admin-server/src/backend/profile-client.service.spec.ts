/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import superagent from 'superagent';

import { AuthClientService } from './auth-client.service';
import { ProfileClientService } from './profile-client.service';
import { ConfigService } from '@nestjs/config';

describe('ProfileClientService', () => {
  let service: ProfileClientService;
  let authClient: any;
  const profileUrl = 'https://test.com';
  const secretToken = 'secret123';

  beforeEach(async () => {
    authClient = {};
    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'profileServer') {
            return {
              url: profileUrl,
              secretBearerToken: secretToken,
            };
          }
          return null;
        }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileClientService,
        MockConfig,
        { provide: AuthClientService, useValue: authClient },
      ],
    }).compile();

    service = module.get<ProfileClientService>(ProfileClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deletes cache', async () => {
    const mockDelete = jest.spyOn(superagent, 'delete') as jest.Mock;
    const mockSet = jest.fn().mockResolvedValue({ text: '{}' });
    mockDelete.mockReturnValueOnce({
      set: mockSet,
    });
    const result = await service.deleteCache('1234abcd');
    expect(result).toStrictEqual({});
    expect(mockSet).toBeCalledWith('Authorization', 'Bearer ' + secretToken);
    expect(mockDelete).toBeCalledWith(profileUrl + '/cache/1234abcd');
  });
});
