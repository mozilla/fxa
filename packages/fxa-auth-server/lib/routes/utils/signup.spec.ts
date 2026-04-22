/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocks = require('../../../test/mocks');
const { gleanMetrics } = require('../../metrics/glean');

const TEST_EMAIL = 'test@email.com';
const TEST_UID = '123123';

const gleanConfig = {
  enabled: false,
  applicationId: 'accounts_backend_test',
  channel: 'test',
  loggerAppName: 'auth-server-tests',
};
const glean = gleanMetrics({ gleanMetrics: gleanConfig });

async function setup(options: any) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const mailer = options.mailer || {};
  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  const push = options.push || mocks.mockPush();
  return require('./signup')(
    log,
    db,
    mailer,
    push,
    verificationReminders,
    glean
  );
}

describe('verifyAccount', () => {
  let db: any;
  let log: any;
  let mailer: any;
  let fxaMailer: any;
  let push: any;
  let request: any;
  let verificationReminders: any;
  let utils: any;
  let account: any;

  beforeEach(() => {
    account = {
      uid: TEST_UID,
      primaryEmail: {
        email: TEST_EMAIL,
        isVerified: false,
        emailCode: '123',
      },
    };
    db = mocks.mockDB(account);
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    fxaMailer = mocks.mockFxaMailer();
    push = mocks.mockPush();
    verificationReminders = mocks.mockVerificationReminders();
    request = mocks.mockRequest({
      log,
      payload: {
        metricsContext: {
          deviceId: 'wibble',
          flowBeginTime: Date.now(),
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          planId: 'planId',
          productId: 'productId',
        },
      },
    });
  });

  describe('can verify account', () => {
    const options = {
      service: 'sync',
    };

    beforeEach(async () => {
      utils = await setup({ db, log, mailer, push, verificationReminders });
      await utils.verifyAccount(request, account, options);
    });

    it('should verify the account', () => {
      expect(db.verifyEmail).toHaveBeenCalledTimes(1);
      expect(db.verifyEmail).toHaveBeenCalledWith(
        account,
        account.primaryEmail.emailCode
      );
    });

    it('should notify attached services', () => {
      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      expect(log.notifyAttachedServices).toHaveBeenNthCalledWith(
        1,
        'verified',
        expect.anything(),
        expect.objectContaining({
          uid: TEST_UID,
          service: 'sync',
          country: 'United States',
          countryCode: 'US',
          userAgent: 'test user-agent',
        })
      );
    });

    it('should emit metrics', () => {
      expect(log.activityEvent).toHaveBeenCalledTimes(1);
      expect(log.activityEvent).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          planId: 'planId',
          productId: 'productId',
        })
      );
      expect(log.flowEvent).toHaveBeenCalledTimes(1);
      expect(log.flowEvent).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ event: 'account.verified' })
      );
    });

    it('should delete verification reminders', () => {
      expect(verificationReminders.delete).toHaveBeenCalledTimes(1);
      expect(verificationReminders.delete).toHaveBeenCalledWith(TEST_UID);
    });

    it('should send push notifications', () => {
      expect(push.notifyAccountUpdated).toHaveBeenCalledTimes(1);
      expect(push.notifyAccountUpdated).toHaveBeenCalledWith(
        TEST_UID,
        [],
        'accountVerify'
      );
    });

    it('should send post account verification email', () => {
      expect(fxaMailer.sendPostVerifyEmail).toHaveBeenCalledTimes(1);
      expect(fxaMailer.sendPostVerifyEmail).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          sync: options.service === 'sync',
          uid: TEST_UID,
        })
      );
    });
  });
});
