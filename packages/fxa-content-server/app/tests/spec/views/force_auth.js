/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'views/force_auth',
  'lib/session',
  'lib/fxa-client',
  '../../mocks/window',
  '../../mocks/router'
],
function (chai, $, View, Session, FxaClient, WindowMock, RouterMock) {
  var assert = chai.assert;

  describe('/views/force_auth', function () {
    describe('missing email address', function () {
      var view, windowMock, fxaClient;

      beforeEach(function () {
        windowMock = new WindowMock();
        windowMock.location.search = '';

        fxaClient = new FxaClient();

        Session.clear();
        view = new View({
          window: windowMock,
          fxaClient: fxaClient
        });
        return view.render()
            .then(function () {
              $('#container').html(view.el);
            });
      });

      afterEach(function () {
        view.remove();
        view.destroy();
        windowMock = view = null;
      });

      it('prints an error message', function () {
        windowMock.location.search = '';

        assert.notEqual(view.$('.error').text(), '');
      });
    });

    describe('with email', function () {
      var view, windowMock, router, email;

      beforeEach(function () {
        email = 'testuser.' + Math.random() + '@testuser.com';
        Session.set('prefillPassword', 'password');

        windowMock = new WindowMock();
        windowMock.location.search = '?email=' + encodeURIComponent(email);
        router = new RouterMock();

        view = new View({
          window: windowMock,
          router: router
        });
        return view.render()
            .then(function () {
              $('#container').html(view.el);
            });
      });

      afterEach(function () {
        view.remove();
        view.destroy();
        windowMock = router = view = null;
        $('#container').empty();
      });


      it('does not print an error message', function () {
        assert.equal(view.$('.error').text(), '');
      });

      it('does not allow the email to be edited', function () {
        assert.equal($('input[type=email]').length, 0);
      });

      it('prefills password', function () {
        assert.equal($('input[type=password]').val(), 'password');
      });

      it('user cannot create an account', function () {
        assert.equal($('a[href="/signup"]').length, 0);
      });

      it('isValid is successful when the password is filled out', function () {
        $('.password').val('password');
        assert.isTrue(view.isValid());
      });

      it('forgot password request redirects directly to confirm_reset_password', function () {
        var password = 'password';
        var event = $.Event('click');
        return view.fxaClient.signUp(email, password)
              .then(function () {
                // the call to client.signUp clears Session.
                // These fields are reset to complete the test.
                Session.set('forceAuth', true);
                Session.set('forceEmail', email);

                return view.resetPasswordNow(event);
              })
              .then(function () {
                assert.equal(router.page, 'confirm_reset_password');

                assert.isTrue(event.isDefaultPrevented());
                assert.isTrue(event.isPropagationStopped());
              });
      });

      it('only one forget password request at a time', function () {
        var event = $.Event('click');

        view.resetPasswordNow(event);
        return view.resetPasswordNow(event)
                .then(function () {
                  assert(false, 'unexpected success');
                }, function (err) {
                  assert.equal(err.message, 'submit already in progress');
                });
      });
    });
  });
});


