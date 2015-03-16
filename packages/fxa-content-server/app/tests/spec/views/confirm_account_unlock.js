/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'lib/promise',
  'lib/session',
  'lib/auth-errors',
  'lib/metrics',
  'lib/fxa-client',
  'lib/ephemeral-messages',
  'views/confirm_account_unlock',
  'models/reliers/relier',
  'models/user',
  'models/auth_brokers/oauth',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, sinon, p, Session, AuthErrors, Metrics, FxaClient,
      EphemeralMessages, View, Relier, User, OAuthBroker, RouterMock,
      WindowMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('views/confirm_account_unlock', function () {
    var view;
    var routerMock;
    var windowMock;
    var metrics;
    var fxaClient;
    var relier;
    var broker;
    var user;
    var account;
    var ephemeralMessages;
    var EMAIL = 'testuser@testuser.com';

    function initView() {
      view = new View({
        router: routerMock,
        window: windowMock,
        metrics: metrics,
        fxaClient: fxaClient,
        relier: relier,
        broker: broker,
        user: user,
        ephemeralMessages: ephemeralMessages,
        screenName: 'confirm-account-unlock'
      });
      view.VERIFICATION_POLL_IN_MS = 10;
    }

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();

      metrics = new Metrics();
      relier = new Relier();
      fxaClient = new FxaClient();

      broker = new OAuthBroker({
        session: Session,
        window: windowMock,
        relier: relier
      });
      user = new User();

      account = user.initAccount({
        email: EMAIL
      });

      ephemeralMessages = new EphemeralMessages();
      ephemeralMessages.set('data', {
        lockoutSource: 'signin',
        account: account
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
        sinon.stub(account, 'isEmpty', function () {
          return true;
        });

        return view.beforeRender()
          .then(function () {
            assert.equal(routerMock.page, 'signup');
          });
      });
    });

    describe('render', function () {
      it('shows the confirm-account-unlock screen', function () {
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

      it('if not caused by signin, sets the success ephemeral message and navigates back a screen', function () {
        ephemeralMessages.set('data', {
          lockoutSource: 'change_password',
          account: account
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

        return view.afterVisible()
          .then(function () {
            assert.isTrue(broker.afterSignIn.called);
            assert.equal(routerMock.page, 'account_unlock_complete');
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

        return view.submit()
          .then(function () {
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'confirm-account-unlock.resend'));
            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'confirm-account-unlock.resend.success'));
            assert.isTrue(fxaClient.sendAccountUnlockEmail.calledWith(EMAIL));
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
