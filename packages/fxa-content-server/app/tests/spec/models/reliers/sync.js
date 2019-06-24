/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Relier from 'models/reliers/sync';
import TestHelpers from '../../../lib/helpers';
import Translator from 'lib/translator';
import WindowMock from '../../../mocks/window';

const ACTION = 'email';
const CONTEXT = 'fx_desktop_v3';
const COUNTRY = 'RO';
const SYNC_SERVICE = 'sync';

describe('models/reliers/sync', () => {
  let err;
  let relier;
  let translator;
  let windowMock;

  function fetchExpectError() {
    return relier.fetch().then(assert.fail, function(_err) {
      err = _err;
    });
  }

  beforeEach(() => {
    translator = new Translator('en-US', ['en-US']);
    windowMock = new WindowMock();

    relier = new Relier(
      {
        context: CONTEXT,
      },
      {
        translator: translator,
        window: windowMock,
      }
    );
  });

  describe('fetch', () => {
    it('populates model from the search parameters', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        action: ACTION,
        context: CONTEXT,
        country: COUNTRY,
        customizeSync: 'true',
        service: SYNC_SERVICE,
        signin: 'signin-code',
      });

      return relier.fetch().then(() => {
        assert.equal(relier.get('action'), ACTION);
        assert.equal(relier.get('context'), CONTEXT);
        assert.equal(relier.get('country'), COUNTRY);
        assert.equal(relier.get('service'), SYNC_SERVICE);
        assert.isTrue(relier.get('customizeSync'));
        assert.equal(relier.get('signinCode'), 'signin-code');
      });
    });

    describe('action query parameter', () => {
      describe('missing', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({});

          return relier.fetch();
        });

        it('none is set', () => {
          assert.isFalse(relier.has('action'));
        });
      });

      ['signin', 'signup', 'email'].forEach(action => {
        it(`accepts action=\`${action}\``, () => {
          windowMock.location.search = TestHelpers.toSearchString({ action });

          return relier.fetch().then(() => {
            assert.equal(relier.get('action'), action);
          });
        });
      });

      ['', ' ', 'reset_password'].forEach(action => {
        it(`errors for action=\`${action}\``, () => {
          windowMock.location.search = TestHelpers.toSearchString({ action });

          return fetchExpectError().then(() => {
            assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
            assert.equal(err.param, 'action');
          });
        });
      });
    });

    describe('context query parameter', () => {
      describe('missing', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({});

          return relier.fetch();
        });

        it('falls back to passed in `context', () => {
          assert.equal(relier.get('context'), CONTEXT);
        });
      });

      describe('emtpy', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: '',
          });

          return fetchExpectError();
        });

        it('errors correctly', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'context');
        });
      });

      describe('whitespace', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: ' ',
          });

          return fetchExpectError();
        });

        it('errors correctly', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'context');
        });
      });
    });

    describe('country query parameter', () => {
      describe('missing', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({});

          return relier.fetch();
        });

        it("does not set a country, it'll be retrieved via a call to /sms/status", () => {
          assert.isFalse(relier.has('country'));
        });
      });

      describe('emtpy', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            country: '',
          });

          return fetchExpectError();
        });

        it('errors correctly', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'country');
        });
      });

      describe('invalid', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            country: 'AR',
          });

          return fetchExpectError();
        });

        it('errors correctly', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'country');
        });
      });

      describe('whitespace', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            country: ' ',
          });

          return fetchExpectError();
        });

        it('errors correctly', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'country');
        });
      });
    });

    describe('customizeSync query parameter', () => {
      describe('missing', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: CONTEXT,
          });

          return relier.fetch();
        });

        it('succeeds', () => {
          assert.isFalse(relier.get('customizeSync'));
        });
      });

      describe('emtpy', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: CONTEXT,
            customizeSync: '',
          });

          return fetchExpectError();
        });

        it('errors correctly', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'customizeSync');
        });
      });

      describe('whitespace', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: CONTEXT,
            customizeSync: ' ',
          });

          return fetchExpectError();
        });

        it('errors correctly', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'customizeSync');
        });
      });

      describe('not a boolean', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: CONTEXT,
            customizeSync: 'not a boolean',
          });

          return fetchExpectError();
        });

        it('errors correctly', () => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
          assert.equal(err.param, 'customizeSync');
        });
      });
    });

    describe('signin query parameter', () => {
      describe('missing', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: CONTEXT,
          });

          return relier.fetch();
        });

        it('succeeds', () => {
          assert.isUndefined(relier.get('signinCode'));
        });
      });

      describe('emtpy', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: CONTEXT,
            signin: '',
          });

          return relier.fetch();
        });

        it('succeeds', () => {
          assert.isUndefined(relier.get('signinCode'));
        });
      });

      describe('whitespace', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: CONTEXT,
            signin: ' ',
          });

          return relier.fetch();
        });

        it('succeeds', () => {
          assert.isUndefined(relier.get('signinCode'));
        });
      });

      describe('a string', () => {
        beforeEach(() => {
          windowMock.location.search = TestHelpers.toSearchString({
            context: CONTEXT,
            signin: 'signin-code',
          });

          return relier.fetch();
        });

        it('succeeds', () => {
          assert.equal(relier.get('signinCode'), 'signin-code');
        });
      });
    });

    it('translates `service` to `serviceName`', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        context: CONTEXT,
        service: SYNC_SERVICE,
      });

      return relier.fetch().then(() => {
        assert.equal(relier.get('serviceName'), 'Firefox Sync');
      });
    });
  });

  describe('isSync', () => {
    it('returns `true`', () => {
      assert.isTrue(relier.isSync());
    });
  });

  describe('isCustomizeSyncChecked', () => {
    it('returns true if `customizeSync=true`', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        context: CONTEXT,
        customizeSync: 'true',
      });

      return relier.fetch().then(() => {
        assert.isTrue(relier.isCustomizeSyncChecked());
      });
    });

    it('returns false if `customizeSync=false`', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        context: CONTEXT,
        customizeSync: 'false',
      });

      return relier.fetch().then(() => {
        assert.isFalse(relier.isCustomizeSyncChecked());
      });
    });
  });

  describe('wantsKeys', () => {
    it('always returns true', () => {
      assert.isTrue(relier.wantsKeys());
    });
  });
});
