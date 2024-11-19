/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryPhoneService } from './recovery-phone.service';
import { OtpManager } from '@fxa/shared/otp';
import { SmsManager } from './sms.manager';
import { RecoveryPhoneServiceConfig } from './recovery-phone.service.config';
import { RecoveryPhoneManager } from './recovery-phone.manager';
import { RecoveryNumberNotSupportedError } from './recovery-phone.errors';

describe('RecoveryPhoneService', () => {
  const phoneNumber = '+15005551234';
  const uid = '0123456789abcdef0123456789abcdef';
  const code = '000000';

  const mockSmsManager = { sendSMS: jest.fn().mockReturnValue(true) };
  const mockRecoveryPhoneManager = {
    storeUnconfirmed: jest.fn(),
    getUnconfirmed: jest.fn(),
    registerPhoneNumber: jest.fn(),
  };
  const mockOtpManager = { generateCode: jest.fn() };
  const mockRecoveryPhoneServiceConfig = {
    allowedNumbers: ['+1500'],
  };
  const mockError = new Error('BOOM');

  let service: RecoveryPhoneService;

  beforeEach(async () => {
    jest.resetAllMocks();
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
    expect(service.setupPhoneNumber(uid, to)).rejects.toEqual(
      new RecoveryNumberNotSupportedError(uid, to)
    );
  });

  it('Throws error during send sms', () => {
    mockSmsManager.sendSMS.mockRejectedValueOnce(mockError);
    expect(service.setupPhoneNumber(uid, phoneNumber)).rejects.toEqual(
      mockError
    );
  });

  it('Throws error during otp code creation', () => {
    mockOtpManager.generateCode.mockRejectedValueOnce(mockError);
    expect(service.setupPhoneNumber(uid, phoneNumber)).rejects.toEqual(
      mockError
    );
  });

  it('throws error during storing of unconfirmed number', () => {
    mockRecoveryPhoneManager.storeUnconfirmed.mockRejectedValueOnce(mockError);
    expect(service.setupPhoneNumber(uid, phoneNumber)).rejects.toEqual(
      mockError
    );
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
});
