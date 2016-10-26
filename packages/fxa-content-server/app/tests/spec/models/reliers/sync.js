/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Relier = require('models/reliers/sync');
  const TestHelpers = require('../../../lib/helpers');
  const Translator = require('lib/translator');
  const WindowMock = require('../../../mocks/window');

  const CONTEXT = 'fx_desktop_v1';
  const SYNC_MIGRATION = 'sync11';
  const SYNC_SERVICE = 'sync';

  describe('models/reliers/sync', function () {
    let err;
    let relier;
    let translator;
    let windowMock;

    function fetchExpectError () {
      return relier.fetch()
        .then(assert.fail, function (_err) {
          err = _err;
        });
    }

    beforeEach(function () {
      translator = new Translator('en-US', ['en-US']);
      windowMock = new WindowMock();

      relier = new Relier({
        context: CONTEXT
      }, {
        translator: translator,
        window: windowMock
      });
    });

    describe('fetch', function () {
      it('populates model from the search parameters', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          context: CONTEXT,
          customizeSync: 'true',
          migration: SYNC_MIGRATION,
          service: SYNC_SERVICE
        });

        return relier.fetch()
          .then(function () {
            assert.equal(relier.get('context'), CONTEXT);
            assert.equal(relier.get('migration'), SYNC_MIGRATION);
            assert.equal(relier.get('service'), SYNC_SERVICE);
            assert.isTrue(relier.get('customizeSync'));
          });
      });

      describe('context query parameter', function () {
        describe('missing', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({});

            return relier.fetch();
          });

          it('falls back to passed in `context', function () {
            assert.equal(relier.get('context'), CONTEXT);
          });
        });

        describe('emtpy', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({
              context: ''
            });

            return fetchExpectError();
          });

          it('errors correctly', function () {
            assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
            assert.equal(err.param, 'context');
          });
        });

        describe('whitespace', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({
              context: ' '
            });

            return fetchExpectError();
          });

          it('errors correctly', function () {
            assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
            assert.equal(err.param, 'context');
          });
        });
      });

      describe('customizeSync query parameter', function () {
        describe('missing', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({
              context: CONTEXT
            });

            return relier.fetch();
          });

          it('succeeds', function () {
            assert.isFalse(relier.get('customizeSync'));
          });
        });

        describe('emtpy', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({
              context: CONTEXT,
              customizeSync: ''
            });

            return fetchExpectError();
          });

          it('errors correctly', function () {
            assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
            assert.equal(err.param, 'customizeSync');
          });
        });

        describe('whitespace', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({
              context: CONTEXT,
              customizeSync: ' '
            });

            return fetchExpectError();
          });

          it('errors correctly', function () {
            assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
            assert.equal(err.param, 'customizeSync');
          });
        });

        describe('not a boolean', function () {
          beforeEach(function () {
            windowMock.location.search = TestHelpers.toSearchString({
              context: CONTEXT,
              customizeSync: 'not a boolean'
            });

            return fetchExpectError();
          });

          it('errors correctly', function () {
            assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
            assert.equal(err.param, 'customizeSync');
          });
        });
      });

      it('translates `service` to `serviceName`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          context: CONTEXT,
          service: SYNC_SERVICE
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
          context: CONTEXT,
          customizeSync: 'true'
        });

        return relier.fetch()
          .then(function () {
            assert.isTrue(relier.isCustomizeSyncChecked());
          });
      });

      it('returns false if `customizeSync=false`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          context: CONTEXT,
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

