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
      beforeEach(function () {
        sinon.spy(view, 'displayErrorUnsafe');

        view.notifyOfLockedAccount(account, 'password');
      });

      it('displays an error with a `send unlock email` link', function () {
        assert.isTrue(view.displayErrorUnsafe.called);
        var err = view.displayErrorUnsafe.args[0][0];
        assert.isTrue(AuthErrors.is(err, 'ACCOUNT_LOCKED'));

        assert.include(view.$('.error').html(), '/confirm_account_unlock');
      });
    });

    describe('sendAccountLockedEmail', function () {
      describe('with a registered account', function () {
        beforeEach(function () {
          sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
            return p();
          });

          sinon.stub(view, 'getStringifiedResumeToken', function () {
            return 'resume token';
          });

          view.notifyOfLockedAccount(account, 'password');
          sinon.spy(view, 'navigate');
          return view.sendAccountLockedEmail();
        });

        it('sends an unlock email', function () {
          assert.isTrue(fxaClient.sendAccountUnlockEmail.calledWith(
            'testuser@testuser.com',
            relier,
            {
              resume: 'resume token'
            }
          ));
        });

        it('logs expected events', function () {
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'delete-account.unlock-email.send'));
          assert.isTrue(TestHelpers.isEventLogged(metrics, 'delete-account.unlock-email.send.success'));
        });

        it('redirects to `/confirm_account_unlock', function () {
          assert.isTrue(view.navigate.calledWith('confirm_account_unlock'));
          // TODO check for account and password sent in data
        });
      });

      describe('with an unknown account', function () {
        beforeEach(function () {
          sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
            return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          view.notifyOfLockedAccount(account, 'password');
          sinon.spy(view, 'navigate');
          return view.sendAccountLockedEmail();
        });

        it('redirects to the `/signup` page', function () {
          assert.isTrue(view.navigate.calledWith('signup'));
        });
      });

      describe('with errors', function () {
        beforeEach(function () {
          sinon.stub(fxaClient, 'sendAccountUnlockEmail', function () {
            return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          view.notifyOfLockedAccount(account, 'password');
          return view.sendAccountLockedEmail();
        });

        it('displays the errors', function () {
          assert.isTrue(view.isErrorVisible());
        });
      });
    });
  });
});

