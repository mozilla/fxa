/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'cocktail',
  'sinon',
  'models/user',
  'lib/fxa-client',
  'lib/promise',
  'lib/auth-errors',
  'lib/metrics',
  'views/mixins/account-locked-mixin',
  'views/base',
  'stache!templates/test_template',
  '../../../mocks/router',
  '../../../lib/helpers'
], function (Chai, Cocktail, sinon, User, FxaClient, p, AuthErrors,
    Metrics, AccountLockedMixin, BaseView, Template, RouterMock, TestHelpers) {
  var assert = Chai.assert;

  var AccountLockedView = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(AccountLockedView, AccountLockedMixin);

  describe('views/mixins/account-locked-mixin', function () {
    var view;
    var routerMock;
    var fxaClient;
    var account;
    var metrics;

    beforeEach(function () {
      routerMock = new RouterMock();
      fxaClient = new FxaClient();

      account = new User().initAccount({
        email: 'testuser@testuser.com'
      });

      metrics = new Metrics();

      view = new AccountLockedView({
        router: routerMock,
        fxaClient: fxaClient,
        metrics: metrics,
        screenName: 'delete-account'  // just an example name
      });
      return view.render();
    });

    describe('notifyOfLockedAccount', function () {
      it('displays an error with a `send unlock email` link, logs error', function () {
        view.notifyOfLockedAccount(account);

        assert.isTrue(view.isErrorVisible());
        assert.include(view.$('.error').text(), 'unlock');

        var err = view._normalizeError(AuthErrors.toError('ACCOUNT_LOCKED'));
        assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
      });
    });

    describe('sendAccountLockedEmail', function () {
      it('sends an unlock email and redirects to `/confirm_account_unlock`', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p();
        });

        view.notifyOfLockedAccount(account);
        return view.sendAccountLockedEmail()
          .then(function () {
            assert.equal(routerMock.page, 'confirm_account_unlock');
          });
      });

      it('redirects to `/signup` if the account is unknown', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        view.notifyOfLockedAccount(account);
        return view.sendAccountLockedEmail()
          .then(function () {
            assert.equal(routerMock.page, 'signup');
          });
      });

      it('displays all other errors', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        view.notifyOfLockedAccount(account);
        return view.sendAccountLockedEmail()
          .then(function () {
            assert.isTrue(view.isErrorVisible());
          });
      });

      it('logs expected events to metrics', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p();
        });

        view.notifyOfLockedAccount(account);
        return view.sendAccountLockedEmail()
          .then(function () {
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'delete-account.unlock-email.send'));
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'delete-account.unlock-email.send.success'));
          });
      });
    });
  });
});

