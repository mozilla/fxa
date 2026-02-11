/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { Twilio } from 'twilio';
import { TwilioConfig } from './twilio.config';
import { MozLoggerService } from '@fxa/shared/mozlog';

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
  useFactory: (config: TwilioConfig, log?: MozLoggerService) => {
    const {
      credentialMode,
      testAccountSid,
      testAuthToken,
      accountSid,
      authToken,
      apiKey,
      apiSecret,
    } = config;

    if (credentialMode === '') {
      log?.debug(
        'Twilio will not be available. Check readme for info about configuring Twilio.'
      );
      return new Twilio('AC123', '');
    }

    // Okay for test, dev, and CI when using real phone numbers
    if (credentialMode === 'default' && accountSid && authToken) {
      return new Twilio(accountSid, authToken);
    }

    // For test and dev when using magic Twilio phone numbers.
    if (credentialMode === 'test' && testAccountSid && testAuthToken) {
      return new Twilio(testAccountSid, testAuthToken);
    }

    // The preferred way for deployments
    if (credentialMode === 'apiKeys' && accountSid && apiKey && apiSecret) {
      return new Twilio(apiKey, apiSecret, { accountSid });
    }
    throw new Error(
      `Invalid configuration state for credential mode ${credentialMode}.\n ${JSON.stringify(
        {
          credentialMode,
          has: {
            testAccountSid: !!testAccountSid,
            testAuthToken: !!testAuthToken,
            accountSid: !!accountSid,
            authToken: !!authToken,
            apiKey: !!apiKey,
            apiSecret: !!apiKey,
          },
        },
        null,
        ''
      )}`
    );
  },
  inject: [TwilioConfig],
};
