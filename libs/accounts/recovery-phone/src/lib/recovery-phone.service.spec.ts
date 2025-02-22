/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryPhoneService } from './recovery-phone.service';
import { OtpManager } from '@fxa/shared/otp';
import { SmsManager } from './sms.manager';
import { RecoveryPhoneConfig } from './recovery-phone.service.config';
import { RecoveryPhoneManager } from './recovery-phone.manager';
import {
  RecoveryNumberNotExistsError,
  RecoveryNumberNotSupportedError,
  RecoveryPhoneNotEnabled,
  RecoveryNumberRemoveMissingBackupCodes,
  RecoveryPhoneRegistrationLimitReached,
} from './recovery-phone.errors';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { MessageStatus } from 'twilio/lib/rest/api/v2010/account/message';
import { TwilioConfig } from './twilio.config';
import { getExpectedTwilioSignature } from 'twilio/lib/webhooks/webhooks';
import { SegmentedMessage } from 'sms-segments-calculator';

describe('RecoveryPhoneService', () => {
  const phoneNumber = '+15005551234';
  const uid = '0123456789abcdef0123456789abcdef';
  const code = '000000';

  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockMetrics = {
    gauge: jest.fn(),
    increment: jest.fn(),
  };

  const mockSmsManager = {
    sendSMS: jest.fn(),
    phoneNumberLookup: jest.fn(),
    messageStatus: jest.fn(),
    checkMessageSegments: jest.fn(),
  };

  const mockRecoveryPhoneManager = {
    storeUnconfirmed: jest.fn(),
    getUnconfirmed: jest.fn(),
    getAllUnconfirmed: jest.fn(),
    registerPhoneNumber: jest.fn(),
    removePhoneNumber: jest.fn(),
    getConfirmedPhoneNumber: jest.fn(),
    hasRecoveryCodes: jest.fn(),
    removeCode: jest.fn(),
    getCountByPhoneNumber: jest.fn(),
  };

  const mockOtpManager = {
    generateCode: jest.fn(),
  };

  const mockRecoveryPhoneConfig: RecoveryPhoneConfig = {
    enabled: true,
    allowedRegions: ['US'],
    maxRegistrationsPerNumber: 5,
    sms: {
      validNumberPrefixes: ['+1500'],
      smsPumpingRiskThreshold: 75,
    },
  } satisfies RecoveryPhoneConfig;

  const mockTwilioConfig: TwilioConfig = {
    accountSid: 'AC00000000000000000000000000000000',
    authToken: '00000000000000000000000000000000',
    webhookUrl: 'http://accounts.firefox.com/recovery-phone/message-status',
    validateWebhookCalls: true,
  } satisfies TwilioConfig;

  const mockGetFormattedMessage = async (code: string) => {
    return {
      msg: `${code} is your Mozilla verification code. Expires in 5 minutes.`,
      shortMsg: `Mozilla verification code: ${code}`,
      failsafeMsg: `Mozilla: ${code}`,
    };
  };

  const mockError = new Error('BOOM');

  let service: RecoveryPhoneService;

  beforeEach(async () => {
    mockSmsManager.sendSMS.mockReturnValue({ status: 'success' });
    mockSmsManager.checkMessageSegments.mockImplementation((msg: string) => {
      const sm = new SegmentedMessage(msg);
      return {
        overLimit: sm.segmentsCount > 1,
        segmentedMessage: sm,
      };
    });
    mockRecoveryPhoneManager.hasRecoveryCodes.mockResolvedValue(true);
    mockRecoveryPhoneManager.getAllUnconfirmed.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SmsManager, useValue: mockSmsManager },
        { provide: RecoveryPhoneManager, useValue: mockRecoveryPhoneManager },
        { provide: OtpManager, useValue: mockOtpManager },
        {
          provide: RecoveryPhoneConfig,
          useValue: mockRecoveryPhoneConfig,
        },
        {
          provide: TwilioConfig,
          useValue: mockTwilioConfig,
        },
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: StatsDService,
          useValue: mockMetrics,
        },
        RecoveryPhoneService,
      ],
    }).compile();
    service = module.get<RecoveryPhoneService>(RecoveryPhoneService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Should be injectable', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(RecoveryPhoneService);
  });

  it('Should setup a phone number', async () => {
    mockOtpManager.generateCode.mockReturnValue(code);

    const result = await service.setupPhoneNumber(
      uid,
      phoneNumber,
      mockGetFormattedMessage
    );

    expect(result).toBeTruthy();
    expect(mockOtpManager.generateCode).toBeCalled();
    expect(mockSmsManager.sendSMS).toBeCalledWith({
      to: phoneNumber,
      body: (await mockGetFormattedMessage(code)).msg,
    });
    expect(mockRecoveryPhoneManager.storeUnconfirmed).toBeCalledWith(
      uid,
      code,
      phoneNumber,
      true
    );
    expect(mockRecoveryPhoneManager.getAllUnconfirmed).toBeCalledWith(uid);
    expect(result).toBeTruthy();
  });

  it('Should send new code to set up a phone number', async () => {
    mockOtpManager.generateCode.mockReturnValue(code);
    mockRecoveryPhoneManager.getAllUnconfirmed.mockResolvedValue([
      'this:is:the:code123',
      'this:is:the:code456',
    ]);

    const result = await service.setupPhoneNumber(
      uid,
      phoneNumber,
      mockGetFormattedMessage
    );

    expect(result).toBeTruthy();
    expect(mockRecoveryPhoneManager.removeCode).toBeCalledWith(uid, 'code123');
    expect(mockRecoveryPhoneManager.removeCode).toBeCalledWith(uid, 'code456');
    expect(mockOtpManager.generateCode).toBeCalled();
    expect(mockSmsManager.sendSMS).toBeCalledWith({
      to: phoneNumber,
      body: (await mockGetFormattedMessage(code)).msg,
    });
    expect(mockRecoveryPhoneManager.storeUnconfirmed).toBeCalledWith(
      uid,
      code,
      phoneNumber,
      true
    );
    expect(mockRecoveryPhoneManager.getAllUnconfirmed).toBeCalledWith(uid);
  });

  it('handles message template when provided to set up phone number', async () => {
    mockOtpManager.generateCode.mockReturnValue(code);

    const result = await service.setupPhoneNumber(
      uid,
      phoneNumber,
      mockGetFormattedMessage
    );

    expect(result).toBeTruthy();
    expect(mockOtpManager.generateCode).toBeCalled();
    expect(mockSmsManager.sendSMS).toBeCalledWith({
      to: phoneNumber,
      body: (await mockGetFormattedMessage(code)).msg,
    });
    expect(mockRecoveryPhoneManager.storeUnconfirmed).toBeCalledWith(
      uid,
      code,
      phoneNumber,
      true
    );
    expect(mockRecoveryPhoneManager.getAllUnconfirmed).toBeCalledWith(uid);
  });

  it('Will reject a phone number that is not part of launch', async () => {
    const to = '+16005551234';
    await expect(
      service.setupPhoneNumber(uid, to, mockGetFormattedMessage)
    ).rejects.toEqual(new RecoveryNumberNotSupportedError(to));
  });

  it('Will reject a phone number if it has been used for too many accounts', async () => {
    mockRecoveryPhoneManager.getCountByPhoneNumber.mockReturnValue(5);

    await expect(
      service.setupPhoneNumber(uid, phoneNumber, mockGetFormattedMessage)
    ).rejects.toEqual(new RecoveryPhoneRegistrationLimitReached(phoneNumber));
  });

  it('Throws error during send sms', async () => {
    mockSmsManager.sendSMS.mockRejectedValueOnce(mockError);
    await expect(
      service.setupPhoneNumber(uid, phoneNumber, mockGetFormattedMessage)
    ).rejects.toEqual(mockError);
  });

  it('Throws error during otp code creation', async () => {
    mockOtpManager.generateCode.mockRejectedValueOnce(mockError);
    await expect(
      service.setupPhoneNumber(uid, phoneNumber, mockGetFormattedMessage)
    ).rejects.toEqual(mockError);
  });

  it('throws error during storing of unconfirmed number', async () => {
    mockRecoveryPhoneManager.storeUnconfirmed.mockRejectedValueOnce(mockError);
    await expect(
      service.setupPhoneNumber(uid, phoneNumber, mockGetFormattedMessage)
    ).rejects.toEqual(mockError);
  });

  describe('has confirmed code', () => {
    it('can determine confirmed phone number exists', async () => {
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockReturnValueOnce({
        phoneNumber,
      });

      const result = await service.hasConfirmed(uid);

      expect(result.exists).toBeTruthy();
      expect(result.phoneNumber).toEqual(phoneNumber);
      expect(
        mockRecoveryPhoneManager.getConfirmedPhoneNumber
      ).toHaveBeenCalledWith(uid);
    });

    it('can return stripped phone number', async () => {
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockReturnValueOnce({
        phoneNumber,
      });

      const result = await service.hasConfirmed(uid, 4);

      expect(result.phoneNumber).toEqual('1234');
      expect(
        mockRecoveryPhoneManager.getConfirmedPhoneNumber
      ).toHaveBeenCalledWith(uid);
    });

    it('can determine confirmed phone number does not exist', async () => {
      const mockError = new RecoveryNumberNotExistsError(uid);
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockRejectedValueOnce(
        mockError
      );

      const result = await service.hasConfirmed(uid);

      expect(result.exists).toEqual(false);
      expect(result.phoneNumber).toBeUndefined();
      expect(
        mockRecoveryPhoneManager.getConfirmedPhoneNumber
      ).toHaveBeenCalledWith(uid);
    });

    it('can propagate unexpected error', () => {
      const mockError = new Error(uid);
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockRejectedValueOnce(
        mockError
      );

      expect(service.hasConfirmed(uid)).rejects.toEqual(mockError);
    });
  });

  describe('confirm setup code', () => {
    it('can confirm valid sms code used for setup', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue({
        isSetup: true,
      });
      mockRecoveryPhoneManager.registerPhoneNumber.mockReturnValue(true);

      const result = await service.confirmSetupCode(uid, code);

      expect(result).toBeTruthy();
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
    });

    it('can handle smsPumpingRisk score throwing PhoneNumberNotSupported error', async () => {
      const phoneNumber = '+15005550000';
      const smsPumpingRisk = 95;

      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValueOnce({
        isSetup: true,
        phoneNumber,
      });
      mockSmsManager.phoneNumberLookup.mockReturnValueOnce({
        phoneNumber,
        smsPumpingRisk,
      });

      const promise = service.confirmSetupCode(uid, code);
      await expect(promise).rejects.toThrow(/Phone number not supported.*/);
      expect(mockMetrics.gauge).toBeCalledWith(
        'sim_pumping_risk',
        smsPumpingRisk
      );
      expect(mockMetrics.increment).toBeCalledWith('sim_pumping_risk.denied');
      expect(mockLogger.error).toBeCalledWith(
        'RecoveryPhoneService.smsPumpingRisk',
        {
          phoneNumber,
          smsPumpingRisk,
        }
      );
    });

    it('rejects phone number that has been used for too many accounts', async () => {
      const phoneNumber = '+15005550000';
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue({
        isSetup: true,
        phoneNumber,
      });
      mockRecoveryPhoneManager.getCountByPhoneNumber.mockResolvedValue(5);

      await expect(service.confirmSetupCode(uid, code)).rejects.toThrow(
        new RecoveryPhoneRegistrationLimitReached(phoneNumber)
      );
    });

    it('can handle failed lookup by throwing PhoneNumberNotSupported error', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue({
        isSetup: true,
      });
      mockSmsManager.phoneNumberLookup.mockRejectedValueOnce(new Error('BOOM'));

      const promise = service.confirmSetupCode(uid, code);

      await expect(promise).rejects.toThrow(/Phone number not supported.*/);
      expect(mockLogger.error).toBeCalledTimes(1);
    });

    it('will not confirm a valid sms code for signin', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue({});

      const result = await service.confirmSetupCode(uid, code);

      expect(result).toBeFalsy();
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
    });

    it('can confirm valid sms code used for setup', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockResolvedValue({
        isSetup: true,
        phoneNumber,
      });
      mockRecoveryPhoneManager.registerPhoneNumber.mockResolvedValue({});
      mockSmsManager.phoneNumberLookup.mockResolvedValueOnce({
        phoneNumber: '+15005550000',
      });

      const result = await service.confirmSetupCode(uid, code);

      expect(result).toEqual(true);
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
      expect(mockRecoveryPhoneManager.registerPhoneNumber).toBeCalledWith(
        uid,
        phoneNumber,
        { phoneNumber: '+15005550000' }
      );
    });

    it('can indicate invalid sms code', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue(null);

      const result = await service.confirmSetupCode(uid, code);

      expect(result).toEqual(false);
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
    });

    it('throws library error while confirming sms code', () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockRejectedValueOnce(mockError);
      expect(service.confirmSetupCode(uid, code)).rejects.toEqual(mockError);
    });

    it('throws library error while registering phone number for sms code', () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockResolvedValue({
        isSetup: true,
      });
      mockRecoveryPhoneManager.registerPhoneNumber.mockRejectedValue(mockError);
      expect(service.confirmSetupCode(uid, code)).rejects.toEqual(mockError);
    });
  });

  describe('confirm signin code', () => {
    it('can confirm valid sms code', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue({});

      const result = await service.confirmSigninCode(uid, code);

      expect(result).toBeTruthy();
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
    });

    it('will not confirm valid sms code used for setup', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue({
        isSetup: true,
      });

      const result = await service.confirmSigninCode(uid, code);

      expect(result).toBeFalsy();
    });

    it('will not confirm unknown sms code used', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue(null);

      const result = await service.confirmSigninCode(uid, code);

      expect(result).toBeFalsy();
    });
  });

  describe('removePhoneNumber', () => {
    it('should remove a phone number', async () => {
      mockRecoveryPhoneManager.removePhoneNumber.mockResolvedValueOnce(true);
      const result = await service.removePhoneNumber(uid);
      expect(result).toBeTruthy();
      expect(mockRecoveryPhoneManager.removePhoneNumber).toBeCalledWith(uid);
    });

    it('should throw if phone number not found', () => {
      const error = new RecoveryNumberNotExistsError(uid);
      mockRecoveryPhoneManager.removePhoneNumber.mockRejectedValueOnce(error);
      expect(service.removePhoneNumber(uid)).rejects.toThrow(error);
    });

    it('should throw if missing backup authentication codes', () => {
      mockRecoveryPhoneManager.hasRecoveryCodes.mockResolvedValue(false);
      const error = new RecoveryNumberRemoveMissingBackupCodes(uid);
      mockRecoveryPhoneManager.removePhoneNumber.mockRejectedValueOnce(error);
      expect(service.removePhoneNumber(uid)).rejects.toThrow(error);
    });
  });

  describe('sendCode', () => {
    it('should send sms code', async () => {
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockResolvedValueOnce({
        phoneNumber,
      });
      mockOtpManager.generateCode.mockResolvedValueOnce(code);
      mockSmsManager.sendSMS.mockResolvedValue({ status: 'success' });

      const result = await service.sendCode(uid, mockGetFormattedMessage);

      expect(result).toBeTruthy();
      expect(mockRecoveryPhoneManager.getConfirmedPhoneNumber).toBeCalledWith(
        uid
      );
      expect(mockRecoveryPhoneManager.storeUnconfirmed).toBeCalledWith(
        uid,
        code,
        phoneNumber,
        false
      );
      expect(mockOtpManager.generateCode).toBeCalled();
      expect(mockSmsManager.sendSMS).toBeCalledWith({
        to: phoneNumber,
        body: (await mockGetFormattedMessage(code)).msg,
      });
    });

    it('should fallback to the short message', async () => {
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockResolvedValueOnce({
        phoneNumber,
      });
      mockOtpManager.generateCode.mockResolvedValueOnce(code);
      mockSmsManager.sendSMS.mockResolvedValue({ status: 'success' });

      const result = await service.sendCode(uid, async () => ({
        msg: new Array(161).fill('z').join(''),
        shortMsg: `Your Mozilla Account code is ${code}`,
        failsafeMsg: `${code}`,
      }));

      expect(result).toBeTruthy();
      expect(mockSmsManager.sendSMS).toBeCalledWith({
        to: phoneNumber,
        body: `Your Mozilla Account code is ${code}`,
      });
    });

    it('should fallback to the fail safe message', async () => {
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockResolvedValueOnce({
        phoneNumber,
      });
      mockOtpManager.generateCode.mockResolvedValueOnce(code);
      mockSmsManager.sendSMS.mockResolvedValue({ status: 'success' });

      const result = await service.sendCode(uid, async () => ({
        msg: new Array(161).fill('z').join(''),
        shortMsg: new Array(161).fill('z').join(''),
        failsafeMsg: `Failsafe: ${code}`,
      }));

      expect(result).toBeTruthy();
      expect(mockSmsManager.sendSMS).toBeCalledWith({
        to: phoneNumber,
        body: `Failsafe: ${code}`,
      });
    });

    it('should return false if message fails to send', async () => {
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockResolvedValueOnce(
        phoneNumber
      );
      mockOtpManager.generateCode.mockResolvedValueOnce(code);
      mockSmsManager.sendSMS.mockResolvedValue({ status: 'failed' });

      const result = await service.sendCode(uid, mockGetFormattedMessage);

      expect(result).toBeFalsy();
    });

    it('should throw error if recovery phone number does not exist', async () => {
      const error = new RecoveryNumberNotExistsError(uid);
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockRejectedValue(error);
      expect(service.sendCode(uid, mockGetFormattedMessage)).rejects.toThrow(
        error
      );
    });

    it('Should send new code for setup phone number', async () => {
      mockOtpManager.generateCode.mockReturnValue(code);
      mockRecoveryPhoneManager.getAllUnconfirmed.mockResolvedValue([
        'this:is:the:code123',
        'this:is:the:code456',
      ]);

      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockResolvedValueOnce({
        phoneNumber,
      });
      mockOtpManager.generateCode.mockResolvedValueOnce(code);
      mockSmsManager.sendSMS.mockResolvedValue({ status: 'success' });

      const result = await service.sendCode(uid, mockGetFormattedMessage);

      expect(result).toBeTruthy();
      expect(mockRecoveryPhoneManager.getConfirmedPhoneNumber).toBeCalledWith(
        uid
      );
      expect(mockRecoveryPhoneManager.storeUnconfirmed).toBeCalledWith(
        uid,
        code,
        phoneNumber,
        false
      );
      expect(mockOtpManager.generateCode).toBeCalled();
      expect(mockSmsManager.sendSMS).toBeCalledWith({
        to: phoneNumber,
        body: (await mockGetFormattedMessage(code)).msg,
      });

      expect(mockRecoveryPhoneManager.removeCode).toBeCalledWith(
        uid,
        'code123'
      );
      expect(mockRecoveryPhoneManager.removeCode).toBeCalledWith(
        uid,
        'code456'
      );
      expect(mockRecoveryPhoneManager.getAllUnconfirmed).toBeCalledWith(uid);
    });
  });

  describe('available', () => {
    const region = 'US';

    beforeEach(() => {
      mockRecoveryPhoneConfig.enabled = true;
      mockRecoveryPhoneConfig.allowedRegions = ['US'];
    });

    it('should return false if region is not in allowedRegions', async () => {
      mockRecoveryPhoneConfig.allowedRegions = ['USA'];
      const result = await service.available(uid, region);
      expect(result).toBe(false);
    });

    it('should return false if user has confirmed phone number', async () => {
      jest.spyOn(service, 'hasConfirmed').mockResolvedValue({ exists: true });
      const result = await service.available(uid, region);
      expect(result).toBe(false);
    });

    it('should return true if user has recovery codes', async () => {
      jest.spyOn(service, 'hasConfirmed').mockResolvedValue({ exists: false });
      mockRecoveryPhoneManager.hasRecoveryCodes.mockResolvedValueOnce(true);
      const result = await service.available(uid, region);
      expect(result).toBe(true);
    });

    it('should return false if user does not have recovery codes', async () => {
      jest.spyOn(service, 'hasConfirmed').mockResolvedValue({ exists: false });
      mockRecoveryPhoneManager.hasRecoveryCodes.mockResolvedValueOnce(false);
      const result = await service.available(uid, region);
      expect(result).toBe(false);
    });
  });

  describe('can disabled service', () => {
    beforeAll(() => {
      mockRecoveryPhoneConfig.enabled = false;
    });
    afterAll(() => {
      mockRecoveryPhoneConfig.enabled = true;
    });
    it('can disable', () => {
      expect(service.available(uid, 'US')).resolves.toEqual(false);
      expect(service.confirmSetupCode(uid, '000000')).rejects.toEqual(
        new RecoveryPhoneNotEnabled()
      );
      expect(service.confirmSigninCode(uid, '000000')).rejects.toEqual(
        new RecoveryPhoneNotEnabled()
      );
      expect(service.sendCode(uid, mockGetFormattedMessage)).rejects.toEqual(
        new RecoveryPhoneNotEnabled()
      );
      expect(
        service.setupPhoneNumber(uid, '+15550005555', mockGetFormattedMessage)
      ).rejects.toEqual(new RecoveryPhoneNotEnabled());
    });
  });

  describe('strip phone number', () => {
    it('can strip number', () => {
      const phoneNumber = '+123456789';

      expect(service.stripPhoneNumber(phoneNumber)).toEqual(phoneNumber);
      expect(service.stripPhoneNumber(phoneNumber, -1)).toEqual('');
      expect(service.stripPhoneNumber(phoneNumber, 0)).toEqual('');
      expect(service.stripPhoneNumber(phoneNumber, 2)).toEqual('89');
      expect(service.stripPhoneNumber(phoneNumber, 4)).toEqual('6789');
      expect(service.stripPhoneNumber(phoneNumber, 9)).toEqual('123456789');
      expect(service.stripPhoneNumber(phoneNumber, 12)).toEqual('123456789');
    });
    it('can strip NANP national_format number and should not display format', () => {
      const phoneNumber = '(123) 456-7890';

      expect(service.stripPhoneNumber(phoneNumber)).toEqual(phoneNumber);
      expect(service.stripPhoneNumber(phoneNumber, -1)).toEqual('');
      expect(service.stripPhoneNumber(phoneNumber, 0)).toEqual('');
      expect(service.stripPhoneNumber(phoneNumber, 4)).toEqual('7890');
      expect(service.stripPhoneNumber(phoneNumber, 10)).toEqual('1234567890');
      expect(service.stripPhoneNumber(phoneNumber, 12)).toEqual('1234567890');
    });
    it('can strip non-NANP national_format number and should not display format', () => {
      const phoneNumber = '+33 9 87 65 43 21';

      expect(service.stripPhoneNumber(phoneNumber)).toEqual(phoneNumber);
      expect(service.stripPhoneNumber(phoneNumber, -1)).toEqual('');
      expect(service.stripPhoneNumber(phoneNumber, 0)).toEqual('');
      expect(service.stripPhoneNumber(phoneNumber, 4)).toEqual('4321');
      expect(service.stripPhoneNumber(phoneNumber, 9)).toEqual('987654321');
      expect(service.stripPhoneNumber(phoneNumber, 12)).toEqual('33987654321');
    });
    it('can handle being passed an empty string', () => {
      const phoneNumber = '';
      expect(service.stripPhoneNumber(phoneNumber, 4)).toEqual('');
    });
  });

  describe('can handle message status update', () => {
    it('can handle message status update', async () => {
      const messageUpdate = {
        AccountSid: 'AC123',
        From: '+123456789',
        MessageSid: 'MS123',
        MessageStatus: 'delivered' as MessageStatus,
      };
      await service.onMessageStatusUpdate(messageUpdate);
      expect(mockSmsManager.messageStatus).toBeCalledWith(messageUpdate);
    });
  });

  describe('verify twilio signature', () => {
    // This is how Twilio generates the signature, see following doc for more info:
    // https://www.twilio.com/docs/usage/security#test-the-validity-of-your-webhook-signature
    const signature = getExpectedTwilioSignature(
      mockTwilioConfig.authToken,
      mockTwilioConfig.webhookUrl,
      {
        foo: 'bar',
      }
    );

    afterEach(() => {
      mockTwilioConfig.validateWebhookCalls = true;
    });

    it('can validate twilio signature', () => {
      const valid = service.validateTwilioSignature(signature, {
        foo: 'bar',
      });
      expect(valid).toBeTruthy();
    });

    it('can invalidate twilio signature due to bad payload', () => {
      const valid = service.validateTwilioSignature(signature, {
        foo: 'bar',
        bar: 'baz',
      });
      expect(valid).toBeFalsy();
    });

    it('can invalidate twilio signature due to bad signature', () => {
      const valid = service.validateTwilioSignature(signature + '0', {
        foo: 'bar',
      });
      expect(valid).toBeFalsy();
    });

    it('will always validate if validateWebhookCalls is false', () => {
      mockTwilioConfig.validateWebhookCalls = false;
      const valid = service.validateTwilioSignature(signature + '0', {
        foo: 'bar',
      });
      expect(valid).toBeTruthy();
    });
  });
});
