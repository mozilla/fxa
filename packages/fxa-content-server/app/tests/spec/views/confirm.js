/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var BaseBroker = require('models/auth_brokers/base');
  var chai = require('chai');
  var VerificationReasons = require('lib/verification-reasons');
  var Duration = require('duration');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/confirm');
  var WindowMock = require('../../mocks/window');

  var SIGNIN_REASON = VerificationReasons.SIGN_IN;
  var SIGNUP_REASON = VerificationReasons.SIGN_UP;

  var assert = chai.assert;

  describe('views/confirm', function () {
    var account;
    var broker;
    var fxaClient;
    var metrics;
    var model;
    var notifier;
    var relier;
    var user;
    var view;
    var windowMock;

    beforeEach(function () {
      fxaClient = new FxaClient();
      metrics = new Metrics();
      model = new Backbone.Model();
      notifier = new Notifier();
      user = new User({
        fxaClient: fxaClient
      });
      windowMock = new WindowMock();

      relier = new Relier({
        window: windowMock
      });

      broker = new BaseBroker({
        relier: relier,
        session: Session,
        window: windowMock
      });

      account = user.initAccount({
        customizeSync: true,
        email: 'a@a.com',
        sessionToken: 'fake session token',
        uid: 'uid'
      });

      model.set({
        account: account,
        type: SIGNUP_REASON
      });

      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
      });

      view = new View({
        broker: broker,
        canGoBack: true,
        fxaClient: fxaClient,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'confirm',
        window: windowMock
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = metrics = null;
    });

    describe('render', function () {
      describe('with sessionToken', function () {
        describe('sign up', function () {
          beforeEach(function () {
            model.set('type', SIGNUP_REASON);

            return view.render();
          });

          it('draws the correct template', function () {
            assert.lengthOf($('#back'), 0);
            assert.lengthOf($('#fxa-confirm-header'), 1);
          });
        });

        describe('sign in', function () {
          beforeEach(function () {
            model.set('type', SIGNIN_REASON);

            return view.render();
          });

          it('draws the correct template', function () {
            assert.lengthOf($('#back'), 1);
            assert.lengthOf($('#fxa-confirm-signin-header'), 1);
          });
        });
      });

      describe('without a sessionToken', function () {
        beforeEach(function () {
          model.set({
            account: user.initAccount()
          });

          view = new View({
            broker: broker,
            canGoBack: true,
            model: model,
            notifier: notifier,
            user: user,
            window: windowMock
          });

          sinon.spy(view, 'navigate');
        });

        describe('sign up', function () {
          beforeEach(function () {
            return view.render();
          });

          it('redirects to `/signup`', function () {
            assert.isTrue(view.navigate.calledWith('signup'));
          });
        });

        describe('sign in', function () {
          beforeEach(function () {
            model.set('type', VerificationReasons.SIGN_IN);

            return view.render();
          });

          it('redirects to `/signin`', function () {
            assert.isTrue(view.navigate.calledWith('signin'));
          });
        });
      });
    });

    describe('afterVisible', function () {
      it('notifies the broker before the confirmation', function () {
        sinon.spy(broker, 'persistVerificationData');

        sinon.stub(broker, 'beforeSignUpConfirmationPoll', function (account) {
          assert.isTrue(account.get('customizeSync'));
          return p();
        });

        return view.afterVisible()
          .then(function () {
            assert.isTrue(broker.persistVerificationData.called);
            assert.isTrue(
                broker.beforeSignUpConfirmationPoll.calledWith(account));
          });
      });

      describe('signup', function () {
        it('notifies the broker after the account is confirmed', function () {
          sinon.stub(view, 'isSignUp', function () {
            return true;
          });

          sinon.stub(view, 'isSignIn', function () {
            return false;
          });

          testEmailVerificationPoll('afterSignUpConfirmationPoll');
        });
      });

      describe('signin', function () {
        it('notifies the broker after the account is confirmed', function () {
          sinon.stub(view, 'isSignUp', function () {
            return false;
          });

          sinon.stub(view, 'isSignIn', function () {
            return true;
          });

          testEmailVerificationPoll('afterSignIn');
        });
      });

      function testEmailVerificationPoll(expectedBrokerCall) {
        var notifySpy = sinon.spy(view.notifier, 'trigger');

        sinon.stub(broker, 'beforeSignUpConfirmationPoll', function () {
          return p();
        });

        sinon.stub(broker, expectedBrokerCall, function () {
          return p();
        });

        sinon.stub(user, 'setAccount', function (account) {
          assert.equal(account.get('sessionToken'), account.get('sessionToken'));
          assert.isTrue(account.get('verified'));
          return p();
        });

        var count = 0;
        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          // force at least one cycle through the poll
          count++;
          return p({ verified: count === 2 });
        });

        sinon.stub(view, 'setTimeout', function (callback) {
          callback();
        });

        view.VERIFICATION_POLL_IN_MS = new Duration('100ms').milliseconds();
        return view.afterVisible()
          .then(function () {
            assert.isTrue(user.setAccount.called);
            assert.isTrue(broker.beforeSignUpConfirmationPoll.calledWith(account));
            assert.isTrue(broker[expectedBrokerCall].calledWith(account));
            assert.isTrue(TestHelpers.isEventLogged(
                    metrics, 'confirm.verification.success'));
            assert.isTrue(notifySpy.withArgs('verification.success').calledOnce);
          });
      }

      it('displays an error message allowing the user to re-signup if their email bounces', function () {
        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          return p.reject(AuthErrors.toError('SIGNUP_EMAIL_BOUNCE'));
        });

        sinon.spy(view, 'navigate');
        return view.afterVisible()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signup', { bouncedEmail: 'a@a.com' }));
            assert.isTrue(view.fxaClient.recoveryEmailStatus.called);
          });
      });

      it('displays an error when an unknown error occurs', function () {
        var unknownError = 'Something failed';
        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          return p.reject(new Error(unknownError));
        });

        sinon.spy(view, 'navigate');
        return view.afterVisible()
          .then(function () {
            assert.isTrue(view.fxaClient.recoveryEmailStatus.called);
            assert.equal(view.$('.error').text(), unknownError);
          });
      });

      describe('with an unexpected error', function () {
        var sandbox;

        beforeEach(function () {
          sandbox = sinon.sandbox.create();
          sandbox.stub(view.fxaClient, 'recoveryEmailStatus', function () {
            var callCount = view.fxaClient.recoveryEmailStatus.callCount;
            if (callCount < 2) {
              return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
            } else {
              return p({ verified: true });
            }
          });

          sandbox.spy(view, 'navigate');
          sandbox.spy(view.sentryMetrics, 'captureException');
          sandbox.spy(view, '_startPolling');

          sandbox.stub(view, 'setTimeout', function (callback) {
            callback();
          });

          return view.afterVisible();
        });

        afterEach(function () {
          sandbox.restore();
        });

        it('polls the auth server', function () {
          assert.equal(view.fxaClient.recoveryEmailStatus.callCount, 2);
        });

        it('captures the exception to Sentry', function () {
          assert.isTrue(view.sentryMetrics.captureException.called);
        });

        it('does not display an error to the user when unexpected error occurs', function () {
          assert.equal(view.$('.error').text(), '');
        });

        it('restarts polling when an unexpected error occurs', function () {
          assert.equal(view._startPolling.callCount, 2);
        });
      });
    });

    describe('submit', function () {
      it('resends the confirmation email, shows success message, logs the event', function () {
        sinon.stub(account, 'retrySignUp', function () {
          return p();
        });
        sinon.stub(view, 'getStringifiedResumeToken', function () {
          return 'resume token';
        });

        return view.submit()
          .then(function () {
            assert.isTrue(view.$('.success').is(':visible'));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'confirm.resend'));

            assert.isTrue(account.retrySignUp.calledWith(
              relier,
              {
                resume: 'resume token'
              }
            ));
          });
      });

      describe('with an invalid resend token', function () {
        beforeEach(function () {
          sinon.stub(account, 'retrySignUp', function () {
            return p.reject(AuthErrors.toError('INVALID_TOKEN'));
          });

          sinon.spy(view, 'navigate');

          return view.submit();
        });

        it('redirects to /signup', function () {
          assert.isTrue(view.navigate.calledWith('signup'));
        });

        it('logs an event', function () {
          assert.isTrue(TestHelpers.isEventLogged(metrics,
                            'confirm.resend'));
        });
      });

      describe('that causes other errors', function () {
        var error;

        beforeEach(function () {
          sinon.stub(account, 'retrySignUp', function () {
            return p.reject(new Error('synthesized error from auth server'));
          });

          return view.submit()
            .then(assert.fail, function (err) {
              error = err;
            });
        });

        it('displays the error', function () {
          assert.equal(error.message, 'synthesized error from auth server');
        });
      });
    });

    describe('validateAndSubmit', function () {
      it('only called after click on #resend', function () {
        var count = 0;
        view.validateAndSubmit = function () {
          count++;
        };

        sinon.stub(account, 'retrySignUp', function () {
          return p();
        });

        view.$('section').click();
        assert.equal(count, 0);

        view.$('#resend').click();
        assert.equal(count, 1);
      });

      it('debounces resend calls - submit on first four attempts', function () {
        var count = 0;

        sinon.stub(account, 'retrySignUp', function () {
          count++;
          return p(true);
        });

        return view.validateAndSubmit()
              .then(function () {
                assert.equal(count, 1);
                assert.equal(view.$('#resend:visible').length, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 2);
                assert.equal(view.$('#resend:visible').length, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 3);
                assert.equal(view.$('#resend:visible').length, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 4);
                assert.equal(view.$('#resend:visible').length, 0);

                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.resend'));
                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.too_many_attempts'));
              });
      });
    });

    describe('complete', function () {
      beforeEach(function () {
        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          return p({
            verified: true
          });
        });

        sinon.stub(view, 'navigate', function (page) {
          // do nothing
        });
      });

      it('direct access redirects to `/settings`', function () {
        sinon.stub(relier, 'isDirectAccess', function () {
          return true;
        });

        return view.afterVisible()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('settings'));
          });
      });

      describe('signup', function () {
        beforeEach(function () {
          sinon.stub(relier, 'isDirectAccess', function () {
            return false;
          });

          model.set('type', SIGNUP_REASON);

          return view.afterVisible();
        });

        it('redirects to `signup_complete`', function () {
          assert.isTrue(view.navigate.calledWith('signup_complete'));
        });
      });

      describe('signin', function () {
        beforeEach(function () {
          sinon.stub(relier, 'isDirectAccess', function () {
            return false;
          });

          model.set('type', SIGNIN_REASON);

          return view.afterVisible();
        });

        it('redirects to `/signin_complete`', function () {
          assert.isTrue(view.navigate.calledWith('signin_complete'));
        });
      });
    });

    describe('openGmail feature', function () {
      it('it is not visible in basic contexts', function () {
        assert.notOk($('#open-gmail').length);
      });


      it('is visible with the the openGmailButtonVisible capability and email is @gmail.com', function () {
        broker.setCapability('openGmailButtonVisible', true);

        account = user.initAccount({
          customizeSync: true,
          email: 'a@gmail.com',
          sessionToken: 'fake session token',
          uid: 'uid'
        });

        model.set({
          account: account
        });

        view = new View({
          broker: broker,
          canGoBack: true,
          fxaClient: fxaClient,
          metrics: metrics,
          model: model,
          notifier: notifier,
          relier: relier,
          user: user,
          viewName: 'confirm',
          window: windowMock
        });

        return view.render()
          .then(function () {
            $('#container').html(view.el);
            assert.lengthOf(view.$('#open-gmail'), 1);
          });
      });
    });
  });
});
