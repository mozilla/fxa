/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BaseBroker = require('models/auth_brokers/base');
  var chai = require('chai');
  var EphemeralMessages = require('lib/ephemeral-messages');
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

  var assert = chai.assert;

  describe('views/confirm', function () {
    var account;
    var broker;
    var ephemeralMessages;
    var fxaClient;
    var metrics;
    var notifier;
    var relier;
    var user;
    var view;
    var windowMock;

    beforeEach(function () {
      ephemeralMessages = new EphemeralMessages();
      fxaClient = new FxaClient();
      metrics = new Metrics();
      notifier = new Notifier();
      user = new User();
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

      ephemeralMessages.set('data', {
        account: account
      });

      sinon.stub(user, 'setSignedInAccount', function () {
        return p();
      });

      view = new View({
        broker: broker,
        ephemeralMessages: ephemeralMessages,
        fxaClient: fxaClient,
        metrics: metrics,
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
      it('draws the template', function () {
        assert.ok($('#fxa-confirm-header').length);
      });

      it('redirects to /signup if no account sessionToken', function () {
        ephemeralMessages.set('data', {
          account: user.initAccount()
        });
        view = new View({
          ephemeralMessages: ephemeralMessages,
          notifier: notifier,
          user: user,
          window: windowMock
        });
        sinon.spy(view, 'navigate');
        return view.render()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signup'));
          });
      });

      it('triggers the experiment', function () {
        sinon.spy(view.notifier, 'trigger');
        view.isInExperiment = function () {
          return true;
        };

        return view.render()
          .then(function () {
            assert.isTrue(view.notifier.trigger.called);
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

      it('notifies the broker after the account is confirmed', function () {
        var notifySpy = sinon.spy(view.notifier, 'trigger');

        sinon.stub(broker, 'beforeSignUpConfirmationPoll', function () {
          return p();
        });
        sinon.stub(broker, 'afterSignUpConfirmationPoll', function () {
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

        view.VERIFICATION_POLL_IN_MS = 100;
        return view.afterVisible()
          .then(function () {
            assert.isTrue(user.setAccount.called);
            assert.isTrue(broker.beforeSignUpConfirmationPoll.calledWith(account));
            assert.isTrue(broker.afterSignUpConfirmationPoll.calledWith(account));
            assert.isTrue(TestHelpers.isEventLogged(
                    metrics, 'confirm.verification.success'));
            assert.isTrue(notifySpy.withArgs('verification.success').calledOnce);
          });
      });

      it('displays an error message allowing the user to re-signup if their email bounces', function () {
        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          return p.reject(AuthErrors.toError('SIGNUP_EMAIL_BOUNCE'));
        });

        sinon.spy(view, 'navigate');
        return view.afterVisible()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signup'));
            assert.isTrue(view.fxaClient.recoveryEmailStatus.called);
            assert.equal(
                ephemeralMessages.get('bouncedEmail'), 'a@a.com');
          });
      });
    });

    describe('submit', function () {
      it('resends the confirmation email, shows success message, logs the event', function () {
        sinon.stub(view.fxaClient, 'signUpResend', function () {
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

            assert.isTrue(view.fxaClient.signUpResend.calledWith(
              relier,
              account.get('sessionToken'),
              {
                resume: 'resume token'
              }
            ));
          });
      });

      it('redirects to `/signup` if the resend token is invalid', function () {
        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        sinon.spy(view, 'navigate');

        return view.submit()
              .then(function () {
                assert.isTrue(view.navigate.calledWith('signup'));

                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.resend'));
              });
      });

      it('displays other error messages if there is a problem', function () {
        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p.reject(new Error('synthesized error from auth server'));
        });

        return view.submit()
              .then(assert.fail, function (err) {
                assert.equal(err.message, 'synthesized error from auth server');
              });
      });
    });

    describe('validateAndSubmit', function () {
      it('only called after click on #resend', function () {
        var count = 0;
        view.validateAndSubmit = function () {
          count++;
        };

        sinon.stub(view.fxaClient, 'signUpResend', function () {
          return p();
        });

        view.$('section').click();
        assert.equal(count, 0);

        view.$('#resend').click();
        assert.equal(count, 1);
      });

      it('debounces resend calls - submit on first and forth attempt', function () {
        var count = 0;

        sinon.stub(fxaClient, 'signUpResend', function () {
          count++;
          return p(true);
        });

        return view.validateAndSubmit()
              .then(function () {
                assert.equal(count, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 2);
                assert.equal(view.$('#resend:visible').length, 0);

                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.resend'));
                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.too_many_attempts'));
              });
      });
    });

    describe('complete', function () {
      it('direct access redirects to `/settings`', function () {
        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          return p({
            verified: true
          });
        });

        sinon.stub(relier, 'isDirectAccess', function () {
          return true;
        });

        sinon.stub(view, 'navigate', function (page) {
          // do nothing
        });

        return view.afterVisible()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('settings'));
          });
      });

      it('non-direct-access redirects to `/signup_complete`', function () {
        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          return p({
            verified: true
          });
        });

        sinon.stub(relier, 'isDirectAccess', function () {
          return false;
        });

        sinon.stub(view, 'navigate', function (page) {
          // do nothing
        });

        return view.afterVisible()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signup_complete'));
          });
      });
    });

    describe('_gmailTabOpened', function () {
      it('triggers gmail tab opening', function () {
        sinon.spy(view.notifier, 'trigger');
        view._gmailTabOpened();
        assert.isTrue(view.notifier.trigger.called);
      });
    });
  });
});
