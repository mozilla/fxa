/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import SessionVerificationPoll from 'models/polls/session-verification';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

describe('models/polls/session-verification', () => {
  let account;
  let poll;
  let windowMock;

  beforeEach(() => {
    account = new Account();
    windowMock = new WindowMock();
    sinon.stub(windowMock, 'setTimeout').callsFake((func) => func());

    poll = new SessionVerificationPoll(
      {},
      {
        account,
        pollIntervalInMS: 2,
        window: windowMock,
      }
    );
  });

  describe('waitForSessionVerification', () => {
    describe('with a valid `sessionToken`', () => {
      beforeEach(() => {
        sinon.stub(account, 'sessionStatus').callsFake(() => {
          return Promise.resolve({
            verified: account.sessionStatus.callCount === 3,
          });
        });

        return new Promise((resolve, reject) => {
          poll.on('verified', () => resolve());
          poll.on('error', reject);

          poll.start();
        });
      });

      it('polls until /recovery_email/status returns `verified: true`', () => {
        assert.equal(account.sessionStatus.callCount, 3);
      });
    });

    describe('with an invalid `sessionToken`', () => {
      beforeEach(() => {
        sinon
          .stub(account, 'sessionStatus')
          .callsFake(() => Promise.reject(AuthErrors.toError('INVALID_TOKEN')));
      });

      describe('model does not have a `uid`', () => {
        let err;

        beforeEach(() => {
          account.unset('uid');

          return new Promise((resolve, reject) => {
            poll.on('verified', () => reject(assert.catch()));
            poll.on('error', (_err) => {
              err = _err;
              resolve();
            });

            poll.start();
          });
        });

        it('resolves with `INVALID_TOKEN` error', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
      });

      describe('`uid` exists', () => {
        let err;

        beforeEach(() => {
          account.set('uid', 'uid');

          sinon
            .stub(account, 'checkUidExists')
            .callsFake(() => Promise.resolve(true));

          return new Promise((resolve, reject) => {
            poll.on('verified', () => reject(assert.catch()));
            poll.on('error', (_err) => {
              err = _err;
              resolve();
            });

            poll.start();
          });
        });

        it('resolves with `INVALID_TOKEN` error', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
      });

      describe('`uid` does not exist', () => {
        let err;

        beforeEach(() => {
          account.set('uid', 'uid');

          sinon
            .stub(account, 'checkUidExists')
            .callsFake(() => Promise.resolve(false));

          return new Promise((resolve, reject) => {
            poll.on('verified', () => reject(assert.catch()));
            poll.on('error', (_err) => {
              err = _err;
              resolve();
            });

            poll.start();
          });
        });

        it('resolves with `SIGNUP_EMAIL_BOUNCE` error', () => {
          assert.isTrue(AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE'));
        });
      });
    });
  });
});
