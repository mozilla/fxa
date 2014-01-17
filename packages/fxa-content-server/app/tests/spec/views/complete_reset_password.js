/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'views/complete_reset_password'
],
function (mocha, chai, View) {
  var assert = chai.assert;

  describe('views/complete_reset_password', function () {
    var view;

    beforeEach(function () {
      view = new View();
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    describe('constructor creates it', function () {
      it('is drawn', function () {
        assert.ok($('#fxa-complete-reset-password-header').length);
      });
    });

    describe('updatePasswordVisibility', function () {
      it('pw field set to text when clicked', function () {
        $('.show-password').click();
        assert.equal($('#password').attr('type'), 'text');
        assert.equal($('#vpassword').attr('type'), 'text');
      });

      it('pw field set to password when clicked again', function () {
        $('.show-password').click();
        $('.show-password').click();
        assert.equal($('#password').attr('type'), 'password');
        assert.equal($('#vpassword').attr('type'), 'password');
      });
    });
  });
});


