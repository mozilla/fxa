/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { Twilio } from 'twilio';
import { TwilioConfig } from './twilio.config';

export const TwilioConfigProvider = {
  provide: TwilioConfig,
  useFactory: (config: ConfigService) => {
    return config.get('twilio');
  },
  inject: [ConfigService],
};

export const TwilioProvider = Symbol('TwilioProvider');

// TODO: Is there a ticket for creating a twilio provider?
//       Should this be moved to shared?
export const TwilioFactory: Provider<Twilio> = {
  provide: TwilioProvider,
  useFactory: (config: TwilioConfig) => {
    const { accountSid, authToken } = config;
    return new Twilio(accountSid, authToken);
  },
  inject: [TwilioConfig],
};
