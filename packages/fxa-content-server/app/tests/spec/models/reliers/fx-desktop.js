/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'models/reliers/fx-desktop',
  'lib/translator',
  '../../../mocks/window',
  '../../../lib/helpers'
], function (chai, Relier, Translator, WindowMock, TestHelpers) {
  var assert = chai.assert;

  describe('models/reliers/fx-desktop', function () {
    var windowMock;
    var translator;
    var relier;

    beforeEach(function () {
      windowMock = new WindowMock();
      translator = new Translator('en-US', ['en-US']);

      relier = new Relier({
        window: windowMock,
        translator: translator
      });
    });

    describe('fetch', function () {
      it('populates model from the search parameters', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          context: 'fx_desktop_v1',
          entrypoint: 'menupanel',
          service: 'sync',
          isMigration: true
        });

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('context'), 'fx_desktop_v1');
              assert.equal(relier.get('entrypoint'), 'menupanel');
              assert.equal(relier.get('service'), 'sync');
              assert.equal(relier.get('isMigration'), true);
            });
      });

      it('translates `service` to `serviceName`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          service: 'sync'
        });

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('serviceName'), 'Firefox Sync');
            });
      });
    });

    describe('isFxDesktop', function () {
      it('returns `true`', function () {
        assert.isTrue(relier.isFxDesktop());
      });
    });
  });
});

