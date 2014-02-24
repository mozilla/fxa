/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/pp',
  'lib/session'
],
function (chai, View, Session) {
  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/pp', function () {
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

      assert.ok($('#fxa-pp-back').length);
    });

    it('Back button not displayed if Session.canGoBack is false', function () {
      Session.set('canGoBack', false);
      view.render();
      $('#container').html(view.el);

      assert.equal($('#fxa-pp-back').length, 0);
    });
  });
});


