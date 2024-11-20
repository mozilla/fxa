/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { Test, TestingModule } from '@nestjs/testing';
import { SmsManager } from './sms.manager';
import { SmsManagerConfig } from './sms.manger.config';
import { TwilioProvider } from './twilio.provider';

describe('SmsManager', () => {
  const to = '+15005551111';
  const from = '+15005550000';
  const mockTwilioSmsClient = {
    messages: {
      create: jest.fn(),
    },
  };
  const mockMetrics = {
    increment: jest.fn(),
  };
  const mockLog = {
    log: jest.fn(),
  };
  const mockConfig = {
    from,
    validNumberPrefixes: ['+1'],
    maxMessageLength: 160,
  };

  let manager: SmsManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TwilioProvider, useValue: mockTwilioSmsClient },
        { provide: SmsManagerConfig, useValue: mockConfig },
        { provide: StatsDService, useValue: mockMetrics },
        { provide: LOGGER_PROVIDER, useValue: mockLog },
        SmsManager,
      ],
    }).compile();
    manager = module.get<SmsManager>(SmsManager);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Should be defined', async () => {
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(SmsManager);
  });

  it('Can send', async () => {
    mockTwilioSmsClient.messages.create.mockReturnValue({
      sid: 'foo',
      status: 'sent',
    });

    const body = 'test success';
    const msg = await manager.sendSMS({
      to,
      body,
    });

    expect(msg).toBeDefined();
    expect(mockTwilioSmsClient.messages.create).toBeCalledWith({
      to,
      from,
      body,
    });
    expect(msg?.status).toEqual('sent');
    expect(mockLog.log).toBeCalledTimes(1);
    expect(mockLog.log).toBeCalledWith('SMS sent', {
      sid: 'foo',
      status: 'sent',
    });
    expect(mockMetrics.increment).toBeCalledTimes(1);
    expect(mockMetrics.increment).toBeCalledWith('sms.send.sent');
  });

  it('Rejects invalid number', async () => {
    const body = 'test invalid number';
    await expect(
      manager.sendSMS({
        to: to.replace('+1', ''),
        body,
      })
    ).rejects.toEqual(new Error('Phone number not supported.'));
  });

  it('Rejects long messages', async () => {
    const body = new Array(mockConfig.maxMessageLength + 1).fill('z').join('');
    await expect(
      manager.sendSMS({
        to,
        body,
      })
    ).rejects.toEqual(
      new Error(
        `Body cannot be greater than ${mockConfig.maxMessageLength} characters.`
      )
    );
  });

  it('Records failure', async () => {
    const boom = new Error('Boom');
    mockTwilioSmsClient.messages.create.mockRejectedValue(boom);

    const body = 'test success';
    await expect(
      manager.sendSMS({
        to,
        body,
      })
    ).rejects.toEqual(boom);

    expect(mockLog.log).toBeCalledTimes(0);
    expect(mockMetrics.increment).toBeCalledTimes(1);
  });
});
