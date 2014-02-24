/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/reset_password',
  'lib/fxa-client',
  '../../mocks/window',
  '../../mocks/router'
],
function (chai, View, FxaClient, WindowMock, RouterMock) {
  var assert = chai.assert;

  describe('views/reset_password', function () {
    var view, router;

    beforeEach(function () {

      router = new RouterMock();
      view = new View({
        router: router
      });
      view.render();

      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = router = null;
    });

    describe('constructor creates it', function () {
      it('is drawn', function () {
        assert.ok($('#fxa-reset-password-header').length);
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
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
      });
    });

    describe('submit with valid input', function () {
      it('submits the email address', function (done) {
        var email = 'testuser.' + Math.random() + '@testuser.com';
        var client = new FxaClient();
        client.signUp(email, 'password')
              .then(function () {
                view.$('input[type=email]').val(email);

                router.on('navigate', function () {
                  assert.equal(router.page, 'confirm_reset_password');
                  done();
                });

                view.submit();
              });
      });
    });

    describe('submit with unknown email address', function () {
      it('shows an error message', function (done) {
        view.$('input[type=email]').val('unknown@testuser.com');

        view.on('error', function () {
          done();
        });

        view.submit();
      });
    });
  });

});
