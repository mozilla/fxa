/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'lib/promise',
  'lib/session',
  'lib/auth-errors',
  'lib/metrics',
  'lib/fxa-client',
  'views/confirm',
  'models/reliers/relier',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, sinon, p, Session, AuthErrors, Metrics, FxaClient, View,
      Relier, RouterMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('views/confirm', function () {
    var view;
    var routerMock;
    var metrics;
    var fxaClient;
    var relier;

    beforeEach(function () {
      Session.set('sessionToken', 'fake session token');

      routerMock = new RouterMock();
      metrics = new Metrics();
      relier = new Relier();
      fxaClient = new FxaClient({
        relier: relier
      });

      view = new View({
        router: routerMock,
        metrics: metrics,
        fxaClient: fxaClient,
        relier: relier
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

      view = metrics = null;
    });

    describe('constructor creates it', function () {
      it('is drawn', function () {
        assert.ok($('#fxa-confirm-header').length);
      });

      it('redirects to /signup if no sessionToken', function () {
        Session.clear('sessionToken');
        return view.render()
          .then(function () {
            assert.equal(routerMock.page, 'signup');
          });
      });

      it('redirects the normal flow to /signup_complete when verification completes', function (done) {
        sinon.stub(view, 'navigate', function (page) {
          TestHelpers.wrapAssertion(function () {
            assert.equal(page, 'signup_complete');
          }, done);
        });

        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          return p({ verified: true });
        });

        return view.render();
      });
    });

    describe('submit', function () {
      it('resends the confirmation email, shows success message, logs the event', function () {
        var email = TestHelpers.createEmail();

        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                return view.submit();
              })
              .then(function () {
                assert.isTrue(view.$('.success').is(':visible'));
                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.resend'));
              });

      });

      it('redirects to `/signup` if the resend token is invalid', function () {
        view.fxaClient.signUpResend = function () {
          return p().then(function () {
            throw AuthErrors.toError('INVALID_TOKEN', 'Invalid token');
          });
        };

        return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'signup');

                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.resend'));
              });
      });

      it('displays other error messages if there is a problem', function () {
        view.fxaClient.signUpResend = function () {
          return p().then(function () {
            throw new Error('synthesized error from auth server');
          });
        };

        return view.submit()
              .then(function () {
                assert(false, 'unexpected success');
              }, function (err) {
                assert.equal(err.message, 'synthesized error from auth server');
              });
      });
    });

    describe('validateAndSubmit', function () {
      it('only called after click on #resend', function () {
        var email = TestHelpers.createEmail();

        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                var count = 0;
                view.validateAndSubmit = function () {
                  count++;
                };

                view.$('section').click();
                assert.equal(count, 0);

                view.$('#resend').click();
                assert.equal(count, 1);
              });
      });

      it('debounces resend calls - submit on first and forth attempt', function () {
        var email = TestHelpers.createEmail();
        var count = 0;

        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                view.fxaClient.signUpResend = function () {
                  count++;
                  return p(true);
                };

                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 1);
                return view.validateAndSubmit();
              }).then(function () {
                assert.equal(count, 2);
                assert.equal(view.$('#resend:visible').length, 0);

                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.resend'));
                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm.too_many_attempts'));
              });
      });
    });

    describe('oauth', function () {
      it('completes the oauth flow after the account is verified', function (done) {
        /* jshint camelcase: false */
        sinon.stub(relier, 'isOAuth', function () {
          return true;
        });

        sinon.stub(view, 'finishOAuthFlow', function () {
          done();
        });

        var count = 0;
        sinon.stub(view.fxaClient, 'recoveryEmailStatus', function () {
          // force at least one cycle through the poll
          count++;
          return p({ verified: count === 2 });
        });

        view.VERIFICATION_POLL_IN_MS = 100;
        return view.render();
      });
    });

  });
});
