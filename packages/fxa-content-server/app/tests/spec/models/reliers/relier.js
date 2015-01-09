/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'lib/constants',
  'models/reliers/relier',
  '../../../mocks/window',
  '../../../lib/helpers'
], function (chai, Constants, Relier, WindowMock, TestHelpers) {
  var assert = chai.assert;

  describe('models/reliers/relier', function () {
    var relier;
    var windowMock;

    var SERVICE = 'service';
    var SYNC_SERVICE = 'sync';
    var PREVERIFY_TOKEN = 'abigtoken';
    var EMAIL = 'email';
    var UID = 'uid';

    beforeEach(function () {
      windowMock = new WindowMock();

      relier = new Relier({
        window: windowMock
      });
    });

    describe('fetch', function () {
      it('populates expected fields from the search parameters, unexpected search parameters are ignored', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          preVerifyToken: PREVERIFY_TOKEN,
          service: SERVICE,
          email: EMAIL,
          uid: UID,
          ignored: 'ignored'
        });

        return relier.fetch()
            .then(function () {
              assert.equal(relier.get('preVerifyToken'), PREVERIFY_TOKEN);
              assert.equal(relier.get('service'), SERVICE);
              assert.equal(relier.get('email'), EMAIL);
              assert.equal(relier.get('uid'), UID);
              assert.isFalse(relier.has('ignored'));
            });
      });
    });

    describe('isOAuth', function () {
      it('returns `false`', function () {
        assert.isFalse(relier.isOAuth());
      });
    });

    describe('isFxDesktop', function () {
      it('returns `false`', function () {
        assert.isFalse(relier.isFxDesktop());
      });
    });

    describe('getResumeToken', function () {
      it('returns null', function () {
        assert.isNull(relier.getResumeToken());
      });
    });

    describe('isSync', function () {
      it('returns true if `service=sync`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          service: SYNC_SERVICE
        });

        return relier.fetch()
            .then(function () {
              assert.isTrue(relier.isSync());
            });
      });

      it('returns false otw', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          service: SERVICE
        });

        return relier.fetch()
            .then(function () {
              assert.isFalse(relier.isSync());
            });
      });
    });

    describe('allowCachedCredentials', function () {
      it('returns `true` if `email` not set', function () {
        return relier.fetch()
          .then(function () {
            assert.isTrue(relier.allowCachedCredentials());
          });
      });

      it('returns `true` if `email` is set to an email address', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          email: 'testuser@testuser.com'
        });

        return relier.fetch()
          .then(function () {
            assert.isTrue(relier.allowCachedCredentials());
          });
      });

      it('returns `false` if `email` is set to `blank`', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          email: Constants.DISALLOW_CACHED_CREDENTIALS
        });

        return relier.fetch()
          .then(function () {
            assert.isFalse(relier.allowCachedCredentials());

            // the email should not be set on the relier model
            // if the specified email === blank
            assert.isFalse(relier.has('email'));
          });
      });
    });
  });
});

