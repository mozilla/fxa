/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { RemoteLookupService } from '../remote-lookup/remote-lookup.service';
import {
  formattedSigninLocations,
  formattedSubscriptions,
  MOCKDATA,
} from '../remote-lookup/remote-lookup.service.spec';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;
  let mockRemote: any;
  let mockLog: any;

  beforeEach(async () => {
    const mockConfig = jest.fn().mockReturnValue({});
    mockRemote = {};
    mockLog = {
      info: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RemoteLookupService,
          useValue: mockRemote,
        },
        {
          provide: ConfigService,
          useValue: { get: mockConfig },
        },
        {
          provide: MozLoggerService,
          useValue: mockLog,
        },
      ],
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('returns successfully', async () => {
      mockRemote.account = jest.fn().mockResolvedValue(MOCKDATA.account);
      mockRemote.devices = jest.fn().mockResolvedValue(MOCKDATA.devices);
      mockRemote.subscriptions = jest
        .fn()
        .mockResolvedValue(formattedSubscriptions);
      mockRemote.signinLocations = jest
        .fn()
        .mockResolvedValue(formattedSigninLocations);
      mockRemote.totpEnabled = jest.fn().mockResolvedValue(true);

      expect(
        await controller.root('testuser', { uid: 'testuid' })
      ).toStrictEqual({
        created: String(new Date(MOCKDATA.account.createdAt)),
        devices: [
          {
            created: String(new Date(MOCKDATA.devices[0].createdAt)),
            name: 'desktop',
            type: 'browser',
          },
        ],
        email: MOCKDATA.account.email,
        emailVerified: !!MOCKDATA.account.emailVerified,
        locale: MOCKDATA.account.locale,
        signinLocations: formattedSigninLocations,
        subscriptionStatus: true,
        subscriptions: formattedSubscriptions,
        twoFactorAuth: true,
        uid: 'testuid',
      });
      expect(mockLog.info).toBeCalledTimes(1);
    });
  });
});
