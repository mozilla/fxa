/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/ready',
  'lib/session'
],
function (chai, View, Session) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/ready', function () {
    var view;

    beforeEach(function () {
      view = new View({});
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    describe('render', function () {
      it('renders with correct header for reset_password type', function () {
        view.type = 'reset_password';

        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-reset-password-complete-header').length);
            });
      });

      it('renders with correct header for sign_in type', function () {
        view.type = 'sign_in';
        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-sign-in-complete-header').length);
            });
      });

      it('renders with correct header for sign_up type', function () {
        view.type = 'sign_up';
        return view.render()
            .then(function () {
              assert.ok(view.$('#fxa-sign-up-complete-header').length);
            });
      });

      it('shows redirectTo link and service name if available', function () {
        Session.set('redirectTo', 'https://sync.firefox.com');
        Session.set('service', 'sync');
        return view.render()
            .then(function () {
              assert.equal(view.$('#redirectTo').length, 1);
              var html = view.$('section').text();
              assert.notEqual(html.indexOf('Firefox Sync'), -1);
            });
      });

      it('does not show redirectTo link if unavailable', function () {
        return view.render()
            .then(function () {
              assert.equal(view.$('#redirectTo').length, 0);
            });
      });
    });
  });
});



