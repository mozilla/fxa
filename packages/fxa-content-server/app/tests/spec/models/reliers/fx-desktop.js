/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'models/reliers/fx-desktop',
  '../../../mocks/window',
  '../../../lib/helpers'
], function (chai, Relier, WindowMock, TestHelpers) {
  var assert = chai.assert;

  describe('reliers/reliers/fx-desktop', function () {
    describe('fetch', function () {
      var relier, windowMock;

      beforeEach(function () {
        windowMock = new WindowMock();

        relier = new Relier({
          window: windowMock
        });
      });

      it('populates context & entrypoint from the search parameters', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          context: 'fx_desktop_v1',
          entrypoint: 'menupanel'
        });

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('context'), 'fx_desktop_v1');
              assert.equal(relier.get('entrypoint'), 'menupanel');
            });
      });
    });
  });
});

