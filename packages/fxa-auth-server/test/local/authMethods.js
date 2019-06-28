/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const mocks = require('../mocks');
const P = require('../../lib/promise');
const error = require('../../lib/error');

const authMethods = require('../../lib/authMethods');

const MOCK_ACCOUNT = {
  uid: 'abcdef123456',
};

describe('availableAuthenticationMethods', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = mocks.mockDB();
  });

  it('returns [`pwd`,`email`] for non-TOTP-enabled accounts', () => {
    mockDb.totpToken = sinon.spy(() => {
      return P.reject(error.totpTokenNotFound());
    });
    return authMethods
      .availableAuthenticationMethods(mockDb, MOCK_ACCOUNT)
      .then(amr => {
        assert.calledWithExactly(mockDb.totpToken, MOCK_ACCOUNT.uid);
        assert.deepEqual(Array.from(amr).sort(), ['email', 'pwd']);
      });
  });

  it('returns [`pwd`,`email`,`otp`] for TOTP-enabled accounts', () => {
    mockDb.totpToken = sinon.spy(() => {
      return P.resolve({
        verified: true,
        enabled: true,
        sharedSecret: 'secret!',
      });
    });
    return authMethods
      .availableAuthenticationMethods(mockDb, MOCK_ACCOUNT)
      .then(amr => {
        assert.calledWithExactly(mockDb.totpToken, MOCK_ACCOUNT.uid);
        assert.deepEqual(Array.from(amr).sort(), ['email', 'otp', 'pwd']);
      });
  });

  it('returns [`pwd`,`email`] when TOTP token is not yet enabled', () => {
    mockDb.totpToken = sinon.spy(() => {
      return P.resolve({
        verified: true,
        enabled: false,
        sharedSecret: 'secret!',
      });
    });
    return authMethods
      .availableAuthenticationMethods(mockDb, MOCK_ACCOUNT)
      .then(amr => {
        assert.calledWithExactly(mockDb.totpToken, MOCK_ACCOUNT.uid);
        assert.deepEqual(Array.from(amr).sort(), ['email', 'pwd']);
      });
  });

  it('rethrows unexpected DB errors', () => {
    mockDb.totpToken = sinon.spy(() => {
      return P.reject(error.serviceUnavailable());
    });
    return authMethods
      .availableAuthenticationMethods(mockDb, MOCK_ACCOUNT)
      .then(
        () => {
          assert.fail('error should have been re-thrown');
        },
        err => {
          assert.calledWithExactly(mockDb.totpToken, MOCK_ACCOUNT.uid);
          assert.equal(err.errno, error.ERRNO.SERVER_BUSY);
        }
      );
  });
});

describe('verificationMethodToAMR', () => {
  it('maps `email` to `email`', () => {
    assert.equal(authMethods.verificationMethodToAMR('email'), 'email');
  });

  it('maps `email-captcha` to `email`', () => {
    assert.equal(authMethods.verificationMethodToAMR('email-captcha'), 'email');
  });

  it('maps `email-2fa` to `email`', () => {
    assert.equal(authMethods.verificationMethodToAMR('email-2fa'), 'email');
  });

  it('maps `totp-2fa` to `otp`', () => {
    assert.equal(authMethods.verificationMethodToAMR('totp-2fa'), 'otp');
  });

  it('maps `recovery-code` to `otp`', () => {
    assert.equal(authMethods.verificationMethodToAMR('recovery-code'), 'otp');
  });

  it('throws when given an unknown verification method', () => {
    assert.throws(() => {
      authMethods.verificationMethodToAMR('email-gotcha');
    }, /unknown verificationMethod/);
  });
});

describe('maximumAssuranceLevel', () => {
  it('returns 0 when no authentication methods are used', () => {
    assert.equal(authMethods.maximumAssuranceLevel([]), 0);
    assert.equal(authMethods.maximumAssuranceLevel(new Set()), 0);
  });

  it('returns 1 when only `pwd` auth is used', () => {
    assert.equal(authMethods.maximumAssuranceLevel(['pwd']), 1);
  });

  it('returns 1 when only `email` auth is used', () => {
    assert.equal(authMethods.maximumAssuranceLevel(['email']), 1);
  });

  it('returns 1 when only `otp` auth is used', () => {
    assert.equal(authMethods.maximumAssuranceLevel(['otp']), 1);
  });

  it('returns 1 when only things-you-know auth mechanisms are used', () => {
    assert.equal(authMethods.maximumAssuranceLevel(['email', 'pwd']), 1);
  });

  it('returns 2 when both `pwd` and `otp` methods are used', () => {
    assert.equal(authMethods.maximumAssuranceLevel(['pwd', 'otp']), 2);
  });
});
