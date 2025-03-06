/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { AccountEventsManager } = require('../../../lib/account-events');
const AppError = require('../../../lib/error');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { AccountManager } = require('@fxa/shared/account/account');

const sinon = require('sinon');
const assert = { ...sinon.assert, ...chai.assert };
const mocks = require('../../mocks');
const { recoveryPhoneRoutes } = require('../../../lib/routes/recovery-phone');
const {
  RecoveryNumberNotSupportedError,
  SmsSendRateLimitExceededError,
  RecoveryPhoneService,
  RecoveryNumberRemoveMissingBackupCodes,
  RecoveryPhoneRegistrationLimitReached,
} = require('@fxa/accounts/recovery-phone');

const { getRoute } = require('../../routes_helpers');
const { mockRequest } = require('../../mocks');
const { Container } = require('typedi');
chai.use(chaiAsPromised);

describe('/recovery_phone', () => {
  const sandbox = sinon.createSandbox();
  const uid = '123435678123435678123435678123435678';
  const email = 'test@mozilla.com';
  const phoneNumber = '+15550005555';
  const nationalFormat = '(555) 000-5555';
  const code = '000000';
  const mockDb = mocks.mockDB({ uid: uid, email: email });
  const mockLog = mocks.mockLog();
  let mockMailer;
  const mockCustoms = {
    check: sandbox.fake(),
    checkAuthenticated: sandbox.fake(),
  };
  const mockStatsd = {
    increment: sandbox.fake(),
    histogram: sandbox.fake(),
  };
  const mockGlean = {
    twoStepAuthPhoneCode: {
      sent: sandbox.fake(),
      sendError: sandbox.fake(),
      complete: sandbox.fake(),
    },
    twoStepAuthPhoneRemove: {
      success: sandbox.fake(),
    },
  };
  const mockRecoveryPhoneService = {
    setupPhoneNumber: sandbox.fake(),
    getNationalFormat: sandbox.fake(),
    confirmSigninCode: sandbox.fake(),
    confirmSetupCode: sandbox.fake(),
    removePhoneNumber: sandbox.fake(),
    stripPhoneNumber: sandbox.fake(),
    hasConfirmed: sandbox.fake(),
    onMessageStatusUpdate: sandbox.fake(),
    validateTwilioWebhookCallback: sandbox.fake(),
  };
  const mockAccountManager = {
    verifySession: sandbox.fake(),
  };
  const mockAccountEventsManager = {
    recordSecurityEvent: sandbox.fake(),
  };
  let routes = [];

  beforeEach(() => {
    Container.set(RecoveryPhoneService, mockRecoveryPhoneService);
    Container.set(AccountManager, mockAccountManager);
    Container.set(AccountEventsManager, mockAccountEventsManager);
    mockMailer = mocks.mockMailer();
    routes = recoveryPhoneRoutes(
      mockCustoms,
      mockDb,
      mockGlean,
      mockLog,
      mockMailer,
      mockStatsd
    );
  });

  afterEach(() => {
    sandbox.reset();
  });

  async function makeRequest(req) {
    const route = getRoute(routes, req.path, req.method);
    assert.isDefined(route);
    return await route.handler(mockRequest(req));
  }

  describe('POST /recovery_phone/signin/send_code', () => {
    it('sends recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = sinon.fake.returns(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/send_code',
        credentials: { uid, email },
      });

      assert.isDefined(resp);
      assert.equal(resp.status, 'success');
      assert.equal(mockRecoveryPhoneService.sendCode.callCount, 1);
      assert.equal(mockRecoveryPhoneService.sendCode.getCall(0).args[0], uid);

      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 1);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 0);

      assert.equal(mockCustoms.check.callCount, 1);
      assert.equal(mockCustoms.check.getCall(0).args[1], email);
      assert.equal(
        mockCustoms.check.getCall(0).args[2],
        'recoveryPhoneSendSigninCode'
      );

      assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
        mockDb,
        {
          name: 'account.recovery_phone_send_code',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
        }
      );
      assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.signinSendCode.success'
      );
    });

    it('handles failure to send recovery phone code', async () => {
      mockRecoveryPhoneService.sendCode = sinon.fake.returns(false);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/send_code',
        credentials: { uid, email },
      });

      assert.isDefined(resp);
      assert.equal(resp.status, 'failure');
      assert.equal(mockRecoveryPhoneService.sendCode.callCount, 1);
      assert.equal(mockRecoveryPhoneService.sendCode.getCall(0).args[0], uid);

      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 0);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 1);
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

      await assert.isRejected(promise, 'System unavailable, try again soon');
      assert.equal(mockRecoveryPhoneService.sendCode.callCount, 1);
      assert.equal(mockRecoveryPhoneService.sendCode.getCall(0).args[0], uid);

      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 0);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 0);
    });

    it('requires session authorization', () => {
      const route = getRoute(
        routes,
        '/recovery_phone/signin/send_code',
        'POST'
      );
      assert.equal(route.options.auth.strategy, 'sessionToken');
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

      assert.isDefined(resp);
      assert.equal(resp.status, 'success');
      assert.equal(mockRecoveryPhoneService.setupPhoneNumber.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.setupPhoneNumber.getCall(0).args[0],
        uid
      );
      assert.equal(
        mockRecoveryPhoneService.setupPhoneNumber.getCall(0).args[1],
        phoneNumber
      );
      assert.equal(mockRecoveryPhoneService.getNationalFormat.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.getNationalFormat.getCall(0).args[0],
        phoneNumber
      );
      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 1);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 0);

      assert.equal(mockCustoms.checkAuthenticated.callCount, 1);
      assert.equal(mockCustoms.checkAuthenticated.getCall(0).args[1], uid);
      assert.equal(
        mockCustoms.checkAuthenticated.getCall(0).args[2],
        'recoveryPhoneSendSetupCode'
      );
      assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.setupPhoneNumber.success'
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

      assert.isDefined(resp);
      assert.equal(resp.status, 'failure');
      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 0);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 1);
    });

    it('rejects an unsupported dialing code', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = sinon.fake.returns(
        Promise.reject(new RecoveryNumberNotSupportedError())
      );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber: '+495550005555' },
      });

      await assert.isRejected(promise, 'Invalid phone number');
      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 0);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 1);
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

      await assert.isRejected(promise, 'Text message limit reached');
      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 0);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 1);
    });

    it('rejects a phone number that has been set up for too many accounts', async () => {
      mockRecoveryPhoneService.setupPhoneNumber = sinon.fake.returns(
        Promise.reject(new RecoveryPhoneRegistrationLimitReached())
      );

      const promise = makeRequest({
        method: 'POST',
        path: '/recovery_phone/create',
        credentials: { uid, email },
        payload: { phoneNumber: '+495550005555' },
      });

      await assert.isRejected(
        promise,
        'Limit reached for number off accounts that can be associated with phone number.'
      );
      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 0);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 1);
    });

    it('indicates that recovery phone cannot be removed due to missing backup authentication codes', async () => {
      mockRecoveryPhoneService.removePhoneNumber = sinon.fake.returns(
        Promise.reject(new RecoveryNumberRemoveMissingBackupCodes(uid))
      );

      const promise = makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
        payload: { phoneNumber: '+495550005555' },
      });

      await assert.isRejected(
        promise,
        'Unable to remove recovery phone, missing backup authentication codes.'
      );
      assert.equal(mockGlean.twoStepAuthPhoneRemove.success.callCount, 0);
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

      await assert.isRejected(promise, 'System unavailable, try again soon');
      assert.equal(mockGlean.twoStepAuthPhoneCode.sent.callCount, 0);
      assert.equal(mockGlean.twoStepAuthPhoneCode.sendError.callCount, 1);
    });

    it('validates incoming phone number', () => {
      const route = getRoute(routes, '/recovery_phone/create', 'POST');
      const joiSchema = route.options.validate.payload;

      const validNumber = joiSchema.validate({ phoneNumber: '+15550005555' });
      const missingNumber = joiSchema.validate({});
      const invalidNumber = joiSchema.validate({ phoneNumber: '5550005555' });

      assert.isUndefined(validNumber.error);
      assert.include(missingNumber.error.message, 'is required');
      assert.include(
        invalidNumber.error.message,
        'fails to match the required pattern'
      );
    });

    it('requires session authorization', () => {
      const route = getRoute(routes, '/recovery_phone/create', 'POST');
      assert.equal(route.options.auth.strategy, 'sessionToken');
    });
  });

  describe('POST /recovery_phone/confirm', async () => {
    it('confirms a code', async () => {
      mockRecoveryPhoneService.confirmSetupCode = sinon.fake.returns(true);
      mockRecoveryPhoneService.hasConfirmed = sinon.fake.returns({
        exists: true,
        phoneNumber,
        nationalFormat,
      });
      mockRecoveryPhoneService.stripPhoneNumber = sinon.fake.returns('5555');

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      assert.isDefined(resp);
      assert.equal(resp.status, 'success');
      // Gives back the full national format as the user just successfully
      // confirmed the code
      assert.equal(resp.nationalFormat, nationalFormat);
      assert.equal(mockRecoveryPhoneService.confirmSetupCode.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.confirmSetupCode.getCall(0).args[0],
        uid
      );
      assert.equal(
        mockRecoveryPhoneService.confirmSetupCode.getCall(0).args[1],
        code
      );
      assert.equal(mockGlean.twoStepAuthPhoneCode.complete.callCount, 1);
      assert.calledOnce(mockMailer.sendPostAddRecoveryPhoneEmail);
      assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
        mockDb,
        {
          name: 'account.recovery_phone_setup_complete',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
        }
      );

      assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.phoneAdded.success'
      );
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

      await assert.isRejected(promise, 'Invalid or expired confirmation code');
      assert.equal(mockGlean.twoStepAuthPhoneCode.complete.callCount, 0);
      assert.notCalled(mockMailer.sendPostAddRecoveryPhoneEmail);
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

      await assert.isRejected(promise, 'System unavailable, try again soon');

      assert.equal(mockGlean.twoStepAuthPhoneCode.complete.callCount, 0);
      assert.notCalled(mockMailer.sendPostAddRecoveryPhoneEmail);
    });
  });

  describe('POST /recovery_phone/signin/confirm', async () => {
    it('confirms a code during signin', async () => {
      mockRecoveryPhoneService.confirmSigninCode = sinon.fake.returns(true);

      const resp = await makeRequest({
        method: 'POST',
        path: '/recovery_phone/signin/confirm',
        credentials: { uid, email },
        payload: { code },
      });

      assert.isDefined(resp);
      assert.equal(resp.status, 'success');
      assert.equal(mockRecoveryPhoneService.confirmSigninCode.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.confirmSigninCode.getCall(0).args[0],
        uid
      );
      assert.equal(
        mockRecoveryPhoneService.confirmSigninCode.getCall(0).args[1],
        code
      );
      assert.equal(mockAccountManager.verifySession.callCount, 1);
      assert.equal(mockGlean.twoStepAuthPhoneCode.complete.callCount, 1);
      assert.calledOnce(mockMailer.sendPostSigninRecoveryPhoneEmail);
      assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
        mockDb,
        {
          name: 'account.recovery_phone_signin_complete',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
        }
      );
      assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.phoneSignin.success'
      );
    });

    it('fails confirms a code during signin', async () => {
      mockRecoveryPhoneService.confirmSigninCode = sinon.fake.returns(false);

      try {
        await makeRequest({
          method: 'POST',
          path: '/recovery_phone/signin/confirm',
          credentials: { uid, email },
          payload: { code },
        });
      } catch (err) {
        assert.isDefined(err);
        assert.equal(err.errno, 183);
        assert.calledOnceWithExactly(
          mockAccountEventsManager.recordSecurityEvent,
          mockDb,
          {
            name: 'account.recovery_phone_signin_failed',
            uid,
            ipAddr: '63.245.221.32',
            tokenId: undefined,
          }
        );
      }
    });
  });

  describe('DELETE /recovery_phone', async () => {
    it('removes a recovery phone', async () => {
      mockRecoveryPhoneService.removePhoneNumber = sinon.fake.returns(true);

      const resp = await makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
      });

      assert.isDefined(resp);
      assert.equal(mockRecoveryPhoneService.removePhoneNumber.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.removePhoneNumber.getCall(0).args[0],
        uid
      );
      assert.equal(mockGlean.twoStepAuthPhoneRemove.success.callCount, 1);
      assert.calledOnce(mockMailer.sendPostRemoveRecoveryPhoneEmail);
      assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
        mockDb,
        {
          name: 'account.recovery_phone_removed',
          uid,
          ipAddr: '63.245.221.32',
          tokenId: undefined,
        }
      );
      assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.recoveryPhone.phoneRemoved.success'
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

      await assert.isRejected(promise, 'System unavailable, try again soon');
      assert.equal(mockGlean.twoStepAuthPhoneRemove.success.callCount, 0);
      assert.notCalled(mockMailer.sendPostRemoveRecoveryPhoneEmail);
    });

    it('handles uid without registered phone number', async () => {
      mockRecoveryPhoneService.removePhoneNumber = sinon.fake.returns(false);
      await makeRequest({
        method: 'DELETE',
        path: '/recovery_phone',
        credentials: { uid, email },
      });
      assert.equal(mockGlean.twoStepAuthPhoneRemove.success.callCount, 0);
    });
  });

  describe('POST /recovery_phone/available', async () => {
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

      assert.deepEqual(resp, { available: true });
      assert.calledOnceWithExactly(
        mockRecoveryPhoneService.available,
        uid,
        'US'
      );
    });
  });

  describe('GET /recovery_phone', async () => {
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

      assert.isDefined(resp);
      assert.equal(mockRecoveryPhoneService.hasConfirmed.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.hasConfirmed.getCall(0).args[0],
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

      await assert.isRejected(promise, 'System unavailable, try again soon');
      assert.equal(mockGlean.twoStepAuthPhoneRemove.success.callCount, 0);
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
      assert.isDefined(resp);
      assert.isDefined(resp.exists);
      assert.isDefined(resp.phoneNumber);
      assert.equal(mockRecoveryPhoneService.hasConfirmed.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.hasConfirmed.getCall(0).args[0],
        uid
      );
      assert.equal(mockRecoveryPhoneService.hasConfirmed.getCall(0).args[1], 4);
    });
  });

  describe('POST /recovery_phone/message_status', async () => {
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

      assert.isDefined(resp);

      assert.equal(
        mockRecoveryPhoneService.validateTwilioWebhookCallback.callCount,
        1
      );
      assert.deepEqual(
        mockRecoveryPhoneService.validateTwilioWebhookCallback.getCall(0)
          .args[0],
        {
          twilio: {
            signature: 'VALID_SIGNATURE',
            params: payload,
          },
        }
      );

      assert.equal(mockRecoveryPhoneService.onMessageStatusUpdate.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.onMessageStatusUpdate.getCall(0).args[0],
        payload
      );
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

      assert.isDefined(resp);

      assert.equal(
        mockRecoveryPhoneService.validateTwilioWebhookCallback.callCount,
        1
      );
      assert.deepEqual(
        mockRecoveryPhoneService.validateTwilioWebhookCallback.getCall(0)
          .args[0],
        {
          fxa: {
            signature: 'VALID_SIGNATURE',
            message: 'FXA_MESSAGE',
          },
        }
      );

      assert.equal(mockRecoveryPhoneService.onMessageStatusUpdate.callCount, 1);
      assert.equal(
        mockRecoveryPhoneService.onMessageStatusUpdate.getCall(0).args[0],
        payload
      );
    });

    it('throws on invalid / missing signatures', async () => {
      mockRecoveryPhoneService.validateTwilioWebhookCallback =
        sinon.fake.rejects(AppError.unauthorized('Signature Invalid'));
      try {
        await makeRequest({
          method: 'POST',
          path: '/recovery_phone/message_status',
          headers: {},
          payload: {},
        });
        assert.fail('Invalid Signature should have been thrown');
      } catch (err) {
        assert.deepEqual(err, AppError.unauthorized('Signature Invalid'));
      }
    });
  });
});
