/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
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
  const sandbox = sinon.createSandbox();
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
    check: sandbox.fake(),
    checkAuthenticated: sandbox.fake(),
  };
  const mockStatsd = {
    increment: sandbox.fake(),
    histogram: sandbox.fake(),
  };
  const mockGlean = {
    login: {
      recoveryPhoneSuccess: sandbox.fake(),
    },
    twoStepAuthPhoneCode: {
      sent: sandbox.fake(),
      sendError: sandbox.fake(),
      complete: sandbox.fake(),
    },
    twoStepAuthPhoneRemove: {
      success: sandbox.fake(),
    },
    resetPassword: {
      recoveryPhoneCodeSent: sandbox.fake(),
      recoveryPhoneCodeSendError: sandbox.fake(),
      recoveryPhoneCodeComplete: sandbox.fake(),
    },
    twoStepAuthPhoneReplace: {
      success: sandbox.fake(),
      failure: sandbox.fake(),
    },
  };
  const mockRecoveryPhoneService: any = {
    setupPhoneNumber: sandbox.fake(),
    getNationalFormat: sandbox.fake(),
    confirmCode: sandbox.fake(),
    confirmSetupCode: sandbox.fake(),
    removePhoneNumber: sandbox.fake(),
    stripPhoneNumber: sandbox.fake(),
    hasConfirmed: sandbox.fake(),
    onMessageStatusUpdate: sandbox.fake(),
    validateTwilioWebhookCallback: sandbox.fake(),
    validateSetupCode: sandbox.fake(),
    changePhoneNumber: sandbox.fake(),
  };
  const mockAccountManager = {
    verifySession: sandbox.fake(),
  };
  const mockAccountEventsManager = {
    recordSecurityEvent: sandbox.fake(),
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
    sandbox.reset();
  });

  afterAll(() => {
    Container.reset();
  });

  async function makeRequest(req: any) {
    const route = getRoute(routes, req.path, req.method);
    expect(route).toBeDefined();
    request = mockRequest(req);
    request.emitMetricsEvent = sandbox.stub().resolves();
    return await route.handler(request);
  }

  describe('POST /recovery_phone/signin/send_code', () => {
    it('sends recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = sinon.fake.returns(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/send_code',
        credentials: { uid, email },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(mockRecoveryPhoneService.sendCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.sendCode.getCall(0).args[0]).toBe(uid);

      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(1);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(0);

      expect(mockCustoms.checkAuthenticated.callCount).toBe(1);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[1]).toBe(uid);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[2]).toBe(email);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[3]).toBe(
        'recoveryPhoneSendSigninCode'
      );

      sinon.assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
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
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.signinSendCode.success',
        {}
      );
    });

    it('handles failure to send recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = sinon.fake.returns(false);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/send_code',
        credentials: { uid, email },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('failure');
      expect(mockRecoveryPhoneService.sendCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.sendCode.getCall(0).args[0]).toBe(uid);

      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(1);
    });

    it('handles unexpected backend error', async () => {
      mockRecoveryPhoneService.sendCode = sinon.fake.returns(
        Promise.reject(new Error('BOOM'))
      );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/send_code',
        credentials: { uid, email },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockRecoveryPhoneService.sendCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.sendCode.getCall(0).args[0]).toBe(uid);

      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(0);
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
      mockRecoveryPhoneService.sendCode = sinon.fake.returns(true);

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
      expect(mockRecoveryPhoneService.sendCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.sendCode.getCall(0).args[0]).toBe(uid);

      expect(mockGlean.resetPassword.recoveryPhoneCodeSent.callCount).toBe(1);
      expect(mockGlean.resetPassword.recoveryPhoneCodeSendError.callCount).toBe(
        0
      );

      expect(mockCustoms.checkAuthenticated.callCount).toBe(1);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[1]).toBe(uid);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[2]).toBe(email);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[3]).toBe(
        'recoveryPhoneSendResetPasswordCode'
      );

      sinon.assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
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
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.resetPasswordSendCode.success',
        {}
      );
    });

    it('handles failure to send recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = sinon.fake.returns(false);

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
      expect(mockRecoveryPhoneService.sendCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.sendCode.getCall(0).args[0]).toBe(uid);

      expect(mockGlean.resetPassword.recoveryPhoneCodeSent.callCount).toBe(0);
      expect(mockGlean.resetPassword.recoveryPhoneCodeSendError.callCount).toBe(
        1
      );
    });

    it('handles unexpected backend error', async () => {
      mockRecoveryPhoneService.sendCode = sinon.fake.returns(
        Promise.reject(new Error('BOOM'))
      );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/reset_password/send_code',
        credentials: { uid, email },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockRecoveryPhoneService.sendCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.sendCode.getCall(0).args[0]).toBe(uid);

      // artificial delay since the metrics and security event related calls
      // are not awaited
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockGlean.resetPassword.recoveryPhoneCodeSent.callCount).toBe(0);
      expect(mockGlean.resetPassword.recoveryPhoneCodeSendError.callCount).toBe(
        0
      );
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
      mockRecoveryPhoneService.setupPhoneNumber = sinon.fake.returns(true);
      mockRecoveryPhoneService.getNationalFormat =
        sinon.fake.returns(nationalFormat);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(mockRecoveryPhoneService.setupPhoneNumber.callCount).toBe(1);
      expect(mockRecoveryPhoneService.setupPhoneNumber.getCall(0).args[0]).toBe(
        uid
      );
      expect(mockRecoveryPhoneService.setupPhoneNumber.getCall(0).args[1]).toBe(
        phoneNumber
      );
      expect(mockRecoveryPhoneService.getNationalFormat.callCount).toBe(1);
      expect(
        mockRecoveryPhoneService.getNationalFormat.getCall(0).args[0]
      ).toBe(phoneNumber);
      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(1);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(0);

      expect(mockCustoms.checkAuthenticated.callCount).toBe(1);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[1]).toBe(uid);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[2]).toBe(email);
      expect(mockCustoms.checkAuthenticated.getCall(0).args[3]).toBe(
        'recoveryPhoneSendSetupCode'
      );
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.setupPhoneNumber.success',
        {}
      );
    });

    it('indicates failure sending sms', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = sinon.fake.returns(false);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber: 'invalid' },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('failure');
      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(1);
    });

    it('rejects an unsupported dialing code', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = sinon.fake.returns(
        Promise.reject(new RecoveryNumberNotSupportedError('+495550005555'))
      );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber: '+495550005555' },
      });

      await expect(promise).rejects.toThrow('Invalid phone number');
      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(1);
    });

    it('indicates too many requests when sms rate limit is exceeded', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = sinon.fake.returns(
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
      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(1);
    });

    it('rejects a phone number that has been set up for too many accounts', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = sinon.fake.returns(
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
      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(1);
    });

    it('handles unexpected backend error', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = sinon.fake.returns(
        Promise.reject(new Error('BOOM'))
      );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockGlean.twoStepAuthPhoneCode.sent.callCount).toBe(0);
      expect(mockGlean.twoStepAuthPhoneCode.sendError.callCount).toBe(1);
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
      mockRecoveryPhoneService.confirmSetupCode = sinon.fake.returns(true);
      mockRecoveryPhoneService.hasConfirmed = sinon.fake.returns({
        exists: true,
        phoneNumber,
        nationalFormat,
      });
      mockRecoveryPhoneService.stripPhoneNumber = sinon.fake.returns('5555');

      // Simulate account having TOTP set up and verified
      sinon.stub(otpUtils, 'hasTotpToken').resolves(true);

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
      expect(mockRecoveryPhoneService.confirmSetupCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.confirmSetupCode.getCall(0).args[0]).toBe(
        uid
      );
      expect(mockRecoveryPhoneService.confirmSetupCode.getCall(0).args[1]).toBe(
        code
      );
      expect(mockGlean.twoStepAuthPhoneCode.complete.callCount).toBe(1);
      sinon.assert.calledOnce(mockFxaMailer.sendPostAddRecoveryPhoneEmail);
      sinon.assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
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

      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.phoneAdded.success',
        {}
      );
    });

    it('confirms a code without TOTP – does not send post-add email', async () => {
      mockRecoveryPhoneService.confirmSetupCode = sinon.fake.returns(true);
      mockRecoveryPhoneService.hasConfirmed = sinon.fake.returns({
        exists: true,
        phoneNumber,
        nationalFormat,
      });
      mockRecoveryPhoneService.stripPhoneNumber = sinon.fake.returns('5555');

      // Simulate account without TOTP configured
      sinon.stub(otpUtils, 'hasTotpToken').resolves(false);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(resp.nationalFormat).toBe(nationalFormat);
      expect(mockRecoveryPhoneService.confirmSetupCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.confirmSetupCode.getCall(0).args[0]).toBe(
        uid
      );
      expect(mockRecoveryPhoneService.confirmSetupCode.getCall(0).args[1]).toBe(
        code
      );
      expect(mockGlean.twoStepAuthPhoneCode.complete.callCount).toBe(1);
      sinon.assert.notCalled(mockMailer.sendPostAddRecoveryPhoneEmail);
      sinon.assert.notCalled(mockFxaMailer.sendPostAddRecoveryPhoneEmail);
    });

    it('indicates a failure confirming code', async () => {
      mockRecoveryPhoneService.confirmSetupCode = sinon.fake.returns(false);
      mockRecoveryPhoneService.hasConfirmed = sinon.fake.returns({
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
      expect(mockGlean.twoStepAuthPhoneCode.complete.callCount).toBe(0);
      sinon.assert.notCalled(mockFxaMailer.sendPostAddRecoveryPhoneEmail);
    });

    it('indicates an issue with the backend service', async () => {
      mockRecoveryPhoneService.confirmSetupCode = sinon.fake.returns(
        Promise.reject(new Error('BOOM'))
      );
      mockRecoveryPhoneService.hasConfirmed = sinon.fake.returns({
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

      expect(mockGlean.twoStepAuthPhoneCode.complete.callCount).toBe(0);
      sinon.assert.notCalled(mockFxaMailer.sendPostAddRecoveryPhoneEmail);
    });
  });

  describe('POST /recovery_phone/signin/confirm', () => {
    it('confirms a code during signin', async () => {
      mockRecoveryPhoneService.confirmCode = sinon.fake.returns(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      expect(resp).toBeDefined();
      expect(resp.status).toBe('success');
      expect(mockRecoveryPhoneService.confirmCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.confirmCode.getCall(0).args[0]).toBe(uid);
      expect(mockRecoveryPhoneService.confirmCode.getCall(0).args[1]).toBe(
        code
      );
      expect(mockAccountManager.verifySession.callCount).toBe(1);
      expect(mockGlean.login.recoveryPhoneSuccess.callCount).toBe(1);
      sinon.assert.calledOnce(mockFxaMailer.sendPostSigninRecoveryPhoneEmail);
      sinon.assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
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
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.phoneSignin.success',
        {}
      );
      sinon.assert.calledOnceWithExactly(
        request.emitMetricsEvent,
        'account.confirmed',
        { uid }
      );
    });

    it('fails confirms a code during signin', async () => {
      mockRecoveryPhoneService.confirmCode = sinon.fake.returns(false);

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
        sinon.assert.calledOnceWithExactly(
          mockAccountEventsManager.recordSecurityEvent,
          mockDb,
          {
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
          }
        );
      }
    });
  });

  describe('POST /recovery_phone/reset_password/confirm', () => {
    it('successfully confirms the code', async () => {
      mockRecoveryPhoneService.confirmCode = sinon.fake.returns(true);

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
      expect(mockRecoveryPhoneService.confirmCode.callCount).toBe(1);
      expect(mockRecoveryPhoneService.confirmCode.getCall(0).args[0]).toBe(uid);
      expect(mockRecoveryPhoneService.confirmCode.getCall(0).args[1]).toBe(
        code
      );
      expect(mockGlean.resetPassword.recoveryPhoneCodeComplete.callCount).toBe(
        1
      );
      sinon.assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
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
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.resetPassword.recoveryPhone.success',
        {}
      );
      sinon.assert.calledOnce(
        mockFxaMailer.sendPasswordResetRecoveryPhoneEmail
      );
    });

    it('fails confirms a code during signin', async () => {
      mockRecoveryPhoneService.confirmCode = sinon.fake.returns(false);

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
        sinon.assert.calledOnceWithExactly(
          mockAccountEventsManager.recordSecurityEvent,
          mockDb,
          {
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
          }
        );
      }
    });
  });

  describe('DELETE /recovery_phone', () => {
    it('removes a recovery phone', async () => {
      mockRecoveryPhoneService.removePhoneNumber = sinon.fake.returns(true);

      const resp = await makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
      });

      expect(resp).toBeDefined();
      expect(mockRecoveryPhoneService.removePhoneNumber.callCount).toBe(1);
      expect(
        mockRecoveryPhoneService.removePhoneNumber.getCall(0).args[0]
      ).toBe(uid);
      expect(mockGlean.twoStepAuthPhoneRemove.success.callCount).toBe(1);
      sinon.assert.calledOnce(mockFxaMailer.sendPostRemoveRecoveryPhoneEmail);
      sinon.assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
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
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.phoneRemoved.success',
        {}
      );
    });

    it('indicates service failure while removing phone', async () => {
      mockRecoveryPhoneService.removePhoneNumber = sinon.fake.returns(
        Promise.reject(new Error('BOOM'))
      );
      const promise = makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockGlean.twoStepAuthPhoneRemove.success.callCount).toBe(0);
      sinon.assert.notCalled(mockFxaMailer.sendPostRemoveRecoveryPhoneEmail);
    });

    it('handles uid without registered phone number', async () => {
      mockRecoveryPhoneService.removePhoneNumber = sinon.fake.returns(false);
      await makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
      });
      expect(mockGlean.twoStepAuthPhoneRemove.success.callCount).toBe(0);
    });
  });

  describe('POST /recovery_phone/available', () => {
    it('should return true if user can setup phone number', async () => {
      mockRecoveryPhoneService.available = sinon.fake.returns(true);

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
      sinon.assert.calledOnceWithExactly(
        mockRecoveryPhoneService.available,
        uid,
        'US'
      );
    });
  });

  describe('GET /recovery_phone', () => {
    it('gets a recovery phone', async () => {
      mockRecoveryPhoneService.hasConfirmed = sinon.fake.returns({
        exists: true,
        phoneNumber,
      });

      const resp = await makeRequest({
        method: 'GET',
        path: '/recovery_phone',
        credentials: { uid, emailVerified: true },
      });

      expect(resp).toBeDefined();
      expect(mockRecoveryPhoneService.hasConfirmed.callCount).toBe(1);
      expect(mockRecoveryPhoneService.hasConfirmed.getCall(0).args[0]).toBe(
        uid
      );
    });

    it('indicates  error', async () => {
      mockRecoveryPhoneService.hasConfirmed = sinon.fake.returns(
        Promise.reject(new Error('BOOM'))
      );
      const promise = makeRequest({
        method: 'GET',
        path: '/recovery_phone',
        credentials: { uid, emailVerified: true },
      });

      await expect(promise).rejects.toThrow(
        'System unavailable, try again soon'
      );
      expect(mockGlean.twoStepAuthPhoneRemove.success.callCount).toBe(0);
    });

    it('returns masked phone number for unverified session', async () => {
      mockRecoveryPhoneService.hasConfirmed = sinon.fake.returns({
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
      expect(mockRecoveryPhoneService.hasConfirmed.callCount).toBe(1);
      expect(mockRecoveryPhoneService.hasConfirmed.getCall(0).args[0]).toBe(
        uid
      );
      expect(mockRecoveryPhoneService.hasConfirmed.getCall(0).args[1]).toBe(4);
    });
  });

  describe('POST /recovery_phone/message_status', () => {
    it('handles a message status update from twilio using X-Twilio-Signature header', async () => {
      mockRecoveryPhoneService.onMessageStatusUpdate =
        sinon.fake.resolves(undefined);
      mockRecoveryPhoneService.validateTwilioWebhookCallback =
        sinon.fake.returns(true);

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
        mockRecoveryPhoneService.validateTwilioWebhookCallback.callCount
      ).toBe(1);
      expect(
        mockRecoveryPhoneService.validateTwilioWebhookCallback.getCall(0)
          .args[0]
      ).toEqual({
        twilio: {
          signature: 'VALID_SIGNATURE',
          params: payload,
        },
      });

      expect(mockRecoveryPhoneService.onMessageStatusUpdate.callCount).toBe(1);
      expect(
        mockRecoveryPhoneService.onMessageStatusUpdate.getCall(0).args[0]
      ).toBe(payload);
    });

    it('handles a message status update from twilio using fxaSignature query param', async () => {
      mockRecoveryPhoneService.onMessageStatusUpdate =
        sinon.fake.resolves(undefined);
      mockRecoveryPhoneService.validateTwilioWebhookCallback =
        sinon.fake.returns(true);

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
        mockRecoveryPhoneService.validateTwilioWebhookCallback.callCount
      ).toBe(1);
      expect(
        mockRecoveryPhoneService.validateTwilioWebhookCallback.getCall(0)
          .args[0]
      ).toEqual({
        fxa: {
          signature: 'VALID_SIGNATURE',
          message: 'FXA_MESSAGE',
        },
      });

      expect(mockRecoveryPhoneService.onMessageStatusUpdate.callCount).toBe(1);
      expect(
        mockRecoveryPhoneService.onMessageStatusUpdate.getCall(0).args[0]
      ).toBe(payload);
    });

    it('throws on invalid / missing signatures', async () => {
      mockRecoveryPhoneService.validateTwilioWebhookCallback =
        sinon.fake.rejects(AppError.unauthorized('Signature Invalid'));
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
