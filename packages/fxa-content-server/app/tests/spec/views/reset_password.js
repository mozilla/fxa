/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'lib/promise',
  'lib/session',
  'lib/auth-errors',
  'lib/metrics',
  'lib/fxa-client',
  'views/reset_password',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, p, Session, AuthErrors, Metrics, FxaClient, View, WindowMock, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/reset_password', function () {
    var view, router, metrics, fxaClient;

    beforeEach(function () {
      router = new RouterMock();
      metrics = new Metrics();
      fxaClient = new FxaClient();

      view = new View({
        router: router,
        metrics: metrics,
        fxaClient: fxaClient
      });
      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();
      $('#container').empty();

      view = router = metrics = null;
    });

    describe('render', function () {
      it('renders template', function () {
        assert.ok($('#fxa-reset-password-header').length);
      });

      it('pre-fills email addresses from Session.prefillEmail', function () {
        Session.set('prefillEmail', 'prefilled@testuser.com');
        return view.render()
            .then(function () {
              assert.equal(view.$('.email').val(), 'prefilled@testuser.com');
            });
      });
    });

    describe('isValid', function () {
      it('returns true if email address is entered', function () {
        view.$('input[type=email]').val('testuser@testuser.com');
        assert.isTrue(view.isValid());
      });

      it('returns false if email address is empty', function () {
        assert.isFalse(view.isValid());
      });

      it('returns false if email address is invalid', function () {
        view.$('input[type=email]').val('testuser');
        assert.isFalse(view.isValid());
      });
    });

    describe('showValidationErrors', function () {
      it('shows an error if the email is invalid', function (done) {
        view.$('[type=email]').val('testuser');

        view.on('validation_error', function (which, msg) {
          wrapAssertion(function() {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('submit with valid input', function () {
      it('submits the email address', function () {
        var email = TestHelpers.createEmail();
        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                view.$('input[type=email]').val(email);

                return view.submit();
              })
              .then(function () {
                assert.equal(router.page, 'confirm_reset_password');
              });
      });
    });

    describe('submit with unknown email address', function () {
      it('shows an error message', function () {
        var email = TestHelpers.createEmail();
        view.$('input[type=email]').val(email);

        return view.submit()
                  .then(function (msg) {
                    assert.include(msg, '/signup');
                  });
      });
    });

    describe('submit when user cancelled login', function () {
      it('logs an error', function () {
        view.fxaClient.passwordReset = function (email) {
          return p()
              .then(function () {
                throw AuthErrors.toError('USER_CANCELED_LOGIN');
              });
        };

        return view.submit()
                  .then(null, function(err) {
                    assert.isTrue(false, 'unexpected failure');
                  })
                  .then(function (err) {
                    assert.isFalse(view.isErrorVisible());

                    assert.isTrue(TestHelpers.isEventLogged(metrics,
                                      'login:canceled'));
                  });
      });
    });

    describe('submit with other error', function () {
      it('passes other errors along', function () {
        view.fxaClient.passwordReset = function (email) {
          return p()
              .then(function () {
                throw AuthErrors.toError('INVALID_JSON');
              });
        };

        return view.submit()
                  .then(null, function(err) {
                    // The errorback will not be called if the submit
                    // succeeds, but the following callback always will
                    // be. To ensure the errorback was called, pass
                    // the error along and check its type.
                    return err;
                  })
                  .then(function (err) {
                    assert.isTrue(AuthErrors.is(err, 'INVALID_JSON'));
                  });
      });
    });

  });

  describe('views/reset_password with email specified as query param', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();
      windowMock.location.search = '?email=testuser@testuser.com';

      view = new View({
        window: windowMock
      });
      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = windowMock = null;
      $('#container').empty();
    });

    it('pre-fills email address', function () {
      assert.equal(view.$('.email').val(), 'testuser@testuser.com');
    });

    it('removes the back button - the user probably browsed here directly', function () {
      assert.equal(view.$('#back').length, 0);
    });
  });
});
