/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SNS } from 'aws-sdk';
import {
  NotifierSnsFactory,
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

  const mockConfig = {
    snsTopicArn: 'arn:aws:sns:us-east-1:100010001000:fxa-account-change-dev',
    snsTopicEndpoint: 'http://localhost:4100/',
  };
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'notifier.sns') {
        return mockConfig;
      }
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifierSnsFactory,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    sns = await module.resolve<SNS>(NotifierSnsService);
  });

  it('should provide statsd', async () => {
    expect(sns).toBeDefined();
    expect(mockSNS).toBeCalledWith({
      endpoint: mockConfig.snsTopicEndpoint,
      region: 'us-east-1',
    });
  });
});
