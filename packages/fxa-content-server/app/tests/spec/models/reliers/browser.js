/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Relier from 'models/reliers/browser';
import TestHelpers from '../../../lib/helpers';
import Translator from 'lib/translator';
import WindowMock from '../../../mocks/window';

const ACTION = 'email';
const CONTEXT = 'fx_desktop_v3';
const COUNTRY = 'RO';
const SYNC_SERVICE = 'sync';

describe('models/reliers/browser', () => {
  let err;
  let relier;
  let translator;
  let windowMock;

  function fetchExpectError() {
    return relier.fetch().then(assert.fail, function (_err) {
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

  it('has a proper relier name', () => {
    assert.equal(relier.get('name'), 'browser');
  });

  describe('fetch', () => {
    it('populates model from the search parameters', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        action: ACTION,
        context: CONTEXT,
        country: COUNTRY,
        service: SYNC_SERVICE,
        signin: 'signin-code',
      });

      return relier.fetch().then(() => {
        assert.equal(relier.get('action'), ACTION);
        assert.equal(relier.get('context'), CONTEXT);
        assert.equal(relier.get('country'), COUNTRY);
        assert.equal(relier.get('service'), SYNC_SERVICE);
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

      ['signin', 'signup', 'email'].forEach((action) => {
        it(`accepts action=\`${action}\``, () => {
          windowMock.location.search = TestHelpers.toSearchString({ action });

          return relier.fetch().then(() => {
            assert.equal(relier.get('action'), action);
          });
        });
      });

      ['', ' ', 'reset_password'].forEach((action) => {
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

    it('translates no `service` to generic Firefox `serviceName`', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        context: CONTEXT,
      });

      return relier.fetch().then(() => {
        assert.equal(relier.get('serviceName'), 'Firefox');
      });
    });
  });

  describe('isSync', () => {
    it('returns `true`', () => {
      assert.isTrue(relier.isSync());
    });
  });

  describe('wantsKeys', () => {
    it('always returns true', () => {
      assert.isTrue(relier.wantsKeys());
    });
  });
});
