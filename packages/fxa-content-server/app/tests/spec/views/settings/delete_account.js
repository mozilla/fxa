/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AuthErrors = require('lib/auth-errors');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var KeyCodes = require('lib/key-codes');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var NullChannel = require('lib/channels/null');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var TestHelpers = require('../../../lib/helpers');
  var User = require('models/user');
  var View = require('views/settings/delete_account');

  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/settings/delete_account', function () {
    var UID = '123';
    var account;
    var broker;
    var email;
    var metrics;
    var notifier;
    var password = 'password';
    var relier;
    var tabChannelMock;
    var user;
    var view;

    beforeEach(function () {
      metrics = new Metrics();
      relier = new Relier();
      tabChannelMock = new NullChannel();
      user = new User();

      broker = new Broker({
        relier: relier
      });

      notifier = new Notifier({
        tabChannel: tabChannelMock
      });

      view = new View({
        broker: broker,
        metrics: metrics,
        notifier: notifier,
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
        email = TestHelpers.createEmail();

        account = user.initAccount({
          email: email,
          sessionToken: 'abc123',
          uid: UID,
          verified: true
        });
        sinon.stub(account, 'isSignedIn', function () {
          return p(true);
        });

        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });
        sinon.spy(notifier, 'trigger', function () { });

        return view.render()
          .then(function () {
            $('body').append(view.el);
          });
      });

      describe('isValid', function () {
        it('returns true if password is filled out', function () {
          $('form input[type=password]').val(password);

          assert.equal(view.isValid(), true);
        });

        it('returns false if password is too short', function () {
          $('form input[type=password]').val('passwor');

          assert.equal(view.isValid(), false);
        });
      });

      describe('showValidationErrors', function () {
        it('shows an error if the password is invalid', function (done) {
          view.$('[type=email]').val('testuser@testuser.com');
          view.$('[type=password]').val('passwor');

          view.on('validation_error', function (which, msg) {
            wrapAssertion(function () {
              assert.ok(msg);
            }, done);
          });

          view.showValidationErrors();
        });
      });

      it('has floating labels on input', function () {
        view.$('#password').val('a');
        var event = new $.Event('input');
        event.which = KeyCodes.ENTER;

        assert.isFalse(view.$('.label-helper').text().length > 0);
        view.$('#password').trigger(event);
        assert.isTrue(view.$('.label-helper').text().length > 0);
      });

      describe('submit', function () {
        beforeEach(function () {
          $('form input[type=email]').val(email);
          $('form input[type=password]').val(password);
        });

        describe('success', function () {
          beforeEach(function () {
            sinon.stub(user, 'deleteAccount', function () {
              return p();
            });

            sinon.spy(broker, 'afterDeleteAccount');
            sinon.spy(view, 'logViewEvent');
            sinon.spy(view, 'navigate');

            return view.submit();
          });

          it('deletes the users account', function () {
            assert.isTrue(user.deleteAccount.calledOnce);
            assert.isTrue(user.deleteAccount.calledWith(account));
          });

          it('notifies the broker', function () {
            assert.isTrue(broker.afterDeleteAccount.calledOnce);
            assert.isTrue(broker.afterDeleteAccount.calledWith(account));
          });

          it('redirects to signup, clearing query params', function () {
            assert.equal(view.navigate.args[0][0], 'signup');

            assert.isTrue(view.navigate.args[0][1].clearQueryParams);
            assert.ok(view.navigate.args[0][1].success);
          });

          it('logs success', function () {
            assert.isTrue(view.logViewEvent.calledOnce);
            assert.isTrue(view.logViewEvent.calledWith('deleted'));
          });
        });

        describe('locked out user', function () {
          beforeEach(function () {
            sinon.stub(user, 'deleteAccount', function () {
              return p.reject(AuthErrors.toError('ACCOUNT_LOCKED'));
            });

            return view.submit();
          });

          it('shows error message to locked out users', function () {
            assert.isTrue(view.isErrorVisible());
            assert.include(view.$('.error').text().toLowerCase(), 'locked');
          });

          it('logs the error', function () {
            var err = view._normalizeError(AuthErrors.toError('ACCOUNT_LOCKED'));
            assert.isTrue(TestHelpers.isErrorLogged(metrics, err));
          });

          it('retains the password in the account to poll for account unlock', function () {
            assert.isTrue(account.has('password'));
          });
        });

        describe('other errors', function () {
          beforeEach(function () {
            sinon.stub(user, 'deleteAccount', function () {
              return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
            });
          });

          it('are re-thrown', function () {
            return view.submit()
              .then(assert.fail, function (err) {
                assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
              });
          });
        });
      });

    });
  });
});
