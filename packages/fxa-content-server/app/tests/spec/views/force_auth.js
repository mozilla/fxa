/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Account = require('models/account');
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

    var isEmailRegistered;
    var isUidRegistered;

    function initDeps() {
      broker = new Broker();
      email = TestHelpers.createEmail();
      formPrefill = new FormPrefill();
      model = new Backbone.Model();
      notifier = new Notifier();
      relier = new Relier();
      user = new User({
        notifier: notifier
      });
      user.getSignedInAccount().set('uid', 'foo');

      isEmailRegistered = isUidRegistered = false;

      sinon.stub(user, 'checkAccountEmailExists', function () {
        return p(isEmailRegistered);
      });

      sinon.stub(user, 'checkAccountUidExists', function () {
        return p(isUidRegistered);
      });

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

      sinon.spy(view, 'navigate');
      sinon.spy(view, 'fatalError');
    }

    beforeEach(function () {
      initDeps();

      relier.set('email', email);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    describe('render', function () {
      describe('with a missing email address', function () {
        beforeEach(function () {
          relier.unset('email');

          return view.render();
        });

        it('delegates to fatalError', function () {
          assert.isTrue(view.fatalError.called);
        });
      });

      describe('with an invalid email address', function () {
        beforeEach(function () {
          relier.set('email', 'not an email');

          return view.render();
        });

        it('delegates to fatalError', function () {
          assert.isTrue(view.fatalError.called);
        });
      });

      describe('with an invalid uid', function () {
        beforeEach(function () {
          relier.set('uid', 'invalid uid');

          return view.render();
        });

        it('delegates to fatalError', function () {
          assert.isTrue(view.fatalError.called);
        });
      });

      describe('with registered email, no uid', function () {
        beforeEach(function () {
          isEmailRegistered = true;

          return view.render();
        });

        it('does not navigate', function () {
          assert.isFalse(view.navigate.called);
        });

        it('does not error', function () {
          assert.lengthOf(view.$('.error.visible'), 0);
        });
      });

      describe('with registered email, registered uid', function () {
        beforeEach(function () {
          relier.set({
            uid: TestHelpers.createUid()
          });

          isEmailRegistered = isUidRegistered = true;

          return view.render();
        });

        it('does not navigate', function () {
          assert.isFalse(view.navigate.called);
        });

        it('does not error', function () {
          assert.lengthOf(view.$('.error.visible'), 0);
        });
      });

      describe('with registered email, unregistered uid', function () {
        beforeEach(function () {
          relier.set({
            uid: TestHelpers.createUid()
          });

          isEmailRegistered = true;
        });

        describe('broker supports UID change', function () {
          beforeEach(function () {
            broker.setCapability('allowUidChange', true);
            return view.render();
          });

          it('does not navigate', function () {
            assert.isFalse(view.navigate.called);
          });

          it('does not error', function () {
            assert.lengthOf(view.$('.error.visible'), 0);
          });
        });

        describe('broker does not support UID change', function () {
          beforeEach(function () {
            broker.unsetCapability('allowUidChange');
            return view.render();
          });

          it('does not navigate', function () {
            assert.isFalse(view.navigate.called);
          });

          it('errors', function () {
            assert.lengthOf(view.$('.error.visible'), 1);
          });
        });
      });

      describe('with unregistered email, no uid', function () {
        beforeEach(function () {
          isEmailRegistered = false;
          return view.render();
        });

        it('navigates to signup', function () {
          testNavigatesToForceSignUp(view, email);
        });
      });

      describe('with unregistered email, registered uid', function () {
        beforeEach(function () {
          relier.set({
            uid: TestHelpers.createUid()
          });

          isEmailRegistered = false;
          isUidRegistered = true;
        });

        describe('broker supports UID change', function () {
          beforeEach(function () {
            broker.setCapability('allowUidChange', true);
            return view.render();
          });


          it('navigates to signup', function () {
            testNavigatesToForceSignUp(view, email);
          });
        });

        describe('broker does not support UID change', function () {
          beforeEach(function () {
            broker.unsetCapability('allowUidChange');
            return view.render();
          });

          it('does not navigate', function () {
            assert.isFalse(view.navigate.called);
          });

          it('errors', function () {
            assert.lengthOf(view.$('.error.visible'), 1);
          });
        });
      });

      describe('with unregistered email, unregistered uid', function () {
        beforeEach(function () {
          relier.set({
            uid: TestHelpers.createUid()
          });

          isEmailRegistered = isUidRegistered = false;
        });

        describe('broker supports UID change', function () {
          beforeEach(function () {
            broker.setCapability('allowUidChange', true);
            return view.render();
          });

          it('navigates to signup', function () {
            testNavigatesToForceSignUp(view, email);
          });
        });

        describe('broker does not support UID change', function () {
          beforeEach(function () {
            broker.unsetCapability('allowUidChange');
            return view.render();
          });

          it('does not navigate', function () {
            assert.isFalse(view.navigate.called);
          });

          it('errors', function () {
            assert.lengthOf(view.$('.error.visible'), 1);
          });
        });
      });

      describe('with form prefill', function () {
        beforeEach(function () {
          formPrefill.set('password', 'password');

          isEmailRegistered = true;

          return view.render();
        });

        it('prefills password', function () {
          assert.equal(view.$('input[type=password]').val(), 'password');
        });
      });

      describe('email registered behaviors', function () {
        beforeEach(function () {
          isEmailRegistered = true;

          sinon.spy(view, 'displayAccountProfileImage');

          return view.render()
            .then(function () {
              view.afterVisible();
            });
        });

        it('email input is hidden for the Firefox Password manager', function () {
          assert.equal(view.$('input[type=email]').hasClass('hidden'), 1);
        });

        it('user cannot create an account', function () {
          assert.equal(view.$('a[href="/signup"]').length, 0);
        });

        it('delegates to `displayAccountProfileImage` with the correct email', function () {
          assert.isTrue(view.displayAccountProfileImage.called);

          var account = view.displayAccountProfileImage.args[0][0];
          assert.instanceOf(account, Account);

          var options = view.displayAccountProfileImage.args[0][1];
          assert.isTrue(options.spinner);
        });

        it('isValid is successful when the password is filled out', function () {
          view.$('.password').val('password');
          assert.isTrue(view.isValid());
        });
      });
    });

    describe('submit', function () {
      var password = 'password';

      beforeEach(function () {
        sinon.stub(view, '_signIn', function (account) {
          return p();
        });


        return view.render()
          .then(function () {
            view.$('input[type=password]').val(password);

            return view.submit();
          });
      });

      it('calls view._signIn with the expected data', function () {
        var account = view._signIn.args[0][0];
        assert.equal(account.get('email'), email);

        var signInPassword = view._signIn.args[0][1];
        assert.equal(signInPassword, password);
      });

      describe('onSignInSuccess', function () {
        var account;

        beforeEach(function () {
          account = user.initAccount({
            email: 'testuser@testuser.com',
            verified: true
          });

          sinon.spy(broker, 'afterForceAuth');
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
    });

    describe('onSignInError', function () {
      var account;
      var err;

      beforeEach(function () {
        account = user.initAccount({
          email: email
        });
      });

      describe('account was deleted after page load', function () {
        beforeEach(function () {
          err = AuthErrors.toError('UNKNOWN_ACCOUNT');

          sinon.stub(SignInView.prototype, 'onSignInError', sinon.spy());
        });

        afterEach(function () {
          SignInView.prototype.onSignInError.restore();
        });

        describe('uid specified', function () {
          beforeEach(function () {
            relier.set('uid', 'uid');
          });

          describe('broker supports UID change', function () {
            beforeEach(function () {
              broker.setCapability('allowUidChange', true);

              return view.onSignInError(account, 'password', err);
            });

            it('navigates to `signup` with expected data', function () {
              var args = view.navigate.args[0];
              assert.equal(args[0], 'signup');

              var navigateData = args[1];
              assert.isTrue(AuthErrors.is(navigateData.error, 'DELETED_ACCOUNT'));
              assert.equal(navigateData.forceEmail, email);
            });
          });

          describe('brokers does not support UID change', function () {
            beforeEach(function () {
              broker.unsetCapability('allowUidChange');

              sinon.spy(view, 'displayError');

              return view.onSignInError(account, 'password', err);
            });

            it('prints an error message and does not allow the user to sign up', function () {
              assert.isTrue(view.displayError.called);
              var err = view.displayError.args[0][0];
              assert.isTrue(AuthErrors.is(err, 'DELETED_ACCOUNT'));
              // no link to sign up.
              assert.equal(view.$('.error').find('a').length, 0);
            });
          });
        });

        describe('no uid specified', function () {
          beforeEach(function () {
            relier.unset('uid');

            return view.onSignInError(account, 'password', err);
          });

          it('navigates to `signup` with expected data', function () {
            var args = view.navigate.args[0];
            assert.equal(args[0], 'signup');

            var navigateData = args[1];
            assert.isTrue(AuthErrors.is(navigateData.error, 'DELETED_ACCOUNT'));
            assert.equal(navigateData.forceEmail, email);
          });
        });
      });

      describe('all other errors', function () {
        beforeEach(function () {
          err = AuthErrors.toError('UNEXPECTED_ERROR');

          sinon.stub(SignInView.prototype, 'onSignInError', sinon.spy());

          return view.onSignInError(account, 'password', err);
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

    describe('_navigateToForceResetPassword', function () {
      beforeEach(function () {
        return view._navigateToForceResetPassword();
      });

      it('navigates to `/reset_password` with the expected email', function () {
        assert.isTrue(view.navigate.calledWith('reset_password', {
          forceEmail: email
        }));
      });
    });

    describe('password visibility', function () {
      beforeEach(function () {
        isEmailRegistered = true;

        return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
      });

      describe('clicking the show button', function () {
        it('toggles the password visibility state', function () {
          view.$('.show-password').click();
          assert.equal(view.$('#password').attr('type'), 'text');

          view.$('#show-password').click();
          assert.equal(view.$('#password').attr('type'), 'password');
        });
      });
    });

    describe('beforeDestroy', function () {
      beforeEach(function () {
        isEmailRegistered = true;

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

  function testNavigatesToForceSignUp(view, email) {
    assert.isTrue(view.navigate.called);

    var url = view.navigate.args[0][0];
    assert.equal(url, 'signup');

    var navigateData = view.navigate.args[0][1];
    assert.isTrue(AuthErrors.is(navigateData.error, 'DELETED_ACCOUNT'));
    assert.equal(navigateData.forceEmail, email);
  }
});
