/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SNS } from 'aws-sdk';
import { MockNotifierSnsConfig } from './notifier.sns.config';
import {
  LegacyNotifierSnsFactory,
  NotifierSnsService,
} from './notifier.sns.provider';

const mockSNS = jest.fn();
jest.mock('aws-sdk', () => {
  return {
    SNS: function (...args: any) {
      return mockSNS(...args);
    },
  };
});

describe('NotifierSnsFactory', () => {
  let sns: SNS;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'notifier.sns') {
        return MockNotifierSnsConfig;
      }
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegacyNotifierSnsFactory,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    sns = await module.resolve<SNS>(NotifierSnsService);
  });

  it('should provide statsd', async () => {
    expect(sns).toBeDefined();
    expect(mockSNS).toBeCalledWith({
      endpoint: MockNotifierSnsConfig.snsTopicEndpoint,
      region: 'us-west-2',
    });
  });
});
