/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/reset_password_complete',
  'lib/session'
],
function (chai, View, Session) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/reset_password_complete', function () {
    var view;

    beforeEach(function () {
      Session.clear();

      view = new View({});
    });

    afterEach(function () {
      Session.clear();

      view.remove();
      view.destroy();
      view = null;
    });

    describe('render', function () {
      it('renders', function () {
        view.render();

        assert.ok(view.$('#fxa-reset-password-complete-header').length);
      });

      it('shows redirectTo link and service name if available', function () {
        Session.set('redirectTo', 'https://sync.firefox.com');
        Session.set('service', 'Firefox Sync');
        view.render();

        assert.equal(view.$('#redirectTo').length, 1);
        var html = view.$('section').text();
        assert.notEqual(html.indexOf('Firefox Sync'), -1);
      });

      it('does not show redirectTo link if unavailable', function () {
        view.render();
        assert.equal(view.$('#redirectTo').length, 0);
      });
    });
  });
});



