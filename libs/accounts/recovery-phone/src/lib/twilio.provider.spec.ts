/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TwilioFactory, TwilioProvider } from './twilio.provider';
import { TwilioConfig } from './twilio.config';
import { Twilio } from 'twilio';
import { Provider } from '@nestjs/common';

describe('TwilioFactory', () => {
  let client: Twilio;

  const MockTwilioConfig = {
    accountSid: 'AC',
    authToken: '',
    webhookUrl: 'https://accounts.firefox.com/v1/recovery_phone/message_status',
    validateWebhookCalls: true,
  } satisfies TwilioConfig;

  const MockTwilioConfigProvider = {
    provide: TwilioConfig,
    useValue: MockTwilioConfig,
  } satisfies Provider<TwilioConfig>;

  const MockConfigServiceProvider = {
    provide: ConfigService,
    useValue: {
      get: jest.fn().mockImplementation((key: string) => {
        return key === 'twilio' ? MockTwilioConfig : null;
      }),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockTwilioConfigProvider,
        MockConfigServiceProvider,
        TwilioFactory,
      ],
    }).compile();
    client = await module.resolve<Twilio>(TwilioProvider);
  });

  it('should provide twilio', async () => {
    expect(client).toBeDefined();
    expect(client.messages).toBeDefined();
  });
});
