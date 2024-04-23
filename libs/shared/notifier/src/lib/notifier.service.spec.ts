/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { NotifierService } from './notifier.service';
import { ConfigService } from '@nestjs/config';
import { NotifierSnsService } from './notifier.sns.provider';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { StatsDService } from '@fxa/shared/metrics/statsd';

describe('NotifierService', () => {
  let service: NotifierService;
  const mockStatsD = {
    timing: jest.fn(),
    error: jest.fn(),
    trace: jest.fn(),
  };
  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
  };
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
  const mockSnsService = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifierService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: StatsDService,
          useValue: mockStatsD,
        },
        {
          provide: MozLoggerService,
          useValue: mockLogger,
        },
        {
          provide: NotifierSnsService,
          useValue: mockSnsService,
        },
      ],
    }).compile();

    service = module.get<NotifierService>(NotifierService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(NotifierService);
  });

  it('sends without error', () => {
    const callback = jest.fn();
    const responseData = {
      SequenceNumber: 'foo',
    };
    const event = {
      data: {
        email: 'foo@mozilla.com',
        bar: true,
      },
      event: 'foo',
    };

    mockSnsService.publish.mockImplementation((params, callback) => {
      service.onPublish(undefined, responseData, Date.now() - 100, callback);
    });

    service.send(event, callback);

    expect(mockSnsService.publish).toBeCalledWith(
      {
        TopicArn: mockConfig.snsTopicArn,
        Message: JSON.stringify({
          email: event.data.email,
          bar: event.data.bar,
          event: event.event,
        }),
        MessageAttributes: {
          event_type: {
            DataType: 'String',
            StringValue: event.event,
          },
          email_domain: {
            DataType: 'String',
            StringValue: event.data.email.split('@')[1],
          },
        },
      },
      expect.anything()
    );
    expect(mockStatsD.timing).toBeCalledWith(
      'notifier.publish',
      expect.any(Number)
    );
    expect(mockLogger.debug).toBeCalledWith('Notifier.publish', {
      success: true,
      data: responseData,
    });
    expect(callback).toBeCalledWith(undefined, responseData);
  });

  it('sends and encounters error', () => {
    const err = {
      code: '500',
      name: 'foo',
      message: 'bar',
      time: new Date(),
    };
    const callback = jest.fn();
    const responseData = {
      SequenceNumber: 'foo',
    };
    const event = {
      event: 'foo',
      data: {},
    };

    mockSnsService.publish.mockImplementation((params, callback) => {
      service.onPublish(err, responseData, Date.now() - 100, callback);
    });

    service.send(event, callback);

    expect(mockSnsService.publish).toBeCalledWith(
      {
        TopicArn: mockConfig.snsTopicArn,
        Message: JSON.stringify({
          event: event.event,
        }),
        MessageAttributes: {
          event_type: {
            DataType: 'String',
            StringValue: event.event,
          },
        },
      },
      expect.anything()
    );
    expect(mockStatsD.timing).toBeCalledWith(
      'notifier.publish',
      expect.any(Number)
    );
    expect(mockLogger.error).toBeCalledWith('Notifier.publish', {
      err,
    });
    expect(callback).toBeCalledWith(err, responseData);
  });
});
