/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'p-promise',
  'lib/session',
  'lib/auth-errors',
  'views/confirm',
  '../../mocks/router'
],
function (chai, p, Session, AuthErrors, View, RouterMock) {
  'use strict';

  var assert = chai.assert;

  describe('views/confirm', function () {
    var view, routerMock;

    beforeEach(function () {
      Session.set('sessionToken', 'fake session token');

      routerMock = new RouterMock();
      view = new View({
        router: routerMock
      });
      return view.render()
          .then(function () {
            $('#container').html(view.el);
          });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
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
    });

    describe('submit', function () {
      it('resends the confirmation email, shows success message', function () {
        var email = 'user' + Math.random() + '@testuser.com';

        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                return view.submit();
              })
              .then(function () {
                assert.isTrue(view.$('.success').is(':visible'));
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
        var email = 'user' + Math.random() + '@testuser.com';

        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                var count = 0;
                view.validateAndSubmit = function() {
                  count++;
                };

                view.$('section').click();
                assert.equal(count, 0);

                view.$('#resend').click();
                assert.equal(count, 1);
              });
      });

      it('debounces resend calls - submit on first and forth attempt', function () {
        var email = 'user' + Math.random() + '@testuser.com';
        var count = 0;

        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                view.fxaClient.signUpResend = function() {
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
              });
      });
    });

    describe('oauth', function () {
      it('redirects to signup_complete after account is verified', function () {
        /* jshint camelcase: false */
        var email = 'user' + Math.random() + '@testuser.com';

        Session.set('service', 'sync');

        view.VERIFICATION_POLL_IN_MS = 100;

        return view.fxaClient.signUp(email, 'password', { preVerified: true })
          .then(function () {
            Session.set('oauth', {
              client_id: 'sync'
            });
            return view.render();
          })
          .then(function () {
            var defer = p.defer();
            setTimeout(function () {
              try {
                assert.equal(routerMock.page, 'signup_complete');
                defer.resolve();
              } catch (e) {
                defer.reject(e);
              }
            }, view.VERIFICATION_POLL_IN_MS + 1000);

            return defer.promise;
          });

      });
    });

  });
});
