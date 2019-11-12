/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../../../mocks');

const TEST_EMAIL = 'test@email.com';
const TEST_UID = '123123';

let db, log, mailer, push, request, verificationReminders, utils, account;

async function setup(options) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const mailer = options.mailer || {};
  const verificationReminders =
    options.verificationReminders || mocks.mockVerificationReminders();
  const push = options.push || require('../../../lib/push')(log, db, {});
  return require('../../../../lib/routes/utils/signup')(
    log,
    db,
    mailer,
    push,
    verificationReminders
  );
}

describe('verifyAccount', () => {
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
    push = mocks.mockPush();
    verificationReminders = mocks.mockVerificationReminders();
    request = mocks.mockRequest({
      log,
      metricsContext: mocks.mockMetricsContext(),
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
    let args;
    const options = {
      service: 'sync',
    };

    beforeEach(async () => {
      utils = await setup({ db, log, mailer, push, verificationReminders });
      await utils.verifyAccount(request, account, options);
    });

    it('should verify the account', () => {
      assert.calledOnce(db.verifyEmail);
      assert.calledWithExactly(
        db.verifyEmail,
        account,
        account.primaryEmail.emailCode
      );
    });

    it('should notify attached services', () => {
      assert.calledOnce(log.notifyAttachedServices);

      args = log.notifyAttachedServices.args[0];
      assert.equal(args[0], 'verified');
      assert.equal(args[2].uid, TEST_UID);
      assert.equal(args[2].marketingOptIn, undefined);
      assert.equal(args[2].service, 'sync');
      assert.equal(args[2].country, 'United States', 'set country');
      assert.equal(args[2].countryCode, 'US', 'set country code');
      assert.equal(args[2].userAgent, 'test user-agent');
    });

    it('should emit metrics', () => {
      assert.calledOnce(log.activityEvent);
      args = log.activityEvent.args[0];
      assert.equal(args.length, 1, 'log.activityEvent was passed one argument');
      assert.calledOnce(log.flowEvent);
      assert.equal(
        log.flowEvent.args[0][0].event,
        'account.verified',
        'event was event account.verified'
      );
      assert.equal(args[0].planId, 'planId');
      assert.equal(args[0].productId, 'productId');
    });

    it('should delete verification reminders', () => {
      assert.calledOnce(verificationReminders.delete);
      assert.calledWithExactly(verificationReminders.delete, TEST_UID);
    });

    it('should send push notifications', () => {
      assert.calledOnce(push.notifyAccountUpdated);
      assert.calledWithExactly(
        push.notifyAccountUpdated,
        TEST_UID,
        [],
        'accountVerify'
      );
    });

    it('should send post account verification email', () => {
      assert.calledOnce(mailer.sendPostVerifyEmail);
      assert.equal(
        mailer.sendPostVerifyEmail.args[0][2].service,
        options.service
      );
      assert.equal(mailer.sendPostVerifyEmail.args[0][2].uid, TEST_UID);
    });
  });
});
