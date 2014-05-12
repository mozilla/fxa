/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/reset_password',
  '../../mocks/window',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, View, WindowMock, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/reset_password', function () {
    var view, router;

    beforeEach(function () {

      router = new RouterMock();
      view = new View({
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
      view = router = null;
      $('#container').empty();
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
          wrapAssertion(function() {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('submit with valid input', function () {
      it('submits the email address', function () {
        var email = 'testuser.' + Math.random() + '@testuser.com';
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
      it('rejects the promise', function () {
        var email = 'unknown' + Math.random() + '@testuser.com';
        view.$('input[type=email]').val(email);

        return view.submit()
                  .then(function () {
                    assert(false, 'unexpected success');
                  }, function (err) {
                    // Turn that frown upside down.
                    // Error is expected.
                    assert.ok(err.message.indexOf('Unknown') > -1);
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
