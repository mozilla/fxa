/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Account, Device, TotpToken } from 'fxa-shared/db/models/auth';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

import { RemoteLookupService } from '../remote-lookup/remote-lookup.service';
import {
  formattedSigninLocations,
  formattedSubscriptions,
  MOCKDATA,
} from '../remote-lookup/remote-lookup.service.spec';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;
  let mockRemote: Partial<RemoteLookupService>;
  let mockLog: Partial<MozLoggerService>;

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
      (jest.spyOn(Account, 'findByUid') as jest.Mock).mockReturnValue(
        MOCKDATA.account
      );
      (jest.spyOn(Device, 'findByUid') as jest.Mock).mockReturnValue(
        MOCKDATA.devices
      );
      (jest.spyOn(TotpToken, 'findByUid') as jest.Mock).mockReturnValue(
        MOCKDATA.totp
      );
      mockRemote.subscriptions = jest
        .fn()
        .mockResolvedValue(formattedSubscriptions);
      mockRemote.signinLocations = jest
        .fn()
        .mockResolvedValue(formattedSigninLocations);

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
        webSubscriptions: formattedSubscriptions[MozillaSubscriptionTypes.WEB],
        playSubscriptions:
          formattedSubscriptions[MozillaSubscriptionTypes.IAP_GOOGLE],
        twoFactorAuth: true,
        uid: 'testuid',
      });
      expect(mockLog.info).toBeCalledTimes(1);
    });
  });
});
