/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var Broker = require('models/auth_brokers/base');
  var chai = require('chai');
  var FormPrefill = require('models/form-prefill');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var SignInView = require('views/sign_in');
  var sinon = require('sinon');
  var TestHelpers = require('../../lib/helpers');
  var User = require('models/user');
  var View = require('views/force_auth');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('/views/force_auth', function () {
    var broker;
    var email;
    var formPrefill;
    var model;
    var notifier;
    var relier;
    var user;
    var view;
    var windowMock;

    function initDeps() {
      broker = new Broker();
      formPrefill = new FormPrefill();
      model = new Backbone.Model();
      notifier = new Notifier();
      relier = new Relier();
      user = new User({
        notifier: notifier
      });
      user.getSignedInAccount().set('uid', 'foo');
      windowMock = new WindowMock();

      view = new View({
        broker: broker,
        formPrefill: formPrefill,
        model: model,
        notifier: notifier,
        relier: relier,
        user: user,
        window: windowMock
      });
    }

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    describe('with missing email address', function () {
      beforeEach(function () {
        initDeps();
        return view.render();
      });

      it('prints an error message', function () {
        assert.include(view.$('.error').text(), 'requires an email');
      });
    });

    describe('with registered email', function () {
      beforeEach(function () {
        initDeps();
        formPrefill.set('password', 'password');

        email = TestHelpers.createEmail();
        relier.set('email', email);

        return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
      });

      describe('rendering', function () {
        it('does not print an error message', function () {
          assert.equal(view.$('.error').text(), '');
        });

        it('email input is hidden for the Firefox Password manager', function () {
          assert.equal(view.$('input[type=email]').hasClass('hidden'), 1);
        });

        it('prefills password', function () {
          assert.equal(view.$('input[type=password]').val(), 'password');
        });

        it('user cannot create an account', function () {
          assert.equal(view.$('a[href="/signup"]').length, 0);
        });
      });

      describe('avatar rendering', function () {
        describe('if there is not account', function () {
          beforeEach(function () {
            relier.set('email', 'a@a.com');

            sinon.stub(user, 'getAccountByEmail', function () {
              return user.initAccount();
            });

            return view.render()
              .then(function () {
                return view.afterVisible();
              });
          });

          it('does not show the profile image', function () {
            assert.lengthOf(view.$('.avatar-view img'), 0);
          });

          it('shows a placeholder instead', function () {
            assert.lengthOf(view.$('.avatar-view span'), 1);
          });
        });

        describe('if account.email and relier.email match', function () {
          beforeEach(function () {
            relier.set('email', 'a@a.com');
            var account = user.initAccount({
              email: 'a@a.com'
            });
            var imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

            sinon.stub(account, 'getAvatar', function () {
              return p({ avatar: imgUrl, id: 'foo' });
            });

            sinon.stub(user, 'getAccountByEmail', function () {
              return account;
            });

            return view.render()
              .then(function () {
                return view.afterVisible();
              });
          });

          it('shows the user\'s avatar', function () {
            assert.lengthOf(view.$('.avatar-view img'), 1);
          });
        });

        describe('if Session.email and relier.email do not match', function () {
          beforeEach(function () {
            relier.set('email', 'a@a.com');
            var account = user.initAccount({
              email: 'b@b.com'
            });

            sinon.stub(account, 'getAvatar', function () {
              return p({ avatar: 'avatar.jpg', id: 'foo' });
            });

            sinon.stub(user, 'getAccountByEmail', function () {
              return account;
            });

            return view.render()
              .then(function () {
                return view.afterVisible();
              });
          });

          it('shows no avatar', function () {
            assert.lengthOf(view.$('.avatar-view img'), 0);
          });
        });
      });

      describe('submit', function () {
        var password = 'password';

        beforeEach(function () {
          sinon.stub(view, '_signIn', function (account) {
            return p();
          });

          view.$('input[type=password]').val(password);

          return view.submit();
        });

        it('calls view._signIn with the expected data', function () {
          var account = view._signIn.args[0][0];
          assert.equal(account.get('email'), email);
          var signInPassword = view._signIn.args[0][1];
          assert.equal(signInPassword, password);
        });
      });

      describe('onSignInSuccess', function () {
        var account;

        beforeEach(function () {
          account = user.initAccount({
            email: 'testuser@testuser.com',
            verified: true
          });

          sinon.spy(broker, 'afterForceAuth');
          sinon.spy(view, 'navigate');
        });

        describe('without model.redirectTo', function () {
          beforeEach(function () {
            return view.onSignInSuccess(account);
          });

          it('invokes `afterForceAuth` on the broker', function () {
            assert.isTrue(broker.afterForceAuth.calledWith(account));
          });

          it('navigates to the `settings` page and clears the query parameters', function () {
            assert.isTrue(view.navigate.calledWith('settings', {}, { clearQueryParams: true }));
          });
        });

        describe('with model.redirectTo', function () {
          beforeEach(function () {
            model.set('redirectTo', 'foo');

            return view.onSignInSuccess(account);
          });

          it('invokes `afterForceAuth` on the broker', function () {
            assert.isTrue(broker.afterForceAuth.calledWith(account));
          });

          it('navigates to the `settings` page and clears the query parameters', function () {
            assert.isTrue(view.navigate.calledWith('foo', {}, { clearQueryParams: true }));
          });
        });
      });

      describe('onSignInError', function () {
        var account;
        var err;

        beforeEach(function () {
          account = user.initAccount({
            email: 'testuser@testuser.com'
          });
        });

        describe('all other errors', function () {
          beforeEach(function () {
            err = AuthErrors.toError('UNEXPECTED_ERROR');

            sinon.stub(SignInView.prototype, 'onSignInError', sinon.spy());

            view.onSignInError(account, 'password', err);
          });

          afterEach(function () {
            SignInView.prototype.onSignInError.restore();
          });

          it('are delegated to the prototype', function () {
            assert.isTrue(
              SignInView.prototype.onSignInError.calledWith(
                account, 'password', err));
          });
        });
      });

      it('isValid is successful when the password is filled out', function () {
        $('.password').val('password');
        assert.isTrue(view.isValid());
      });

      describe('resetPasswordNow', function () {
        var passwordForgotToken = 'foo';

        beforeEach(function () {
          sinon.stub(view, 'resetPassword', function () {
            return p({ passwordForgotToken: passwordForgotToken });
          });

          relier.set('email', email);

          return view.resetPasswordNow();
        });

        it('delegates to `resetPassword` with the correct email address', function () {
          assert.isTrue(view.resetPassword.calledWith(email));
        });

        it('allows only one forget password request at a time', function () {
          view.resetPasswordNow();
          return view.resetPasswordNow()
            .then(assert.fail, function (err) {
              assert.equal(err.message, 'submit already in progress');
            });
        });
      });

    });

    describe('with unregistered email', function () {
      beforeEach(function () {
        initDeps();
        email = TestHelpers.createEmail();
        relier.set('email', email);

        return view.render()
          .then(function () {
            view.$('input[type=password]').val('password');
          });
      });

      describe('submit', function () {
        beforeEach(function () {
          sinon.stub(user, 'signInAccount', function () {
            return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          sinon.spy(view, 'displayError');

          return view.submit();
        });

        it('prints an error message and does not allow the user to sign up', function () {
          assert.isTrue(view.displayError.called);
          var err = view.displayError.args[0][0];
          assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
          // no link to sign up.
          assert.equal(view.$('.error').find('a').length, 0);
        });
      });

      describe('resetPasswordNow', function () {
        beforeEach(function () {
          sinon.stub(view, 'resetPassword', function () {
            return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          sinon.spy(view, 'displayError');

          relier.set('email', email);

          return view.resetPasswordNow();
        });

        it('prints an error message and does not allow the user to sign up', function () {
          assert.isTrue(view.displayError.called);
          var err = view.displayError.args[0][0];
          assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
          // no link to sign up.
          assert.equal(view.$('.error').find('a').length, 0);
        });
      });
    });

    describe('beforeDestroy', function () {
      beforeEach(function () {
        initDeps();

        relier.set('email', TestHelpers.createEmail());

        return view.render()
          .then(function () {
            view.$('.password').val('password');
            view.beforeDestroy();
          });
      });

      it('saves the form info to formPrefill', function () {
        assert.equal(formPrefill.get('password'), 'password');
      });
    });
  });
});
