/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AccountLockedMixin = require('views/mixins/account-locked-mixin');
  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var Chai = require('chai');
  var Cocktail = require('cocktail');
  var FxaClient = require('lib/fxa-client');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/base');
  var sinon = require('sinon');
  var Template = require('stache!templates/test_template');
  var TestHelpers = require('../../../lib/helpers');
  var User = require('models/user');

  var assert = Chai.assert;

  var AccountLockedView = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(AccountLockedView, AccountLockedMixin);

  describe('views/mixins/account-locked-mixin', function () {
    var account;
    var fxaClient;
    var metrics;
    var notifier;
    var relier;
    var view;

    beforeEach(function () {
      account = new User().initAccount({
        email: 'testuser@testuser.com'
      });
      fxaClient = new FxaClient();
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();

      view = new AccountLockedView({
        fxaClient: fxaClient,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        viewName: 'delete-account'  // just an example name
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
        sinon.stub(view, 'getStringifiedResumeToken', function () {
          return 'resume token';
        });

        view.notifyOfLockedAccount(account);
        sinon.spy(view, 'navigate');
        return view.sendAccountLockedEmail()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('confirm_account_unlock'));
            assert.isTrue(fxaClient.sendAccountUnlockEmail.calledWith(
              'testuser@testuser.com',
              relier,
              {
                resume: 'resume token'
              }
            ));
          });
      });

      it('redirects to `/signup` if the account is unknown', function () {
        sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        view.notifyOfLockedAccount(account);
        sinon.spy(view, 'navigate');
        return view.sendAccountLockedEmail()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('signup'));
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

