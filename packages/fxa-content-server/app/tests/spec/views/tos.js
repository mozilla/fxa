/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'views/tos'
],
function (chai, sinon, View) {
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

    it('Back button is displayed if there is a page to go back to', function () {
      sinon.stub(view, 'canGoBack', function () {
        return true;
      });

      return view.render()
          .then(function () {
            assert.equal(view.$('#fxa-tos-back').length, 1);
          });
    });

    it('Back button is not displayed if there is no page to go back to', function () {
      sinon.stub(view, 'canGoBack', function () {
        return false;
      });

      return view.render()
          .then(function () {
            assert.equal(view.$('#fxa-tos-back').length, 0);
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


