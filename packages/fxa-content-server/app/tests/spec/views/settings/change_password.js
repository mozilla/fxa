/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/base');
  const chai = require('chai');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const TestHelpers = require('../../../lib/helpers');
  const User = require('models/user');
  const View = require('views/settings/change_password');

  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  const EMAIL = 'a@a.com';

  describe('views/settings/change_password', function () {
    var account;
    var broker;
    var model;
    var metrics;
    var notifier;
    var relier;
    var user;
    var view;

    beforeEach(function () {
      model = new Backbone.Model();
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      relier = new Relier();

      broker = new Broker({
        relier: relier
      });

      user = new User({});

      view = new View({
        broker: broker,
        metrics: metrics,
        model: model,
        notifier,
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
          email: EMAIL,
          sessionToken: 'abc123',
          verified: true
        });
        sinon.stub(account, 'isSignedIn').callsFake(function () {
          return Promise.resolve(true);
        });

        sinon.stub(view, 'getSignedInAccount').callsFake(function () {
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
          assert.isTrue($('.input-help-forgot-pw').length === 1);
          assert.equal(view.$('input[type=email]').val(), EMAIL);
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
        describe('success', function () {
          var oldPassword = 'password';
          var newPassword = 'new_password';

          beforeEach(function () {
            $('#old_password').val(oldPassword);
            $('#new_password').val(newPassword);

            sinon.stub(user, 'changeAccountPassword').callsFake(function () {
              return Promise.resolve({});
            });

            sinon.stub(view, 'navigate').callsFake(function () { });
            sinon.stub(view, 'displaySuccess').callsFake(function () { });

            sinon.spy(broker, 'afterChangePassword');

            return view.submit();
          });

          it('delegates to the user to change the password', function () {
            assert.isTrue(user.changeAccountPassword.calledWith(
                account, oldPassword, newPassword, relier));
          });

          it('informs the broker', function () {
            assert.isTrue(broker.afterChangePassword.calledWith(account));
          });

          it('redirects to the `/settings` screen', function () {
            assert.equal(view.navigate.args[0][0], 'settings');
          });

          it('displays a success message', function () {
            assert.isTrue(view.displaySuccess.called);
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.change-password.success'));
          });
        });

        describe('error', function () {

          beforeEach(function () {
            $('#old_password').val('bad_password');
            $('#new_password').val('bad_password');

            sinon.stub(user, 'changeAccountPassword').callsFake(function () {
              return Promise.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
            });

            sinon.stub(view, 'showValidationError').callsFake(function () { });
            return view.submit();
          });

          it('display an error message', function () {
            assert.isTrue(view.showValidationError.called);
          });
        });

        describe('error', function () {

          beforeEach(function () {
            $('#old_password').val('password');
            $('#new_password').val('password');

            sinon.stub(user, 'changeAccountPassword').callsFake(function () {
              return Promise.reject(AuthErrors.toError('PASSWORDS_MUST_BE_DIFFERENT'));
            });

            sinon.stub(view, 'showValidationError').callsFake(function () { });
            return view.submit();
          });

          it('display an error message', function () {
            assert.isTrue(view.showValidationError.called);
          });
        });
      });
    });
  });
});
