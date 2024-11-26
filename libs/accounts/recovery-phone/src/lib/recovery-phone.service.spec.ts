/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryPhoneService } from './recovery-phone.service';
import { OtpManager } from '@fxa/shared/otp';
import { SmsManager } from './sms.manager';
import { RecoveryPhoneServiceConfig } from './recovery-phone.service.config';
import { RecoveryPhoneManager } from './recovery-phone.manager';
import {
  RecoveryNumberNotExistsError,
  RecoveryNumberNotSupportedError,
} from './recovery-phone.errors';

describe('RecoveryPhoneService', () => {
  const phoneNumber = '+15005551234';
  const uid = '0123456789abcdef0123456789abcdef';
  const code = '000000';

  const mockSmsManager = {
    sendSMS: jest.fn(),
  };
  const mockRecoveryPhoneManager = {
    storeUnconfirmed: jest.fn(),
    getUnconfirmed: jest.fn(),
    registerPhoneNumber: jest.fn(),
    removePhoneNumber: jest.fn(),
    getConfirmedPhoneNumber: jest.fn(),
  };
  const mockOtpManager = { generateCode: jest.fn() };
  const mockRecoveryPhoneServiceConfig = {
    validNumberPrefixes: ['+1500'],
  };
  const mockError = new Error('BOOM');

  let service: RecoveryPhoneService;

  beforeEach(async () => {
    jest.resetAllMocks();
    mockSmsManager.sendSMS.mockReturnValue({ status: 'success' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SmsManager, useValue: mockSmsManager },
        { provide: RecoveryPhoneManager, useValue: mockRecoveryPhoneManager },
        { provide: OtpManager, useValue: mockOtpManager },
        {
          provide: RecoveryPhoneServiceConfig,
          useValue: mockRecoveryPhoneServiceConfig,
        },
        RecoveryPhoneService,
      ],
    }).compile();
    service = module.get<RecoveryPhoneService>(RecoveryPhoneService);
  });

  it('Should be injectable', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(RecoveryPhoneService);
  });

  it('Should setup a phone number', async () => {
    mockOtpManager.generateCode.mockReturnValue(code);

    const result = await service.setupPhoneNumber(uid, phoneNumber);

    expect(result).toBeTruthy();
    expect(mockOtpManager.generateCode).toBeCalled();
    expect(mockSmsManager.sendSMS).toBeCalledWith({
      to: phoneNumber,
      body: code,
    });
    expect(mockRecoveryPhoneManager.storeUnconfirmed).toBeCalledWith(
      uid,
      phoneNumber,
      code,
      true
    );
    expect(result).toBeTruthy();
  });

  it('Will reject a phone number that is not part of launch', async () => {
    const to = '+16005551234';
    await expect(service.setupPhoneNumber(uid, to)).rejects.toEqual(
      new RecoveryNumberNotSupportedError(to)
    );
  });

  it('Throws error during send sms', async () => {
    mockSmsManager.sendSMS.mockRejectedValueOnce(mockError);
    await expect(service.setupPhoneNumber(uid, phoneNumber)).rejects.toEqual(
      mockError
    );
  });

  it('Throws error during otp code creation', async () => {
    mockOtpManager.generateCode.mockRejectedValueOnce(mockError);
    await expect(service.setupPhoneNumber(uid, phoneNumber)).rejects.toEqual(
      mockError
    );
  });

  it('throws error during storing of unconfirmed number', async () => {
    mockRecoveryPhoneManager.storeUnconfirmed.mockRejectedValueOnce(mockError);
    await expect(service.setupPhoneNumber(uid, phoneNumber)).rejects.toEqual(
      mockError
    );
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

  describe('confirm code', () => {
    it('can confirm valid sms code', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue({});

      const result = await service.confirmCode(uid, code);

      expect(result).toBeTruthy();
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
    });

    it('can confirm valid sms code used for setup', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue({
        isSetup: true,
      });
      mockRecoveryPhoneManager.registerPhoneNumber.mockReturnValue(true);

      const result = await service.confirmCode(uid, code);

      expect(result).toBeTruthy();
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
    });

    it('can confirm valid sms code used for setup', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockResolvedValue({
        isSetup: true,
        phoneNumber,
      });
      mockRecoveryPhoneManager.registerPhoneNumber.mockResolvedValue({});

      const result = await service.confirmCode(uid, code);

      expect(result).toEqual(true);
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
      expect(mockRecoveryPhoneManager.registerPhoneNumber).toBeCalledWith(
        uid,
        phoneNumber
      );
    });

    it('can indicate invalid sms code', async () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockReturnValue(null);

      const result = await service.confirmCode(uid, code);

      expect(result).toEqual(false);
      expect(mockRecoveryPhoneManager.getUnconfirmed).toBeCalledWith(uid, code);
    });

    it('throws library error while confirming sms code', () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockRejectedValueOnce(mockError);
      expect(service.confirmCode(uid, code)).rejects.toEqual(mockError);
    });

    it('throws library error while registering phone number for sms code', () => {
      mockRecoveryPhoneManager.getUnconfirmed.mockResolvedValue({
        isSetup: true,
      });
      mockRecoveryPhoneManager.registerPhoneNumber.mockRejectedValue(mockError);
      expect(service.confirmCode(uid, code)).rejects.toEqual(mockError);
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
  });

  describe('sendCode', () => {
    it('should send sms code', async () => {
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockResolvedValueOnce(
        phoneNumber
      );
      mockOtpManager.generateCode.mockResolvedValueOnce(code);
      mockSmsManager.sendSMS.mockResolvedValue({ status: 'success' });

      const result = await service.sendCode(uid);

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
        body: code,
      });
    });

    it('should return false if message fails to send', async () => {
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockResolvedValueOnce(
        phoneNumber
      );
      mockOtpManager.generateCode.mockResolvedValueOnce(code);
      mockSmsManager.sendSMS.mockResolvedValue({ status: 'failed' });

      const result = await service.sendCode(uid);

      expect(result).toBeFalsy();
    });

    it('should throw error if phone number does not exist', async () => {
      const error = new RecoveryNumberNotExistsError(uid);
      mockRecoveryPhoneManager.getConfirmedPhoneNumber.mockRejectedValue(error);
      expect(service.sendCode(uid)).rejects.toThrow(error);
    });
  });
});
