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
  var assert = chai.assert;

  describe('views/tos', function () {
    var view;

    beforeEach(function () {
      view = new View({});
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    it('Back button is displayed', function () {
      return view.render()
          .then(function () {
            $('#container').html(view.el);
            assert.ok($('#fxa-tos-back').length);
          });
    });

    it('fetches translated text from the backend', function () {
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-tos-header').length);
        });
    });
  });
});


