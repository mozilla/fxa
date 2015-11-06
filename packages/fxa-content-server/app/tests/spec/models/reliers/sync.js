/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var Relier = require('models/reliers/sync');
  var TestHelpers = require('../../../lib/helpers');
  var Translator = require('lib/translator');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/reliers/sync', function () {
    var windowMock;
    var translator;
    var relier;

    beforeEach(function () {
      windowMock = new WindowMock();
      translator = new Translator('en-US', ['en-US']);

      relier = new Relier({
        translator: translator,
        window: windowMock
      });
    });

    describe('fetch', function () {
      it('populates model from the search parameters', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          context: 'fx_desktop_v1',
          customizeSync: 'true',
          migration: 'sync1.5',
          service: 'sync'
        });

        return relier.fetch()
          .then(function () {
            assert.equal(relier.get('context'), 'fx_desktop_v1');
            assert.equal(relier.get('migration'), 'sync1.5');
            assert.equal(relier.get('service'), 'sync');
            assert.isTrue(relier.get('customizeSync'));
          });
      });

      it('does not throw if `customizeSync` is not a boolean', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          customizeSync: 'not a boolean'
        });

        return relier.fetch()
          .then(function () {
            assert.isFalse(relier.has('customizeSync'));
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

    describe('isSync', function () {
      it('returns `true`', function () {
        assert.isTrue(relier.isSync());
      });
    });

    describe('isCustomizeSyncChecked', function () {
      it('returns true if `customizeSync=true`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          customizeSync: 'true'
        });

        return relier.fetch()
          .then(function () {
            assert.isTrue(relier.isCustomizeSyncChecked());
          });
      });

      it('returns false if `customizeSync=false`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          customizeSync: 'false'
        });

        return relier.fetch()
          .then(function () {
            assert.isFalse(relier.isCustomizeSyncChecked());
          });
      });
    });

    describe('wantsKeys', function () {
      it('always returns true', function () {
        assert.isTrue(relier.wantsKeys());
      });
    });
  });
});

