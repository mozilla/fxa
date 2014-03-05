/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/tos',
  'lib/session'
],
function (chai, View, Session) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/tos', function () {
    var view, router;

    beforeEach(function () {
      Session.clear();
      view = new View({});
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      Session.clear();
    });

    it('Back button displayed if Session.canGoBack is true', function () {
      Session.set('canGoBack', true);
      view.render();
      $('#container').html(view.el);

      assert.ok($('#fxa-tos-back').length);
    });

    it('Back button not displayed if Session.canGoBack is false', function () {
      Session.set('canGoBack', false);
      view.render();
      $('#container').html(view.el);

      assert.equal($('#fxa-tos-back').length, 0);
    });

    it('fetches translated text from the backend', function (done) {
      Session.set('language', 'en-US');
      view.on('ready', function() {
        // there is currently an error in the tos/pp repo where the tos
        // is under the pp dir, and the pp us under the tos dir.
        assert.ok(view.$('#mozilla-privacy-policy').length);
        /*assert.ok(view.$('#terms-of-service').length);*/

        done();
      });
      view.render();
    });
  });
});


