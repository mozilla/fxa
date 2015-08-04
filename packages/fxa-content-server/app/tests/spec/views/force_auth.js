/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'views/force_auth',
  'lib/fxa-client',
  'lib/promise',
  'lib/auth-errors',
  'models/reliers/relier',
  'models/auth_brokers/base',
  'models/user',
  'models/form-prefill',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, View, FxaClient, p, AuthErrors, Relier, Broker,
      User, FormPrefill, WindowMock, RouterMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('/views/force_auth', function () {
    var email;
    var view;
    var router;
    var windowMock;
    var fxaClient;
    var relier;
    var broker;
    var user;
    var formPrefill;

    function initDeps() {
      windowMock = new WindowMock();
      relier = new Relier();
      broker = new Broker();
      fxaClient = new FxaClient();
      user = new User();
      router = new RouterMock();
      formPrefill = new FormPrefill();

      view = new View({
        window: windowMock,
        fxaClient: fxaClient,
        user: user,
        relier: relier,
        broker: broker,
        router: router,
        formPrefill: formPrefill
      });
    }

    afterEach(function () {
      view.remove();
      view.destroy();
      router = view = null;
    });

    describe('missing email address', function () {
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

      describe('submit', function () {
        it('is able to submit the form on click', function (done) {
          sinon.stub(user, 'signInAccount', function () {
            done();
          });
          view.$('#submit-btn').click();
        });

        it('submits the sign in', function () {
          var password = 'password';
          sinon.stub(user, 'signInAccount', function (account) {
            account.set('verified', true);
            return p(account);
          });
          view.$('input[type=password]').val(password);

          return view.submit()
            .then(function () {
              assert.equal(user.signInAccount.args[0][0].get('email'), email);
              assert.equal(user.signInAccount.args[0][0].get('password'), password);
            });
        });
      });

      it('does not print an error message', function () {
        assert.equal(view.$('.error').text(), '');
      });

      it('does not allow the email to be edited', function () {
        assert.equal(view.$('input[type=email]').length, 0);
      });

      it('prefills password', function () {
        assert.equal(view.$('input[type=password]').val(), 'password');
      });

      it('user cannot create an account', function () {
        assert.equal(view.$('a[href="/signup"]').length, 0);
      });

      it('isValid is successful when the password is filled out', function () {
        $('.password').val('password');
        assert.isTrue(view.isValid());
      });

      it('forgot password request redirects directly to confirm_reset_password', function () {
        var passwordForgotToken = 'foo';
        sinon.stub(view.fxaClient, 'passwordReset', function () {
          return p({ passwordForgotToken: passwordForgotToken });
        });
        sinon.stub(view, 'getStringifiedResumeToken', function () {
          return 'resume token';
        });

        relier.set('email', email);

        return view.resetPasswordNow()
          .then(function () {

            assert.equal(router.page, 'confirm_reset_password');
            assert.equal(view.ephemeralMessages.get('data').passwordForgotToken, passwordForgotToken);
            assert.isTrue(view.fxaClient.passwordReset.calledWith(
              email,
              relier,
              {
                resume: 'resume token'
              }
            ));
          });
      });

      it('only one forget password request at a time', function () {
        var event = $.Event('click');

        view.resetPasswordNow(event);
        return view.resetPasswordNow(event)
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'submit already in progress');
          });
      });

      it('shows no avatar if there is no account', function () {
        relier.set('email', 'a@a.com');

        sinon.stub(user, 'getAccountByEmail', function () {
          return user.initAccount();
        });

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.notOk(view.$('.avatar-view img').length, 'does not show a profile image');
            assert.ok(view.$('.avatar-view span').length, 'shows a placeholder if avatar is not available');
          });
      });

      it('shows avatar when account.email and relier.email match', function () {
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
          })
          .then(function () {
            assert.ok(view.$('.avatar-view img').length);
          });
      });

      it('shows no avatar when Session.email and relier.email do not match', function () {
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
          })
          .then(function () {
            assert.notOk(view.$('.avatar-view img').length);
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
        it('prints an error message and does not allow the user to sign up', function () {
          sinon.stub(user, 'signInAccount', function () {
            return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          return view.submit()
            .then(function () {
              assert.isTrue(view.isErrorVisible());
              assert.include(view.$('.error').text(), 'Unknown');
              // no link to sign up.
              assert.equal(view.$('.error').find('a').length, 0);
            });
        });
      });

      describe('resetPasswordNow', function () {
        it('prints an error message and does not allow the user to sign up', function () {
          sinon.stub(view.fxaClient, 'passwordReset', function () {
            return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          relier.set('email', email);

          return view.resetPasswordNow()
            .then(function () {
              assert.isTrue(view.isErrorVisible());
              assert.include(view.$('.error').text(), 'Unknown');
              // no link to sign up.
              assert.equal(view.$('.error').find('a').length, 0);
            });
        });
      });
    });

    describe('beforeDestroy', function () {
      beforeEach(function () {
        initDeps();

        relier.set('email', TestHelpers.createEmail());

        return view.render();
      });

      it('saves the form info to formPrefill', function () {
        view.$('.password').val('password');

        view.beforeDestroy();

        assert.equal(formPrefill.get('password'), 'password');
      });
    });
  });
});
