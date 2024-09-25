/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { ProfileClient } from './profile.client';
import { MockProfileClientConfigProvider } from './profile.config';

describe('ProfileClient', () => {
  let profileClient: ProfileClient;
  let privateMethod: any;
  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockProfileClientConfigProvider,
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
        ProfileClient,
      ],
    }).compile();

    profileClient = moduleRef.get(ProfileClient);
    privateMethod = jest
      .spyOn(profileClient as any, 'makeRequest')
      .mockResolvedValue({});
  });

  it('should be defined', () => {
    expect(profileClient).toBeDefined();
  });

  describe('deleteCache', () => {
    it('should delete cache', async () => {
      await profileClient.deleteCache('test');
      expect(privateMethod).toHaveBeenCalled();
    });

    it('should log and throw error', async () => {
      jest
        .spyOn(profileClient as any, 'makeRequest')
        .mockRejectedValue(new Error('fail'));

      await expect(profileClient.deleteCache('test')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateDisplayName', () => {
    it('should update display name', async () => {
      await profileClient.updateDisplayName('test', 'test');
      expect(privateMethod).toHaveBeenCalled();
    });

    it('should log and throw error', async () => {
      jest
        .spyOn(profileClient as any, 'makeRequest')
        .mockRejectedValue(new Error('fail'));

      await expect(
        profileClient.updateDisplayName('test', 'test')
      ).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
