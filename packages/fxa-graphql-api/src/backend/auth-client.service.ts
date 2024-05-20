/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AuthClient from 'fxa-auth-client';

import { AppConfig } from '../config';

export const AuthClientService = Symbol('AUTH_SERVER_CLIENT');
export const AuthClientFactory: Provider = {
  provide: AuthClientService,
  useFactory: async (config: ConfigService<AppConfig>) => {
    const authServerConfig = config.get(
      'authServer'
    ) as AppConfig['authServer'];

    return new AuthClient(authServerConfig.url, {
      keyStretchVersion: 2,
      // Important! This flag will result in auth client failing
      // hard if headers are not provided! We've trouble in the
      // with headers not being relayed for cross services calls.
      // When this happens, debugging the source can be a bit
      // nebulous, so we'd rather fail upfront and catch the problems
      // in test.
      requireHeaders: true,
    });
  },
  inject: [ConfigService],
};
