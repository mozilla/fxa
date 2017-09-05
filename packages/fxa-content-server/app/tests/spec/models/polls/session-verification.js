/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Account = require('models/account');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const p = require('lib/promise');
  const SessionVerificationPoll = require('models/polls/session-verification');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  describe('models/polls/session-verification', () => {
    let account;
    let poll;
    let windowMock;

    beforeEach(() => {
      account = new Account();
      windowMock = new WindowMock();
      sinon.stub(windowMock, 'setTimeout').callsFake((func) => func());

      poll = new SessionVerificationPoll({}, {
        account,
        pollIntervalInMS: 2,
        window: windowMock
      });
    });

    describe('waitForSessionVerification', () => {
      describe('with a valid `sessionToken`', () => {
        beforeEach(() => {
          sinon.stub(account, 'sessionStatus').callsFake(() => {
            return p({
              verified: account.sessionStatus.callCount === 3
            });
          });

          const deferred = p.defer();

          poll.on('verified', () => deferred.resolve());
          poll.on('error', (err) => deferred.reject(err));

          poll.start();

          return deferred.promise;
        });

        it('polls until /recovery_email/status returns `verified: true`', () => {
          assert.equal(account.sessionStatus.callCount, 3);
        });
      });

      describe('with an invalid `sessionToken`', () => {
        beforeEach(() => {
          sinon.stub(account, 'sessionStatus').callsFake(() => p.reject(AuthErrors.toError('INVALID_TOKEN')));
        });

        describe('model does not have a `uid`', () => {
          let err;

          beforeEach(() => {
            account.unset('uid');

            const deferred = p.defer();

            poll.on('verified', () => deferred.reject(assert.fail()));
            poll.on('error', (_err) => {
              err = _err;
              deferred.resolve();
            });

            poll.start();

            return deferred.promise;
          });

          it('resolves with `INVALID_TOKEN` error', () => {
            assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
          });
        });

        describe('`uid` exists', () => {
          let err;

          beforeEach(() => {
            account.set('uid', 'uid');

            sinon.stub(account, 'checkUidExists').callsFake(() => p(true));

            const deferred = p.defer();

            poll.on('verified', () => deferred.reject(assert.fail()));
            poll.on('error', (_err) => {
              err = _err;
              deferred.resolve();
            });

            poll.start();

            return deferred.promise;
          });

          it('resolves with `INVALID_TOKEN` error', () => {
            assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
          });
        });

        describe('`uid` does not exist', () => {
          let err;

          beforeEach(() => {
            account.set('uid', 'uid');

            sinon.stub(account, 'checkUidExists').callsFake(() => p(false));

            const deferred = p.defer();

            poll.on('verified', () => deferred.reject(assert.fail()));
            poll.on('error', (_err) => {
              err = _err;
              deferred.resolve();
            });

            poll.start();

            return deferred.promise;
          });

          it('resolves with `SIGNUP_EMAIL_BOUNCE` error', () => {
            assert.isTrue(AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE'));
          });
        });
      });
    });
  });
});
