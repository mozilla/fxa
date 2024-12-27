/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OtpManager } from './otp';
import { OtpManagerConfig } from './otp.config';
import { OtpRedisStorage } from './otp.storage';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const OtpConfigProvider = {
  provide: OtpManagerConfig,
  useFactory: (config: ConfigService) => {
    return config.get('recoveryPhone.otp');
  },
  inject: [ConfigService],
};

export const OtpRedisStorageProvider = {
  provide: OtpRedisStorage,
  useFactory: (redis: Redis) => {
    return new OtpRedisStorage(redis);
  },
  inject: [ConfigService],
};

export const OtpManagerProvider = {
  provide: OtpManager,
  useFactory: (config: OtpManagerConfig, storage: OtpRedisStorage) => {
    return new OtpManager(config, storage);
  },
  inject: [OtpManagerConfig, OtpRedisStorage],
};
