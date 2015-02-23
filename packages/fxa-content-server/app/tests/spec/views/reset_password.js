/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'underscore',
  'chai',
  'sinon',
  'lib/promise',
  'lib/session',
  'lib/auth-errors',
  'lib/metrics',
  'lib/fxa-client',
  'views/reset_password',
  'models/reliers/relier',
  'models/auth_brokers/base',
  '../../mocks/router',
  '../../lib/helpers'
],
function (_, chai, sinon, p, Session, AuthErrors, Metrics, FxaClient, View,
      Relier, Broker, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/reset_password', function () {
    var view;
    var router;
    var metrics;
    var fxaClient;
    var relier;
    var broker;

    function createView(options) {
      var viewOptions = _.extend({
        router: router,
        metrics: metrics,
        fxaClient: fxaClient,
        relier: relier,
        broker: broker,
        canGoBack: true
      }, options || {});
      return new View(viewOptions);
    }

    beforeEach(function () {
      router = new RouterMock();
      metrics = new Metrics();
      relier = new Relier();
      broker = new Broker({
        relier: relier
      });
      fxaClient = new FxaClient();

      view = createView();
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

      it('shows the back button if back is enabled', function () {
        view = createView({
          canGoBack: true
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('#back').length, 1);
          });
      });

      it('does not show the back button if back is disabled', function () {
        view = createView({
          canGoBack: false
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('#back').length, 0);
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
          wrapAssertion(function () {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('submit with valid input', function () {
      it('submits the email address', function () {
        sinon.stub(view.fxaClient, 'passwordReset', function () {
          return p({ passwordForgotToken: 'foo' });
        });

        var email = TestHelpers.createEmail();
        view.$('input[type=email]').val(email);

        return view.submit()
          .then(function () {
            assert.equal(router.page, 'confirm_reset_password');
            assert.equal(view.ephemeralMessages.get('data').passwordForgotToken, 'foo');
            assert.isTrue(view.fxaClient.passwordReset.calledWith(
                email, relier));
          });
      });
    });

    describe('submit with unknown email address', function () {
      it('shows an error message', function () {
        sinon.stub(view.fxaClient, 'passwordReset', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

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
        sinon.stub(view.fxaClient, 'passwordReset', function () {
          return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
        });

        return view.submit()
          .then(null, function () {
            assert.isTrue(false, 'unexpected failure');
          })
          .then(function () {
            assert.isFalse(view.isErrorVisible());

            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'login.canceled'));
          });
      });
    });

    describe('submit with other error', function () {
      it('passes other errors along', function () {
        sinon.stub(view.fxaClient, 'passwordReset', function () {
          return p.reject(AuthErrors.toError('INVALID_JSON'));
        });

        return view.submit()
                  .then(null, function (err) {
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

  describe('views/reset_password with email specified in relier', function () {
    var view;
    var relier;
    var broker;

    beforeEach(function () {
      relier = new Relier();
      relier.set('email', 'testuser@testuser.com');
      broker = new Broker({
        relier: relier
      });

      view = new View({
        broker: broker,
        relier: relier
      });
      return view.render();
    });

    afterEach(function () {
      view.destroy();
      view = null;
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
