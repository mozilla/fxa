/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { Test, TestingModule } from '@nestjs/testing';
import { StatsD } from 'hot-shots';
import { MockStatsDProvider, StatsDService } from '@fxa/shared/metrics/statsd';
import { NotifierService } from './notifier.service';
import {
  MockNotifierSnsConfig,
  MockNotifierSnsConfigProvider,
} from './notifier.sns.config';
import { NotifierSnsService } from './notifier.sns.provider';

describe('NotifierService', () => {
  let notifierService: NotifierService;
  let statsd: StatsD;

  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
  };

  const mockSnsService = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifierService,
        MockNotifierSnsConfigProvider,
        MockStatsDProvider,
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: NotifierSnsService,
          useValue: mockSnsService,
        },
      ],
    }).compile();

    notifierService = module.get<NotifierService>(NotifierService);
    statsd = module.get<StatsD>(StatsDService);
  });

  it('should be defined', async () => {
    expect(notifierService).toBeDefined();
    expect(notifierService).toBeInstanceOf(NotifierService);
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

    jest.spyOn(statsd, 'timing');
    mockSnsService.publish.mockImplementation((params, callback) => {
      notifierService.onPublish(
        undefined,
        responseData,
        Date.now() - 100,
        callback
      );
    });

    notifierService.send(event, callback);

    expect(mockSnsService.publish).toBeCalledWith(
      {
        TopicArn: MockNotifierSnsConfig.snsTopicArn,
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
    expect(statsd.timing).toBeCalledWith(
      'notifier.publish',
      expect.any(Number)
    );
    expect(mockLogger.debug).toBeCalledWith(
      'Notifier.publish success',
      responseData
    );
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

    jest.spyOn(statsd, 'timing');
    mockSnsService.publish.mockImplementation((params, callback) => {
      notifierService.onPublish(err, responseData, Date.now() - 100, callback);
    });

    notifierService.send(event, callback);

    expect(mockSnsService.publish).toBeCalledWith(
      {
        TopicArn: MockNotifierSnsConfig.snsTopicArn,
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
    expect(statsd.timing).toBeCalledWith(
      'notifier.publish',
      expect.any(Number)
    );
    expect(mockLogger.error).toBeCalledWith('Notifier.publish', err);
    expect(callback).toBeCalledWith(err, responseData);
  });
});
