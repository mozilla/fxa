/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { AppError } from '@fxa/accounts/errors';
import { AccountManager } from '@fxa/shared/account/account';
import {
  RecoveryNumberNotSupportedError,
  SmsSendRateLimitExceededError,
  RecoveryPhoneService,
  RecoveryPhoneRegistrationLimitReached,
} from '@fxa/accounts/recovery-phone';

const mocks = require('../../test/mocks');
const { recoveryPhoneRoutes } = require('./recovery-phone');
const { OtpUtils } = require('./utils/otp');
const { getRoute } = require('../../test/routes_helpers');
const { mockRequest } = require('../../test/mocks');
const { AccountEventsManager } = require('../account-events');

describe('/recovery_phone', () => {
  const uid = '123435678123435678123435678123435678';
  const email = 'test@mozilla.com';
  const phoneNumber = '+15550005555';
  const nationalFormat = '(555) 000-5555';
  const code = '000000';
  const mockDb = mocks.mockDB({ uid: uid, email: email });
  const mockLog = mocks.mockLog();
  let mockMailer: any;
  let mockFxaMailer: any;

  const mockCustoms = {
    check: jest.fn(),
    checkAuthenticated: jest.fn(),
  };
  const mockStatsd = {
    increment: jest.fn(),
    histogram: jest.fn(),
  };
  const mockGlean = {
    login: {
      recoveryPhoneSuccess: jest.fn(),
    },
    twoStepAuthPhoneCode: {
      sent: jest.fn(),
      sendError: jest.fn(),
      complete: jest.fn(),
    },
    twoStepAuthPhoneRemove: {
      success: jest.fn(),
    },
    resetPassword: {
      recoveryPhoneCodeSent: jest.fn(),
      recoveryPhoneCodeSendError: jest.fn(),
      recoveryPhoneCodeComplete: jest.fn(),
    },
    twoStepAuthPhoneReplace: {
      success: jest.fn(),
      failure: jest.fn(),
    },
  };
  const mockRecoveryPhoneService: any = {
    setupPhoneNumber: jest.fn(),
    getNationalFormat: jest.fn(),
    confirmCode: jest.fn(),
    confirmSetupCode: jest.fn(),
    removePhoneNumber: jest.fn(),
    stripPhoneNumber: jest.fn(),
    hasConfirmed: jest.fn(),
    onMessageStatusUpdate: jest.fn(),
    validateTwilioWebhookCallback: jest.fn(),
    validateSetupCode: jest.fn(),
    changePhoneNumber: jest.fn(),
  };
  const mockAccountManager = {
    verifySession: jest.fn(),
  };
  const mockAccountEventsManager = {
    recordSecurityEvent: jest.fn(),
  };
  let routes: any = [];
  let request: any;
  let otpUtils: any;
  const mockConfig = { recoveryPhone: { enabled: true } };

  beforeEach(() => {
    Container.set(RecoveryPhoneService, mockRecoveryPhoneService);
    Container.set(AccountManager, mockAccountManager);
    Container.set(AccountEventsManager, mockAccountEventsManager);
    mockMailer = mocks.mockMailer();
    mockFxaMailer = mocks.mockFxaMailer();
    // Ensure RecoveryPhoneHandler resolves OtpUtils with our mocked db/statsd
    otpUtils = new OtpUtils(mockDb, mockStatsd);
    Container.set(OtpUtils, otpUtils);
    routes = recoveryPhoneRoutes(
      mockCustoms,
      mockDb,
      mockGlean,
      mockLog,
      mockMailer,
      mockStatsd,
      mockConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Container.reset();
  });

  async function makeRequest(req: any) {
    const route = getRoute(routes, req.path, req.method);
    expect(route).toBeDefined();
    request = mockRequest(req);
    request.emitMetricsEvent = jest.fn().mockResolvedValue();
    return await route.handler(request);
  }

  describe('POST /recovery_phone/signin/send_code', () => {
    it('sends recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = jest.fn().mockReturnValue(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/send_code',
        credentials: { uid, email },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenNthCalledWith(
        1,
        uid,
        expect.any(Function)
      );

      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(1);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(0);

      expect(mockCustoms.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockCustoms.checkAuthenticated).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        uid,
        email,
        'recoveryPhoneSendSigninCode'
      );

      expect(
        mockAccountEventsManager.recordSecurityEvent
      ).toHaveBeenCalledTimes(1);
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        mockDb,
        {
          name: 'account.recovery_phone_send_code',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
          additionalInfo: {
            userAgent: 'test user-agent',
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
          },
        }
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.recoveryPhone.signinSendCode.success',
        {}
      );
    });

    it('handles failure to send recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = jest.fn().mockReturnValue(false);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/send_code',
        credentials: { uid, email },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('failure');
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenNthCalledWith(
        1,
        uid,
        expect.any(Function)
      );

      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(1);
    });

    it('handles unexpected backend error', async () => {
      mockRecoveryPhoneService.sendCode = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('BOOM')));

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/send_code',
        credentials: { uid, email },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenNthCalledWith(
        1,
        uid,
        expect.any(Function)
      );

      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(0);
    });

    it('requires session authorization', () => {
      const route = getRoute(
        routes,
        '/recovery_phone/signin/send_code',
        'POST'
      );
      expect(route.options.auth.strategy).toBe('sessionToken');
    });
  });

  describe('POST /recovery_phone/reset_password/send_code', () => {
    it('sends recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = jest.fn().mockReturnValue(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/reset_password/send_code',
        credentials: { uid, email },
      });

      // artificial delay since the metrics and security event related calls
      // are not awaited
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenNthCalledWith(
        1,
        uid,
        expect.any(Function)
      );

      expect(
        mockGlean.resetPassword.recoveryPhoneCodeSent
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.resetPassword.recoveryPhoneCodeSendError
      ).toHaveBeenCalledTimes(0);

      expect(mockCustoms.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockCustoms.checkAuthenticated).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        uid,
        email,
        'recoveryPhoneSendResetPasswordCode'
      );

      expect(
        mockAccountEventsManager.recordSecurityEvent
      ).toHaveBeenCalledTimes(1);
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        mockDb,
        {
          name: 'account.recovery_phone_send_code',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
          additionalInfo: {
            userAgent: 'test user-agent',
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
          },
        }
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.recoveryPhone.resetPasswordSendCode.success',
        {}
      );
    });

    it('handles failure to send recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = jest.fn().mockReturnValue(false);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/reset_password/send_code',
        credentials: { uid, email },
      });

      // artificial delay since the metrics and security event related calls
      // are not awaited
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(resp).toBeDefined();
      expect(resp.status).toBe('failure');
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenNthCalledWith(
        1,
        uid,
        expect.any(Function)
      );

      expect(
        mockGlean.resetPassword.recoveryPhoneCodeSent
      ).toHaveBeenCalledTimes(0);
      expect(
        mockGlean.resetPassword.recoveryPhoneCodeSendError
      ).toHaveBeenCalledTimes(1);
    });

    it('handles unexpected backend error', async () => {
      mockRecoveryPhoneService.sendCode = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('BOOM')));

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/reset_password/send_code',
        credentials: { uid, email },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.sendCode).toHaveBeenNthCalledWith(
        1,
        uid,
        expect.any(Function)
      );

      // artificial delay since the metrics and security event related calls
      // are not awaited
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(
        mockGlean.resetPassword.recoveryPhoneCodeSent
      ).toHaveBeenCalledTimes(0);
      expect(
        mockGlean.resetPassword.recoveryPhoneCodeSendError
      ).toHaveBeenCalledTimes(0);
    });

    it('requires a passwordForgotToken', () => {
      const route = getRoute(
        routes,
        '/recovery_phone/reset_password/send_code',
        'POST'
      );
      expect(route.options.auth.strategy).toBe('passwordForgotToken');
    });
  });

  describe('POST /recovery_phone/create', () => {
    it('creates recovery phone number', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = jest
        .fn()
        .mockReturnValue(true);
      mockRecoveryPhoneService.getNationalFormat = jest
        .fn()
        .mockReturnValue(nationalFormat);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(mockRecoveryPhoneService.setupPhoneNumber).toHaveBeenCalledTimes(
        1
      );
      expect(mockRecoveryPhoneService.setupPhoneNumber).toHaveBeenNthCalledWith(
        1,
        uid,
        phoneNumber,
        expect.any(Function)
      );
      expect(mockRecoveryPhoneService.getNationalFormat).toHaveBeenCalledTimes(
        1
      );
      expect(
        mockRecoveryPhoneService.getNationalFormat
      ).toHaveBeenNthCalledWith(1, phoneNumber);
      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(1);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(0);

      expect(mockCustoms.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockCustoms.checkAuthenticated).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        uid,
        email,
        'recoveryPhoneSendSetupCode'
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.recoveryPhone.setupPhoneNumber.success',
        {}
      );
    });

    it('indicates failure sending sms', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = jest
        .fn()
        .mockReturnValue(false);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber: 'invalid' },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('failure');
      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(1);
    });

    it('rejects an unsupported dialing code', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = jest
        .fn()
        .mockReturnValue(
          Promise.reject(new RecoveryNumberNotSupportedError('+495550005555'))
        );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber: '+495550005555' },
      });

      await expect(promise).rejects.toThrow('Invalid phone number');
      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(1);
    });

    it('indicates too many requests when sms rate limit is exceeded', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = jest
        .fn()
        .mockReturnValue(
          Promise.reject(
            new SmsSendRateLimitExceededError(uid, phoneNumber, '+495550005555')
          )
        );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber: '+495550005555' },
      });

      await expect(promise).rejects.toThrow('Text message limit reached');
      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(1);
    });

    it('rejects a phone number that has been set up for too many accounts', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = jest
        .fn()
        .mockReturnValue(
          Promise.reject(
            new RecoveryPhoneRegistrationLimitReached('+495550005555')
          )
        );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber: '+495550005555' },
      });

      await expect(promise).rejects.toThrow(
        'Limit reached for number off accounts that can be associated with phone number.'
      );
      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(1);
    });

    it('handles unexpected backend error', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('BOOM')));

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockGlean.twoStepAuthPhoneCode.sent).toHaveBeenCalledTimes(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError).toHaveBeenCalledTimes(1);
    });

    it('validates incoming phone number', () => {
      const route = getRoute(routes, '/recovery_phone/create', 'POST');
      const joiSchema = route.options.validate.payload;

      const validNumber = joiSchema.validate({ phoneNumber: '+15550005555' });
      const missingNumber = joiSchema.validate({});
      const invalidNumber = joiSchema.validate({ phoneNumber: '5550005555' });

      expect(validNumber.error).toBeUndefined();
      expect(missingNumber.error.message).toContain('is required');
      expect(invalidNumber.error.message).toContain(
        'fails to match the required pattern'
      );
    });

    it('requires verified session authorization', () => {
      const route = getRoute(routes, '/recovery_phone/create', 'POST');
      expect(route.options.auth.strategy).toBe('verifiedSessionToken');
    });
  });

  describe('POST /recovery_phone/confirm', () => {
    it('confirms a code with TOTP enabled – sends post-add email', async () => {
      mockRecoveryPhoneService.confirmSetupCode = jest
        .fn()
        .mockReturnValue(true);
      mockRecoveryPhoneService.hasConfirmed = jest.fn().mockReturnValue({
        exists: true,
        phoneNumber,
        nationalFormat,
      });
      mockRecoveryPhoneService.stripPhoneNumber = jest
        .fn()
        .mockReturnValue('5555');

      // Simulate account having TOTP set up and verified
      jest.spyOn(otpUtils, 'hasTotpToken').mockResolvedValue(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      // Gives back the full national format as the user just successfully
      // confirmed the code
      expect(resp.nationalFormat).toBe(nationalFormat);
      expect(mockRecoveryPhoneService.confirmSetupCode).toHaveBeenCalledTimes(
        1
      );
      expect(mockRecoveryPhoneService.confirmSetupCode).toHaveBeenNthCalledWith(
        1,
        uid,
        code
      );
      expect(mockGlean.twoStepAuthPhoneCode.complete).toHaveBeenCalledTimes(1);
      expect(mockFxaMailer.sendPostAddRecoveryPhoneEmail).toHaveBeenCalledTimes(
        1
      );
      expect(
        mockAccountEventsManager.recordSecurityEvent
      ).toHaveBeenCalledTimes(1);
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        mockDb,
        {
          name: 'account.recovery_phone_setup_complete',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
          additionalInfo: {
            userAgent: 'test user-agent',
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
          },
        }
      );

      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.recoveryPhone.phoneAdded.success',
        {}
      );
    });

    it('confirms a code without TOTP – does not send post-add email', async () => {
      mockRecoveryPhoneService.confirmSetupCode = jest
        .fn()
        .mockReturnValue(true);
      mockRecoveryPhoneService.hasConfirmed = jest.fn().mockReturnValue({
        exists: true,
        phoneNumber,
        nationalFormat,
      });
      mockRecoveryPhoneService.stripPhoneNumber = jest
        .fn()
        .mockReturnValue('5555');

      // Simulate account without TOTP configured
      jest.spyOn(otpUtils, 'hasTotpToken').mockResolvedValue(false);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(resp.nationalFormat).toBe(nationalFormat);
      expect(mockRecoveryPhoneService.confirmSetupCode).toHaveBeenCalledTimes(
        1
      );
      expect(mockRecoveryPhoneService.confirmSetupCode).toHaveBeenNthCalledWith(
        1,
        uid,
        code
      );
      expect(mockGlean.twoStepAuthPhoneCode.complete).toHaveBeenCalledTimes(1);
      expect(mockMailer.sendPostAddRecoveryPhoneEmail).not.toHaveBeenCalled();
      expect(
        mockFxaMailer.sendPostAddRecoveryPhoneEmail
      ).not.toHaveBeenCalled();
    });

    it('indicates a failure confirming code', async () => {
      mockRecoveryPhoneService.confirmSetupCode = jest
        .fn()
        .mockReturnValue(false);
      mockRecoveryPhoneService.hasConfirmed = jest.fn().mockReturnValue({
        exists: false,
      });

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      await expect(promise).rejects.toThrow(
        'Invalid or expired confirmation code'
      );
      expect(mockGlean.twoStepAuthPhoneCode.complete).toHaveBeenCalledTimes(0);
      expect(
        mockFxaMailer.sendPostAddRecoveryPhoneEmail
      ).not.toHaveBeenCalled();
    });

    it('indicates an issue with the backend service', async () => {
      mockRecoveryPhoneService.confirmSetupCode = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('BOOM')));
      mockRecoveryPhoneService.hasConfirmed = jest.fn().mockReturnValue({
        exists: false,
      });
      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );

      expect(mockGlean.twoStepAuthPhoneCode.complete).toHaveBeenCalledTimes(0);
      expect(
        mockFxaMailer.sendPostAddRecoveryPhoneEmail
      ).not.toHaveBeenCalled();
    });
  });

  describe('POST /recovery_phone/signin/confirm', () => {
    it('confirms a code during signin', async () => {
      mockRecoveryPhoneService.confirmCode = jest.fn().mockReturnValue(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(mockRecoveryPhoneService.confirmCode).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.confirmCode).toHaveBeenNthCalledWith(
        1,
        uid,
        code
      );
      expect(mockAccountManager.verifySession).toHaveBeenCalledTimes(1);
      expect(mockGlean.login.recoveryPhoneSuccess).toHaveBeenCalledTimes(1);
      expect(
        mockFxaMailer.sendPostSigninRecoveryPhoneEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        mockAccountEventsManager.recordSecurityEvent
      ).toHaveBeenCalledTimes(1);
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        mockDb,
        {
          name: 'account.recovery_phone_signin_complete',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
          additionalInfo: {
            userAgent: 'test user-agent',
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
          },
        }
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.recoveryPhone.phoneSignin.success',
        {}
      );
      expect(request.emitMetricsEvent).toHaveBeenCalledTimes(1);
      expect(request.emitMetricsEvent).toHaveBeenCalledWith(
        'account.confirmed',
        { uid }
      );
    });

    it('fails confirms a code during signin', async () => {
      mockRecoveryPhoneService.confirmCode = jest.fn().mockReturnValue(false);

      try {
        await makeRequest({
          method: 'POST',
          path: '/recovery_phone/signin/confirm',
          credentials: { uid, email },
          payload: { code },
        });
      } catch (err: any) {
        expect(err).toBeDefined();
        expect(err.errno).toBe(183);
        expect(
          mockAccountEventsManager.recordSecurityEvent
        ).toHaveBeenCalledTimes(1);
        expect(
          mockAccountEventsManager.recordSecurityEvent
        ).toHaveBeenCalledWith(mockDb, {
          name: 'account.recovery_phone_signin_failed',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
          additionalInfo: {
            userAgent: 'test user-agent',
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
          },
        });
      }
    });
  });

  describe('POST /recovery_phone/reset_password/confirm', () => {
    it('successfully confirms the code', async () => {
      mockRecoveryPhoneService.confirmCode = jest.fn().mockReturnValue(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/reset_password/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      // artificial delay since the metrics and security event related calls
      // are not awaited
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(mockRecoveryPhoneService.confirmCode).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.confirmCode).toHaveBeenNthCalledWith(
        1,
        uid,
        code
      );
      expect(
        mockGlean.resetPassword.recoveryPhoneCodeComplete
      ).toHaveBeenCalledTimes(1);
      expect(
        mockAccountEventsManager.recordSecurityEvent
      ).toHaveBeenCalledTimes(1);
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        mockDb,
        {
          name: 'account.recovery_phone_reset_password_complete',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
          additionalInfo: {
            userAgent: 'test user-agent',
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
          },
        }
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.resetPassword.recoveryPhone.success',
        {}
      );
      expect(
        mockFxaMailer.sendPasswordResetRecoveryPhoneEmail
      ).toHaveBeenCalledTimes(1);
    });

    it('fails confirms a code during signin', async () => {
      mockRecoveryPhoneService.confirmCode = jest.fn().mockReturnValue(false);

      try {
        await makeRequest({
          method: 'POST',
          path: '/recovery_phone/reset_password/confirm',
          credentials: { uid, email },
          payload: { code },
        });
      } catch (err: any) {
        expect(err).toBeDefined();
        expect(err.errno).toBe(183);
        expect(
          mockAccountEventsManager.recordSecurityEvent
        ).toHaveBeenCalledTimes(1);
        expect(
          mockAccountEventsManager.recordSecurityEvent
        ).toHaveBeenCalledWith(mockDb, {
          name: 'account.recovery_phone_reset_password_failed',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
          additionalInfo: {
            userAgent: 'test user-agent',
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
          },
        });
      }
    });
  });

  describe('DELETE /recovery_phone', () => {
    it('removes a recovery phone', async () => {
      mockRecoveryPhoneService.removePhoneNumber = jest
        .fn()
        .mockReturnValue(true);

      const resp = await makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
      });

      expect(resp).toBeDefined();
      expect(mockRecoveryPhoneService.removePhoneNumber).toHaveBeenCalledTimes(
        1
      );
      expect(
        mockRecoveryPhoneService.removePhoneNumber
      ).toHaveBeenNthCalledWith(1, uid);
      expect(mockGlean.twoStepAuthPhoneRemove.success).toHaveBeenCalledTimes(1);
      expect(
        mockFxaMailer.sendPostRemoveRecoveryPhoneEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        mockAccountEventsManager.recordSecurityEvent
      ).toHaveBeenCalledTimes(1);
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        mockDb,
        {
          name: 'account.recovery_phone_removed',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
          additionalInfo: {
            userAgent: 'test user-agent',
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
          },
        }
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.recoveryPhone.phoneRemoved.success',
        {}
      );
    });

    it('indicates service failure while removing phone', async () => {
      mockRecoveryPhoneService.removePhoneNumber = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('BOOM')));
      const promise = makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockGlean.twoStepAuthPhoneRemove.success).toHaveBeenCalledTimes(0);
      expect(
        mockFxaMailer.sendPostRemoveRecoveryPhoneEmail
      ).not.toHaveBeenCalled();
    });

    it('handles uid without registered phone number', async () => {
      mockRecoveryPhoneService.removePhoneNumber = jest
        .fn()
        .mockReturnValue(false);
      await makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
      });
      expect(mockGlean.twoStepAuthPhoneRemove.success).toHaveBeenCalledTimes(0);
    });
  });

  describe('POST /recovery_phone/available', () => {
    it('should return true if user can setup phone number', async () => {
      mockRecoveryPhoneService.available = jest.fn().mockReturnValue(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/available',
        credentials: { uid, email },
        geo: {
          location: {
            countryCode: 'US',
          },
        },
      });

      expect(resp).toEqual({ available: true });
      expect(mockRecoveryPhoneService.available).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.available).toHaveBeenCalledWith(
        uid,
        'US'
      );
    });
  });

  describe('GET /recovery_phone', () => {
    it('gets a recovery phone', async () => {
      mockRecoveryPhoneService.hasConfirmed = jest.fn().mockReturnValue({
        exists: true,
        phoneNumber,
      });

      const resp = await makeRequest({
        method: 'GET',
        path: '/recovery_phone',
        credentials: { uid, emailVerified: true },
      });

      expect(resp).toBeDefined();
      expect(mockRecoveryPhoneService.hasConfirmed).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.hasConfirmed).toHaveBeenNthCalledWith(
        1,
        uid,
        expect.anything()
      );
    });

    it('indicates  error', async () => {
      mockRecoveryPhoneService.hasConfirmed = jest
        .fn()
        .mockReturnValue(Promise.reject(new Error('BOOM')));
      const promise = makeRequest({
        method: 'GET',
        path: '/recovery_phone',
        credentials: { uid, emailVerified: true },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockGlean.twoStepAuthPhoneRemove.success).toHaveBeenCalledTimes(0);
    });

    it('returns masked phone number for unverified session', async () => {
      mockRecoveryPhoneService.hasConfirmed = jest.fn().mockReturnValue({
        exists: true,
        phoneNumber,
      });
      const resp = await makeRequest({
        method: 'GET',
        path: '/recovery_phone',
        credentials: { uid, mustVerify: true },
      });
      expect(resp).toBeDefined();
      expect(resp.exists).toBeDefined();
      expect(resp.phoneNumber).toBeDefined();
      expect(mockRecoveryPhoneService.hasConfirmed).toHaveBeenCalledTimes(1);
      expect(mockRecoveryPhoneService.hasConfirmed).toHaveBeenNthCalledWith(
        1,
        uid,
        4
      );
    });
  });

  describe('POST /recovery_phone/message_status', () => {
    it('handles a message status update from twilio using X-Twilio-Signature header', async () => {
      mockRecoveryPhoneService.onMessageStatusUpdate = jest
        .fn()
        .mockResolvedValue(undefined);
      mockRecoveryPhoneService.validateTwilioWebhookCallback = jest
        .fn()
        .mockReturnValue(true);

      const payload = {
        AccountSid: 'AC123',
        MessageSid: 'M123',
        From: '+1234567890',
        MessageStatus: 'delivered',
        RawDlrDoneDate: 'TWILIO_DATE_FORMAT',
      };

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/message_status',
        headers: {
          'X-Twilio-Signature': 'VALID_SIGNATURE',
        },
        payload,
      });

      expect(resp).toBeDefined();

      expect(
        mockRecoveryPhoneService.validateTwilioWebhookCallback
      ).toHaveBeenCalledTimes(1);
      expect(
        mockRecoveryPhoneService.validateTwilioWebhookCallback
      ).toHaveBeenNthCalledWith(1, {
        twilio: {
          signature: 'VALID_SIGNATURE',
          params: payload,
        },
      });

      expect(
        mockRecoveryPhoneService.onMessageStatusUpdate
      ).toHaveBeenCalledTimes(1);
      expect(
        mockRecoveryPhoneService.onMessageStatusUpdate
      ).toHaveBeenNthCalledWith(1, payload);
    });

    it('handles a message status update from twilio using fxaSignature query param', async () => {
      mockRecoveryPhoneService.onMessageStatusUpdate = jest
        .fn()
        .mockResolvedValue(undefined);
      mockRecoveryPhoneService.validateTwilioWebhookCallback = jest
        .fn()
        .mockReturnValue(true);

      const payload = {
        AccountSid: 'AC123',
        MessageSid: 'M123',
        From: '+1234567890',
        MessageStatus: 'delivered',
        RawDlrDoneDate: 'TWILIO_DATE_FORMAT',
      };

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/message_status',
        credentials: {},
        headers: {
          'X-Twilio-Signature': 'VALID_SIGNATURE',
        },
        query: {
          fxaSignature: 'VALID_SIGNATURE',
          fxaMessage: 'FXA_MESSAGE',
        },
        payload,
      });

      expect(resp).toBeDefined();

      expect(
        mockRecoveryPhoneService.validateTwilioWebhookCallback
      ).toHaveBeenCalledTimes(1);
      expect(
        mockRecoveryPhoneService.validateTwilioWebhookCallback
      ).toHaveBeenNthCalledWith(1, {
        fxa: {
          signature: 'VALID_SIGNATURE',
          message: 'FXA_MESSAGE',
        },
      });

      expect(
        mockRecoveryPhoneService.onMessageStatusUpdate
      ).toHaveBeenCalledTimes(1);
      expect(
        mockRecoveryPhoneService.onMessageStatusUpdate
      ).toHaveBeenNthCalledWith(1, payload);
    });

    it('throws on invalid / missing signatures', async () => {
      mockRecoveryPhoneService.validateTwilioWebhookCallback = jest
        .fn()
        .mockRejectedValue(AppError.unauthorized('Signature Invalid'));
      await expect(
        makeRequest({
          method: 'POST',
          path: '/recovery_phone/message_status',
          headers: {},
          payload: {},
        })
      ).rejects.toEqual(AppError.unauthorized('Signature Invalid'));
    });
  });
});
