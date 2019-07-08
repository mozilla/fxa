/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the interpolated library

import AuthErrors from 'lib/auth-errors';
import OAuthErrors from 'lib/oauth-errors';
import chai from 'chai';

var assert = chai.assert;

describe('lib/auth-errors', function() {
  describe('toError', function() {
    it('converts a string to an Error object with expected fields', function() {
      var err = AuthErrors.toError('INVALID_TOKEN');
      assert.isTrue(err instanceof Error);

      assert.equal(err.errno, 110);
      assert.equal(err.namespace, 'auth');
      assert.equal(err.message, AuthErrors.toMessage('INVALID_TOKEN'));
    });

    it('sets `context` field of error if given', function() {
      var err = AuthErrors.toError('INVALID_TOKEN', 'the context');
      assert.isTrue(err instanceof Error);

      assert.equal(err.context, 'the context');
    });

    it('handles undefined', () => {
      const err = AuthErrors.toError();
      assert.equal(err.message, 'System unavailable, try again soon');
    });

    it('handles null', () => {
      const err = AuthErrors.toError(null);
      assert.equal(err.message, 'System unavailable, try again soon');
    });

    it('handles empty string', () => {
      const err = AuthErrors.toError('');
      assert.equal(err.message, 'System unavailable, try again soon');
    });

    it('handles empty object', () => {
      const err = AuthErrors.toError({});
      assert.equal(err.message, 'Unexpected error');
    });

    it('propagates existing message', () => {
      const err = AuthErrors.toError(new Error('wibble'));
      assert.equal(err.message, 'wibble');
    });
  });

  describe('toInvalidParameterError', function() {
    var err;

    before(function() {
      err = AuthErrors.toInvalidParameterError('param name', AuthErrors);
    });

    it('creates an INVALID_PARAMETER Error', function() {
      assert.isTrue(AuthErrors.is(err, 'INVALID_PARAMETER'));
      assert.equal(err.param, 'param name');
    });
  });

  describe('toMissingParameterError', function() {
    var err;

    before(function() {
      err = AuthErrors.toMissingParameterError('param name', AuthErrors);
    });

    it('creates an MISSING_PARAMETER Error', function() {
      assert.isTrue(AuthErrors.is(err, 'MISSING_PARAMETER'));
      assert.equal(err.param, 'param name');
    });
  });

  describe('toInvalidResumeTokenPropertyError', function() {
    var err;

    before(function() {
      err = AuthErrors.toInvalidResumeTokenPropertyError('foo');
    });

    it('creates an INVALID_RESUME_TOKEN_PROPERTY Error', function() {
      assert.isTrue(AuthErrors.is(err, 'INVALID_RESUME_TOKEN_PROPERTY'));
      assert.equal(err.property, 'foo');
    });
  });

  describe('toMissingResumeTokenPropertyError', function() {
    var err;

    before(function() {
      err = AuthErrors.toMissingResumeTokenPropertyError('bar', AuthErrors);
    });

    it('creates an MISSING_RESUME_TOKEN_PROPERTY Error', function() {
      assert.isTrue(AuthErrors.is(err, 'MISSING_RESUME_TOKEN_PROPERTY'));
      assert.equal(err.property, 'bar');
    });
  });

  describe('toMessage', function() {
    it('converts a code to a message', function() {
      assert.equal(AuthErrors.toMessage(102), 'Unknown account');
    });

    it('converts a string type to a message', function() {
      assert.equal(AuthErrors.toMessage('UNKNOWN_ACCOUNT'), 'Unknown account');
    });

    it('leaves a string that is not a type alone', function() {
      assert.equal(
        AuthErrors.toMessage('this is an error'),
        'this is an error'
      );
    });

    it('uses forceMessage as the message if it exists', function() {
      assert.equal(
        AuthErrors.toMessage({
          errno: 102,
          forceMessage: 'this is my message',
        }),
        'this is my message'
      );
    });

    it('converts an error from the backend containing an errno to a message', function() {
      assert.equal(
        AuthErrors.toMessage({
          errno: 102,
        }),
        'Unknown account'
      );
    });

    it('converts an error from the backend containing a message to a message', function() {
      assert.equal(
        AuthErrors.toMessage({
          message: 'this has no errno',
        }),
        'this has no errno'
      );
    });

    it('converts an empty error message from the backend to service unavailable', function() {
      assert.equal(
        AuthErrors.toMessage(''),
        'System unavailable, try again soon'
      );
    });

    it('converts a missing error from the backend to service unavailable', function() {
      assert.equal(
        AuthErrors.toMessage(),
        'System unavailable, try again soon'
      );
    });

    it('converts SERVER_BUSY error correctly', function() {
      assert.equal(
        AuthErrors.toMessage(AuthErrors.toError('SERVER_BUSY')),
        'Server busy, try again soon'
      );
    });

    it('converts THROTTLED error correctly', function() {
      assert.equal(
        AuthErrors.toMessage(AuthErrors.toError('THROTTLED')),
        "You've tried too many times. Try again later."
      );
    });

    it('converts THROTTLED error correctly', function() {
      var err = AuthErrors.toError('THROTTLED');
      err.retryAfter = 900;
      err.retryAfterLocalized = 'in 15 minutes';
      AuthErrors.toInterpolatedMessage(err);

      assert.equal(
        AuthErrors.toInterpolatedMessage(err),
        "You've tried too many times. Try again in 15 minutes."
      );
    });

    it('converts an unknown object to `UNEXPECTED_ERROR`', function() {
      assert.equal(AuthErrors.toMessage({}), 'Unexpected error');
    });
  });

  describe('toInterpolationContext', function() {
    it('returns the context from backend information for invalid parameter', function() {
      assert.deepEqual(
        AuthErrors.toInterpolationContext({
          errno: 107,
          validation: {
            keys: 'uid',
          },
        }),
        { param: 'uid' }
      );
    });

    it('returns the context from backend information for missing parameter', function() {
      assert.deepEqual(
        AuthErrors.toInterpolationContext({
          errno: 108,
          param: 'uid',
        }),
        { param: 'uid' }
      );
    });

    it('returns empty context for other errors', function() {
      assert.deepEqual(
        AuthErrors.toInterpolationContext({
          errno: 109,
          validation: {
            keys: 'uid',
          },
        }),
        {}
      );
    });

    it('enhances the throttled error if provided with localized context', function() {
      assert.deepEqual(
        AuthErrors.toInterpolationContext({
          errno: 114,
          retryAfterLocalized: 'in 15 minutes',
        }),
        { retryAfterLocalized: 'in 15 minutes' }
      );

      assert.deepEqual(
        AuthErrors.toInterpolationContext({
          errno: 114,
        }),
        { retryAfterLocalized: undefined }
      );
    });
  });

  describe('toErrno', function() {
    it('returns the errno from an error object', function() {
      var err = AuthErrors.toError('INVALID_TOKEN', 'bad token, man');
      assert.equal(AuthErrors.toErrno(err), 110);
    });

    it('converts a string type to a numeric code, if valid code', function() {
      assert.equal(AuthErrors.toErrno('UNKNOWN_ACCOUNT'), 102);
    });

    it('returns the string if an invalid code', function() {
      assert.equal(
        AuthErrors.toErrno('this is an invalid code'),
        'this is an invalid code'
      );
    });
  });

  describe('is', function() {
    it('checks if an error returned from the server is of a given type', function() {
      assert.isTrue(AuthErrors.is({ errno: 102 }, 'UNKNOWN_ACCOUNT'));
      assert.isFalse(AuthErrors.is({ errno: 103 }, 'UNKNOWN_ACCOUNT'));
    });
  });

  describe('created', function() {
    describe('if module created error', function() {
      it('returns true', function() {
        var error = AuthErrors.toError('UNKNOWN_ACCONT');
        assert.isTrue(AuthErrors.created(error));
      });
    });

    describe('if module did not create error', function() {
      it('returns false', function() {
        var error = OAuthErrors.toError('UNEXPECTED_ERROR');
        assert.isFalse(AuthErrors.created(error));
      });
    });
  });

  describe('normalizeXHRError', function() {
    it('converts a missing XHR request to a `SERVICE_UNAVAILABLE` error', function() {
      assert.isTrue(
        AuthErrors.is(AuthErrors.normalizeXHRError(), 'SERVICE_UNAVAILABLE')
      );
    });

    it('converts an XHR request with `status=0` to a `SERVICE_UNAVAILABLE` error', function() {
      assert.isTrue(
        AuthErrors.is(
          AuthErrors.normalizeXHRError({ status: 0 }),
          'SERVICE_UNAVAILABLE'
        )
      );
    });

    it('converts an XHR request with missing `responseJSON` to an `UNEXPECTED_ERROR` error', function() {
      assert.isTrue(
        AuthErrors.is(
          AuthErrors.normalizeXHRError({ status: 200 }),
          'UNEXPECTED_ERROR'
        )
      );
    });

    it('converts an XHR request with `responseJSON` to an error`', function() {
      assert.isTrue(
        AuthErrors.is(
          AuthErrors.normalizeXHRError({
            responseJSON: { errno: 201 },
            status: 200,
          }),
          'SERVER_BUSY'
        )
      );
    });

    it('converts an XHR request with missing `responseJSON` and `status=503` to a `SERVICE_UNAVAILABLE` error', function() {
      assert.isTrue(
        AuthErrors.is(
          AuthErrors.normalizeXHRError({ status: 503 }),
          'SERVICE_UNAVAILABLE'
        )
      );
    });

    it('converts an XHR request with missing `responseJSON` and `status=429` to a `THROTTLED` error', function() {
      assert.isTrue(
        AuthErrors.is(
          AuthErrors.normalizeXHRError({ status: 429 }),
          'THROTTLED'
        )
      );
    });
  });
});
