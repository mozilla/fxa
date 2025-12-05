/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileClient, ProfileClientConfig } from '@fxa/profile/client';
import { StatsD } from 'hot-shots';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { AppConfig } from '../config';

export const ProfileClientFactory: Provider<ProfileClient> = {
  provide: ProfileClient,
  useFactory: (
    configService: ConfigService<AppConfig>,
    log: MozLoggerService,
    statsd: StatsD
  ) => {
    const profileConfig = configService.get(
      'profileServer'
    ) as AppConfig['profileServer'];
    const config: ProfileClientConfig = {
      ...profileConfig,
      serviceName: 'admin',
    };
    return new ProfileClient(log, statsd, config);
  },
  inject: [ConfigService, MozLoggerService, 'METRICS'],
};
