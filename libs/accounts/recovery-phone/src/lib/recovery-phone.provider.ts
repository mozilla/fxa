/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { SmsManagerConfig } from './sms.manager.config';
import Redis from 'ioredis';
import { RecoveryPhoneConfig } from './recovery-phone.service.config';

export const SmsConfigProvider = {
  provide: SmsManagerConfig,
  useFactory: (config: ConfigService) => {
    const smsManagerConfig = config.get('recoveryPhone.sms');
    return smsManagerConfig;
  },
  inject: [ConfigService],
};

export const RecoveryPhoneRedisProvider = {
  provide: 'RecoveryPhoneRedis',
  useFactory: (config: ConfigService) => {
    const baseRedisConfig = config.get('redis');
    const recoveryPhoneRedisConfig = config.get('recoveryPhone.redis');
    return new Redis({
      ...baseRedisConfig,
      ...recoveryPhoneRedisConfig,
    });
  },
  inject: [ConfigService],
};

export const RecoveryPhoneConfigProvider = {
  provide: RecoveryPhoneConfig,
  useFactory: (config: ConfigService) => {
    return config.get('recoveryPhone');
  },
  inject: [ConfigService],
};
