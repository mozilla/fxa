/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Notifier from 'lib/channels/notifier';
import SessionVerificationPoll from 'models/polls/session-verification';
import SessionVerificationPollMixin from 'views/mixins/session-verification-poll-mixin';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

class View extends BaseView {}

Cocktail.mixin(View, SessionVerificationPollMixin);

describe('views/mixins/session-verification-poll-mixin', () => {
  let account;
  let notifier;
  let sessionVerificationPoll;
  let view;
  let windowMock;

  beforeEach(() => {
    account = new Account({ email: 'a@a.com' });
    notifier = new Notifier();
    windowMock = new WindowMock();

    sessionVerificationPoll = new SessionVerificationPoll(
      {},
      {
        account,
        pollIntervalInMS: 2,
        window: windowMock,
      }
    );

    view = new View({
      notifier,
      sessionVerificationPoll,
      window: windowMock,
    });
  });

  describe('waitForSessionVerification', () => {
    beforeEach(() => {
      sinon
        .stub(view, '_handleSessionVerificationPollErrors')
        .callsFake(() => {});
      sinon.stub(sessionVerificationPoll, 'start').callsFake(() => {});
    });

    it('calls the callback when the session is verified', done => {
      view.waitForSessionVerification(account, () => done());

      assert.isTrue(sessionVerificationPoll.start.calledOnce);

      sessionVerificationPoll.trigger('verified');

      assert.isFalse(view._handleSessionVerificationPollErrors.called);
    });

    it('delegates to `_handleSessionVerificationPollErrors` on poll error', () => {
      view.waitForSessionVerification(account, assert.fail);

      assert.isTrue(sessionVerificationPoll.start.calledOnce);
      const error = new Error('uh oh');
      sessionVerificationPoll.trigger('error', error);

      assert.isTrue(view._handleSessionVerificationPollErrors.calledOnce);
      assert.isTrue(
        view._handleSessionVerificationPollErrors.calledWith(account, error)
      );
    });
  });

  describe('_handleSessionVerificationPollErrors', () => {
    it('displays an error message allowing the user to re-signup if their email bounces on signup', () => {
      sinon.stub(view, 'isSignUp').callsFake(() => true);
      sinon.spy(view, 'navigate');
      view._handleSessionVerificationPollErrors(
        account,
        AuthErrors.toError('SIGNUP_EMAIL_BOUNCE')
      );

      assert.isTrue(view.navigate.calledWith('/', { account }));

      assert.isTrue(account.get('hasBounced'));
    });

    it('navigates to the signin-bounced screen if their email bounces on signin', () => {
      sinon.stub(view, 'isSignUp').callsFake(() => false);
      sinon.spy(view, 'navigate');
      view._handleSessionVerificationPollErrors(
        account,
        AuthErrors.toError('SIGNUP_EMAIL_BOUNCE')
      );

      assert.isTrue(
        view.navigate.calledWith('signin_bounced', { email: 'a@a.com' })
      );
    });

    it('displays an error when an unknown error occurs', function() {
      const unknownError = 'Something failed';

      sinon.spy(view, 'navigate');
      sinon.spy(view, 'displayError');
      view._handleSessionVerificationPollErrors(account, unknownError);

      assert.isTrue(view.displayError.calledOnce);
      assert.isTrue(view.displayError.calledWith(unknownError));
    });

    function testErrorRestartsPoll(errorName) {
      describe(`with ${errorName}`, function() {
        let sandbox;

        beforeEach(function() {
          sandbox = sinon.sandbox.create();
          sandbox.stub(sessionVerificationPoll, 'start').callsFake(() => {});
          sandbox.stub(view, 'setTimeout').callsFake(callback => callback());

          view._handleSessionVerificationPollErrors(
            account,
            AuthErrors.toError(errorName)
          );
        });

        afterEach(function() {
          sandbox.restore();
        });

        it('polls the auth server, captures the exception, no error to user, restarts polling', function() {
          assert.equal(view.$('.error').text(), '');
          assert.equal(sessionVerificationPoll.start.callCount, 1);
        });
      });
    }

    testErrorRestartsPoll('BACKEND_SERVICE_FAILURE');
    testErrorRestartsPoll('UNEXPECTED_ERROR');
  });

  describe('destroy', () => {
    beforeEach(() => {
      sinon.stub(sessionVerificationPoll, 'stop').callsFake(() => {});
    });

    it('stops the verification poll', () => {
      view.destroy();
      assert.isTrue(sessionVerificationPoll.stop.calledOnce);
    });
  });
});
