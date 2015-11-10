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
        lockoutSource: 'signin'
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
      it('redirects users who browse directly to the page to /signup', function () {
        sinon.stub(account, 'isDefault', function () {
          return true;
        });

        sinon.spy(view, 'navigate');

        return view.beforeRender()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signup'));
          });
      });
    });

    describe('render', function () {
      it('shows the confirm-account-unlock view', function () {
        assert.ok($('#fxa-confirm-account-unlock-header').length);
      });
    });

    describe('afterVisible', function () {
      it('polls', function () {
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

        return view.afterVisible()
          .then(function () {
            assert.equal(fxaClient.signIn.callCount, 4);
          });
      });

      it('if caused by signin, notifies the broker when complete', function () {
        sinon.stub(fxaClient, 'signIn', function () {
          return p({
            sessionToken: 'newSessionToken'
          });
        });

        sinon.spy(broker, 'afterSignIn');

        return view.afterVisible()
          .then(function () {
            assert.isTrue(broker.afterSignIn.called);
          });
      });

      it('if not caused by signin, sets the success ephemeral message and navigates back a view', function () {
        ephemeralMessages.set('data', {
          account: account,
          lockoutSource: 'change_password'
        });

        initView();

        sinon.stub(fxaClient, 'signIn', function () {
          return p({
            sessionToken: 'newSessionToken'
          });
        });

        sinon.spy(broker, 'afterSignIn');
        sinon.spy(view, 'back');

        return view.afterVisible()
          .then(function () {
            assert.isFalse(broker.afterSignIn.called);
            assert.include(ephemeralMessages.get('success'), 'unlocked');
            assert.isTrue(view.back.called);
          });
      });

      it('if caused by a signin, redirects to `/account_unlock_complete` if broker does not halt', function () {
        sinon.stub(fxaClient, 'signIn', function () {
          return p({
            sessionToken: 'newSessionToken'
          });
        });

        sinon.stub(broker, 'afterSignIn', function () {
          return p();
        });

        sinon.spy(view, 'navigate');

        return view.afterVisible()
          .then(function () {
            assert.isTrue(broker.afterSignIn.called);
            assert.isTrue(view.navigate.calledWith('account_unlock_complete'));
          });
      });

      it('navigates back if the user typed in the wrong password', function () {
        sinon.stub(fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
        });

        sinon.spy(broker, 'afterSignIn');
        sinon.spy(view, 'back');

        return view.afterVisible()
          .then(function () {
            assert.isFalse(broker.afterSignIn.called);
            assert.isTrue(
                AuthErrors.is(ephemeralMessages.get('error'), 'INCORRECT_PASSWORD'));
            assert.isTrue(view.back.called);
          });
      });

      it('displays any other poll errors verbatim', function () {
        sinon.stub(fxaClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        return view.afterVisible()
          .then(function () {
            assert.isTrue(view.isErrorVisible());
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
