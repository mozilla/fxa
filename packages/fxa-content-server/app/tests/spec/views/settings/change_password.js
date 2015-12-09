/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AuthErrors = require('lib/auth-errors');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var EphemeralMessages = require('lib/ephemeral-messages');
  var Metrics = require('lib/metrics');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var TestHelpers = require('../../../lib/helpers');
  var User = require('models/user');
  var View = require('views/settings/change_password');

  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/settings/change_password', function () {
    var account;
    var broker;
    var ephemeralMessages;
    var metrics;
    var relier;
    var user;
    var view;

    beforeEach(function () {
      ephemeralMessages = new EphemeralMessages();
      metrics = new Metrics();
      relier = new Relier();

      broker = new Broker({
        relier: relier
      });

      user = new User({});

      view = new View({
        broker: broker,
        ephemeralMessages: ephemeralMessages,
        metrics: metrics,
        relier: relier,
        user: user
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
    });

    describe('with session', function () {
      beforeEach(function () {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'abc123',
          verified: true
        });
        sinon.stub(account, 'isSignedIn', function () {
          return p(true);
        });

        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });

        return view.render()
          .then(function () {
            $('body').append(view.el);
          });
      });

      describe('render', function () {
        it('renders properly', function () {
          assert.ok($('#old_password').length);
          assert.ok($('.reset-password').length);
          assert.ok($('#new_password').length);
          assert.isTrue($('.input-help').length === 2);
        });
      });

      describe('isValid', function () {
        it('returns true if both old and new passwords are valid and different', function () {
          $('#old_password').val('password');
          $('#new_password').val('password2');

          assert.equal(view.isValid(), true);
        });

        it('returns true if both old and new passwords are valid and the same', function () {
          $('#old_password').val('password');
          $('#new_password').val('password');

          assert.equal(view.isValid(), true);
        });

        it('returns false if old password is too short', function () {
          $('#old_password').val('passwor');
          $('#new_password').val('password');

          assert.equal(view.isValid(), false);
        });

        it('returns false if new password is too short', function () {
          $('#old_password').val('password');
          $('#new_password').val('passwor');

          assert.equal(view.isValid(), false);
        });
      });

      describe('showValidationErrors', function () {
        it('shows an error if the password is invalid', function (done) {
          view.$('#old_password').val('passwor');
          view.$('#new_password').val('password');

          view.on('validation_error', function (which, msg) {
            wrapAssertion(function () {
              assert.ok(msg);
            }, done);
          });

          view.showValidationErrors();
        });

        it('shows an error if the new_password is invalid', function (done) {
          view.$('#old_password').val('password');
          view.$('#new_password').val('passwor');

          view.on('validation_error', function (which, msg) {
            wrapAssertion(function () {
              assert.ok(msg);
            }, done);
          });

          view.showValidationErrors();
        });
      });

      describe('submit', function () {
        it('prints returned error messages', function () {
          $('#old_password').val('bad_password');
          $('#new_password').val('bad_password');

          sinon.stub(user, 'changeAccountPassword', function () {
            return p.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
          });

          return view.submit()
            .then(assert.fail, function (err) {
              assert.isTrue(AuthErrors.is(err, 'INCORRECT_PASSWORD'));
            });
        });

        it('shows error message to locked out users', function () {
          sinon.stub(user, 'changeAccountPassword', function () {
            return p.reject(AuthErrors.toError('ACCOUNT_LOCKED'));
          });

          $('#old_password').val('password');
          $('#new_password').val('new_password');

          return view.submit()
            .then(function () {
              assert.isTrue(view.isErrorVisible());
              assert.include(view.$('.error').text().toLowerCase(), 'locked');

              var err = view._normalizeError(AuthErrors.toError('ACCOUNT_LOCKED'));
              assert.isTrue(TestHelpers.isErrorLogged(metrics, err));

              assert.isTrue(account.has('password'));
            });
        });

        it('redirects user to /settings on success', function () {
          var oldPassword = 'password';
          var newPassword = 'new_password';
          $('#old_password').val(oldPassword);
          $('#new_password').val(newPassword);

          sinon.stub(user, 'changeAccountPassword', function () {
            return p({});
          });

          sinon.stub(view, 'navigate', function () { });
          sinon.stub(view, 'displaySuccess', function () { });

          sinon.spy(broker, 'afterChangePassword');

          return view.submit()
            .then(function () {
              assert.equal(view.navigate.args[0][0], 'settings');
              assert.isTrue(view.displaySuccess.called);
              assert.isTrue(user.changeAccountPassword.calledWith(
                  account, oldPassword, newPassword));
              assert.isTrue(broker.afterChangePassword.calledWith(account));
            });
        });
      });
    });
  });
});
