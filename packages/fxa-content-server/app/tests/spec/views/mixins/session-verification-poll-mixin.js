/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Account = require('models/account');
  const AuthErrors = require('lib/auth-errors');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Notifier = require('lib/channels/notifier');
  const SessionVerificationPoll = require('models/polls/session-verification');
  const SessionVerificationPollMixin = require('views/mixins/session-verification-poll-mixin');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  class View extends BaseView {

  }

  Cocktail.mixin(
    View,
    SessionVerificationPollMixin
  );

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

      sessionVerificationPoll = new SessionVerificationPoll({}, {
        account,
        pollIntervalInMS: 2,
        window: windowMock
      });

      view = new View({
        notifier,
        sessionVerificationPoll,
        window: windowMock
      });
    });

    describe('waitForSessionVerification', () => {
      beforeEach(() => {
        sinon.stub(view, '_handleSessionVerificationPollErrors', () => {});
        sinon.stub(sessionVerificationPoll, 'start', () => {});
      });

      it('calls the callback when the session is verified', (done) => {
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
        assert.isTrue(view._handleSessionVerificationPollErrors.calledWith(account, error));
      });
    });

    describe('_handleSessionVerificationPollErrors', () => {
      it('displays an error message allowing the user to re-signup if their email bounces on signup', () => {
        sinon.stub(view, 'isSignUp', () => true);
        sinon.spy(view, 'navigate');
        view._handleSessionVerificationPollErrors(account, AuthErrors.toError('SIGNUP_EMAIL_BOUNCE'));

        assert.isTrue(view.navigate.calledWith('signup', { bouncedEmail: 'a@a.com' }));
      });

      it('navigates to the signin-bounced screen if their email bounces on signin', () => {
        sinon.stub(view, 'isSignUp', () => false);
        sinon.spy(view, 'navigate');
        view._handleSessionVerificationPollErrors(account, AuthErrors.toError('SIGNUP_EMAIL_BOUNCE'));

        assert.isTrue(view.navigate.calledWith('signin_bounced', { email: 'a@a.com' }));
      });

      it('displays an error when an unknown error occurs', function () {
        const unknownError = 'Something failed';

        sinon.spy(view, 'navigate');
        sinon.spy(view, 'displayError');
        view._handleSessionVerificationPollErrors(account, unknownError);

        assert.isTrue(view.displayError.calledOnce);
        assert.isTrue(view.displayError.calledWith(unknownError));
      });

      describe('with an unexpected error', function () {
        let sandbox;

        beforeEach(function () {
          sandbox = sinon.sandbox.create();
          sandbox.spy(view.sentryMetrics, 'captureException');
          sandbox.stub(sessionVerificationPoll, 'start', () => {});
          sandbox.stub(view, 'setTimeout', (callback) => callback());

          view._handleSessionVerificationPollErrors(account, AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        afterEach(function () {
          sandbox.restore();
        });

        it('polls the auth server, captures the exception, no error to user, restarts polling', function () {
          assert.isTrue(view.sentryMetrics.captureException.called);
          assert.equal(view.sentryMetrics.captureException.firstCall.args[0].errno,
             AuthErrors.toError('POLLING_FAILED').errno);
          assert.equal(view.$('.error').text(), '');
          assert.equal(sessionVerificationPoll.start.callCount, 1);
        });
      });
    });

    describe('destroy', () => {
      beforeEach(() => {
        sinon.stub(sessionVerificationPoll, 'stop', () => {});
      });

      it('stops the verification poll', () => {
        view.destroy();
        assert.isTrue(sessionVerificationPoll.stop.calledOnce);
      });
    });
  });
});
