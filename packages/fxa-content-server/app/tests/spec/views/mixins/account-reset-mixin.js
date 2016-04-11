/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AccountResetMixin = require('views/mixins/account-reset-mixin');
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
  var User = require('models/user');

  var assert = Chai.assert;

  var EMAIL = 'testuser@testuser.com';

  var AccountResetView = BaseView.extend({
    template: Template,
    resetPassword: function () {
      return p();
    }
  });
  Cocktail.mixin(AccountResetView, AccountResetMixin);

  describe('views/mixins/account-reset-mixin', function () {
    var account;
    var fxaClient;
    var metrics;
    var notifier;
    var relier;
    var session;
    var view;

    beforeEach(function () {
      account = new User().initAccount({
        email: EMAIL
      });

      fxaClient = new FxaClient();
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();
      session = {
        clear: sinon.spy()
      };

      view = new AccountResetView({
        fxaClient: fxaClient,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        session: session,
        viewName: 'delete-account'  // just an example name
      });

      return view.render();
    });

    describe('notifyOfResetAccount', function () {
      beforeEach(function () {
        sinon.spy(view, 'displayErrorUnsafe');

        view.notifyOfResetAccount(account);
      });

      it('displays an error with a `send reset email` link', function () {
        assert.isTrue(view.displayErrorUnsafe.called);
        var err = view.displayErrorUnsafe.args[0][0];
        assert.isTrue(AuthErrors.is(err, 'ACCOUNT_RESET'));

        assert.include(view.$('.error').html(), '/confirm_reset_password');
      });
    });

    describe('sendAccountResetEmail', function () {
      describe('with a registered account', function () {
        beforeEach(function () {
          sinon.stub(view, 'resetPassword', function () {
            return p();
          });

          view.notifyOfResetAccount(account);
          return view.sendAccountResetEmail();
        });

        it('sends a reset email', function () {
          assert.isTrue(view.resetPassword.calledWith(EMAIL));
        });
      });

      describe('with an error', function () {
        beforeEach(function () {
          sinon.stub(view, 'resetPassword', function () {
            return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          view.notifyOfResetAccount(account, 'password');
          return view.sendAccountResetEmail();
        });

        it('displays the error', function () {
          assert.isTrue(view.isErrorVisible());
        });

        it('clears session.oauth', function () {
          assert.isTrue(session.clear.calledWith('oauth'));
        });
      });
    });
  });
});

