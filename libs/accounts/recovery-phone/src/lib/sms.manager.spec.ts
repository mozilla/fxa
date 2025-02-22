/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { Test, TestingModule } from '@nestjs/testing';
import { SmsManager } from './sms.manager';
import { SmsManagerConfig } from './sms.manager.config';
import { TwilioProvider } from './twilio.provider';
import { TwilioErrorCodes } from './recovery-phone.errors';

describe('SmsManager', () => {
  const to = '+15005551111';
  const from = ['+15005550000', '+15005550001'];
  const mockTwilioSmsClient = {
    accountSid: 'AC123',
    messages: {
      create: jest.fn(),
    },
    lookups: {
      v2: {
        phoneNumbers: jest.fn(),
      },
    },
  };
  const mockMetrics = {
    increment: jest.fn(),
    histogram: jest.fn(),
  };
  const mockLog = {
    log: jest.fn(),
    warn: jest.fn(),
  };
  const mockConfig = {
    from,
    validNumberPrefixes: ['+1'],
    maxMessageLength: 160,
    maxRetries: 2,
    extraLookupFields: ['sms_pumping_risk'],
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
      from: from[0],
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

  it('Retries if send rate limit exceeded.', async () => {
    const mockError = new Error();
    (mockError as any).code = TwilioErrorCodes.SMS_SEND_RATE_LIMIT_EXCEEDED;
    mockTwilioSmsClient.messages.create.mockRejectedValueOnce(mockError);
    mockTwilioSmsClient.messages.create.mockReturnValueOnce({
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
      from: from[0],
      body,
    });
    expect(mockTwilioSmsClient.messages.create).toBeCalledWith({
      to,
      from: from[0],
      body,
    });
    expect(mockTwilioSmsClient.messages.create).toBeCalledTimes(2);
    expect(msg?.status).toEqual('sent');
    expect(mockLog.log).toBeCalledTimes(1);
    expect(mockLog.log).toBeCalledWith('SMS sent', {
      sid: 'foo',
      status: 'sent',
    });
    expect(mockMetrics.increment).toBeCalledTimes(1);
    expect(mockMetrics.increment).toBeCalledWith('sms.send.sent');
  });

  it('Retries but eventually fails if send rate limit exceeded.', async () => {
    const mockError = new Error();
    (mockError as any).code = TwilioErrorCodes.SMS_SEND_RATE_LIMIT_EXCEEDED;

    mockTwilioSmsClient.messages.create.mockRejectedValue(mockError);
    const body = 'test success';
    await expect(
      manager.sendSMS({
        to,
        body,
      })
    ).rejects.toThrow(
      'Too many SMS are currently being sent. Try again later.'
    );

    expect(mockLog.log).toBeCalledTimes(0);
    expect(mockMetrics.increment).toBeCalledTimes(1);
    expect(mockTwilioSmsClient.messages.create).toBeCalledTimes(3); // initial call + config.maxRetries.
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

  it('Rotates numbers', () => {
    const number1 = manager.rotateFromNumber();
    const number2 = manager.rotateFromNumber();

    expect(number1).toBeDefined();
    expect(number2).toBeDefined();
    expect(number1).not.toEqual(number2);
  });

  describe('phoneNumberLookup', () => {
    it('should increment metrics and return result on success', async () => {
      const phoneNumber = '+15005551111';
      const mockResult = {
        simSwap: { lastSimSwap: { swappedPeriod: '1' } },
        smsPumpingRisk: { smsPumpingRiskScore: 0.5 },
        phoneNumberQualityScore: 0.8,
        toJSON: jest.fn().mockReturnValue({ phoneNumber }),
      };

      mockTwilioSmsClient.lookups.v2.phoneNumbers.mockReturnValue({
        fetch: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await manager.phoneNumberLookup(phoneNumber);

      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'sms.phoneNumberLookup.start'
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'sms.phoneNumberLookup.success'
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'sms.phoneNumberLookup.success.simSwap',
        { period: '1' }
      );
      expect(mockMetrics.histogram).toHaveBeenCalledWith(
        'sms.phoneNumberLookup.success.smsPumpingRisk',
        0.5
      );
      expect(mockMetrics.histogram).toHaveBeenCalledWith(
        'sms.phoneNumberLookup.success.phoneNumberQualityScore',
        0.8
      );
      expect(result).toEqual({ phoneNumber });
    });

    it('should increment failed metric and throw error on failure', async () => {
      const phoneNumber = '+15005551111';
      const mockError = new Error('Lookup failed');

      mockTwilioSmsClient.lookups.v2.phoneNumbers.mockReturnValue({
        fetch: jest.fn().mockRejectedValue(mockError),
      });

      await expect(manager.phoneNumberLookup(phoneNumber)).rejects.toThrow(
        mockError
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'sms.phoneNumberLookup.start'
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'sms.phoneNumberLookup.failure'
      );
    });
  });

  describe('message status updates', () => {
    it('records message status update for delivered', () => {
      manager.messageStatus({
        AccountSid: 'AC123',
        MessageSid: 'M123',
        From: '+1234567890',
        MessageStatus: 'delivered',
        RawDlrDoneDate: 'TWILIO_DATE_FORMAT',
      });
      expect(mockMetrics.increment).toBeCalledTimes(1);
      expect(mockMetrics.increment).toBeCalledWith(
        'recovery-phone.message.status.delivered'
      );
      expect(mockLog.log).toBeCalledWith(
        'recovery-phone.message.status.delivered',
        {
          From: '+1234567890',
          MessageSid: 'M123',
          RawDlrDoneDate: 'TWILIO_DATE_FORMAT',
        }
      );
    });

    it('records message status update for failed', () => {
      manager.messageStatus({
        AccountSid: 'AC123',
        MessageSid: 'M123',
        From: '+1234567890',
        MessageStatus: 'failed',
        ErrorCode: '4000',
      });
      expect(mockMetrics.increment).toBeCalledTimes(2);
      expect(mockMetrics.increment).toBeCalledWith(
        'recovery-phone.message.status.failed'
      );
      expect(mockMetrics.increment).toBeCalledWith(
        'recovery-phone.message.status.error.4000'
      );
      expect(mockLog.log).toBeCalledWith(
        'recovery-phone.message.status.failed',
        {
          From: '+1234567890',
          MessageSid: 'M123',
          ErrorCode: '4000',
        }
      );
    });

    it('records message status update for undelivered', () => {
      manager.messageStatus({
        AccountSid: 'AC123',
        MessageSid: 'M123',
        From: '+1234567890',
        MessageStatus: 'undelivered',
        ErrorCode: '4000',
      });
      expect(mockMetrics.increment).toBeCalledTimes(2);
      expect(mockMetrics.increment).toBeCalledWith(
        'recovery-phone.message.status.undelivered'
      );
      expect(mockMetrics.increment).toBeCalledWith(
        'recovery-phone.message.status.error.4000'
      );
      expect(mockLog.log).toBeCalledWith(
        'recovery-phone.message.status.undelivered',
        {
          From: '+1234567890',
          MessageSid: 'M123',
          ErrorCode: '4000',
        }
      );
    });

    it('records message status update for unimportant status', () => {
      manager.messageStatus({
        AccountSid: 'AC123',
        MessageSid: 'M123',
        From: '+1234567890',
        MessageStatus: 'sending',
      });
      expect(mockMetrics.increment).toBeCalledTimes(1);
      expect(mockMetrics.increment).toBeCalledWith(
        'recovery-phone.message.status.sending'
      );
      expect(mockLog.log).toBeCalledTimes(0);
    });
  });
});
