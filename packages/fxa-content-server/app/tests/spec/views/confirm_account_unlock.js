/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var EphemeralMessages = require('lib/ephemeral-messages');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var OAuthBroker = require('models/auth_brokers/oauth');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/confirm_account_unlock');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/confirm_account_unlock', function () {
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
    var EMAIL = 'testuser@testuser.com';

    function initView() {
      view = new View({
        broker: broker,
        ephemeralMessages: ephemeralMessages,
        fxaClient: fxaClient,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'confirm-account-unlock',
        window: windowMock
      });
      view.VERIFICATION_POLL_IN_MS = 10;
    }

    beforeEach(function () {
      fxaClient = new FxaClient();
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();
      windowMock = new WindowMock();

      broker = new OAuthBroker({
        relier: relier,
        session: Session,
        window: windowMock
      });
      user = new User();

      account = user.initAccount({
        email: EMAIL
      });

      ephemeralMessages = new EphemeralMessages();
      ephemeralMessages.set('data', {
        account: account,
        lockoutSource: 'signin',
        password: 'password'
      });

      initView();

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

    describe('beforeRender', function () {
      beforeEach(function () {
        sinon.stub(account, 'isDefault', function () {
          return true;
        });

        sinon.spy(view, 'navigate');

        return view.beforeRender();
      });

      it('redirects users who browse directly to the page to /signup', function () {
        assert.isTrue(view.navigate.calledWith('signup'));
      });
    });

    describe('render', function () {
      it('shows the confirm-account-unlock view', function () {
        assert.ok($('#fxa-confirm-account-unlock-header').length);
      });
    });

    describe('afterVisible', function () {
      describe('for signin', function () {
        beforeEach(function () {
          var count = 0;
          sinon.stub(fxaClient, 'signIn', function () {
            if (count === 3) {
              return p({
                sessionToken: 'newSessionToken'
              });
            }

            count++;
            return p.reject(AuthErrors.toError('ACCOUNT_LOCKED'));
          });

          // we want the poll to happen.
          windowMock.setTimeout = window.setTimeout.bind(window);

          sinon.stub(broker, 'afterSignIn', function () {
            return p({});
          });

          sinon.spy(view, 'navigate');

          return view.afterVisible();
        });

        it('polls until complete', function () {
          assert.equal(fxaClient.signIn.callCount, 4);
          var args = fxaClient.signIn.args[0];

          var signInEmail = args[0];
          assert.equal(signInEmail, EMAIL);

          var signInPassword = args[1];
          assert.equal(signInPassword, 'password');

          var signInRelier = args[2];
          assert.strictEqual(signInRelier, relier);

          var signInReason = args[3].reason;
          assert.equal(signInReason, fxaClient.SIGNIN_REASON.ACCOUNT_UNLOCK);
        });

        it('if caused by signin, notifies the broker when complete', function () {
          assert.isTrue(broker.afterSignIn.called);
        });

        it('redirects to `/account_unlock_complete`', function () {
          assert.isTrue(view.navigate.calledWith('account_unlock_complete'));
        });
      });

      describe('if not caused by signin', function () {
        beforeEach(function () {
          ephemeralMessages.set('data', {
            account: account,
            lockoutSource: 'change_password',
            password: 'password'
          });

          initView();

          sinon.stub(fxaClient, 'signIn', function () {
            return p({
              sessionToken: 'newSessionToken'
            });
          });

          sinon.spy(broker, 'afterSignIn');
          sinon.spy(view, 'back');

          return view.afterVisible();
        });

        it('does not notify the broker', function () {
          assert.isFalse(broker.afterSignIn.called);
        });

        it('sets the success ephemeral message', function () {
          assert.include(ephemeralMessages.get('success'), 'unlocked');
        });

        it('navigates back a view', function () {
          assert.isTrue(view.back.called);
        });
      });

      describe('if user entered the wrong password', function () {
        beforeEach(function () {
          sinon.stub(fxaClient, 'signIn', function () {
            return p.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
          });

          sinon.spy(broker, 'afterSignIn');
          sinon.spy(view, 'back');

          return view.afterVisible();
        });

        it('does not notify the broker', function () {
          assert.isFalse(broker.afterSignIn.called);
        });

        it('sets the error ephemeral message', function () {
          assert.isTrue(
            AuthErrors.is(ephemeralMessages.get('error'), 'INCORRECT_PASSWORD'));
        });

        it('navigates back', function () {
          assert.isTrue(view.back.called);
        });
      });

      describe('any other poll errors', function () {
        beforeEach(function () {
          sinon.stub(fxaClient, 'signIn', function () {
            return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          sinon.spy(view, 'displayError');

          return view.afterVisible();
        });

        it('are displayed verbatim', function () {
          assert.isTrue(view.displayError.called);

          var err = view.displayError.args[0][0];
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });
    });

    describe('submit', function () {
      it('logs events, calls `sendAccountUnlockEmail`, displays success message', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p();
        });
        sinon.stub(view, 'getStringifiedResumeToken', function () {
          return 'resume token';
        });

        return view.submit()
          .then(function () {
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'confirm-account-unlock.resend'));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'confirm-account-unlock.resend.success'));
            assert.isTrue(fxaClient.sendAccountUnlockEmail.calledWith(
              EMAIL,
              relier,
              {
                resume: 'resume token'
              }
            ));
            assert.isTrue(view.isSuccessVisible());
          });
      });

      it('throws errors for display', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        return view.submit()
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
          });
      });
    });
  });
});
