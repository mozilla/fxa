/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the interpolated library

define([
  'chai',
  'lib/auth-errors'
],
function (chai, AuthErrors) {
  'use strict';

  /*global describe, it*/
  var assert = chai.assert;

  describe('lib/auth-errors', function () {
    describe('toMessage', function () {
      it('converts a code to a message', function () {
        assert.equal(AuthErrors.toMessage(102), 'Unknown account');
      });

      it('converts a string type to a message', function () {
        assert.equal(
            AuthErrors.toMessage('UNKNOWN_ACCOUNT'), 'Unknown account');
      });

      it('leaves a string that is not a type alone', function () {
        assert.equal(
            AuthErrors.toMessage('this is an error'), 'this is an error');
      });

      it('uses forceMessage as the message if it exists', function () {
        assert.equal(AuthErrors.toMessage({
          errno: 102,
          forceMessage: 'this is my message'
        }), 'this is my message');
      });

      it('converts an error from the backend containing an errno to a message', function () {
        assert.equal(
          AuthErrors.toMessage({
            errno: 102
          }), 'Unknown account');
      });

      it('converts an error from the backend containing a message to a message', function () {
        assert.equal(
          AuthErrors.toMessage({
            message: 'this has no errno'
          }), 'this has no errno');
      });

      it('converts an empty error message from the backend to service unavailable', function () {
        assert.equal(AuthErrors.toMessage(''), 'System unavailable, try again soon');
      });

      it('converts a missing error from the backend to service unavailable', function () {
        assert.equal(AuthErrors.toMessage(), 'System unavailable, try again soon');
      });

      it('converts SERVER_BUSY error correctly', function () {
        assert.equal(AuthErrors.toMessage(AuthErrors.toError('SERVER_BUSY')), 'Server busy, try again soon');
      });
    });

    describe('toContext', function () {
      it('returns the context from backend information for invalid parameter', function () {
        assert.deepEqual(
          AuthErrors.toContext({
            errno: 107,
            validation: {
              keys: 'uid'
            }
          }), { param: 'uid' });
      });

      it('returns the context from backend information for missing parameter', function () {
        assert.deepEqual(
          AuthErrors.toContext({
            errno: 108,
            param: 'uid'
          }), { param: 'uid' });
      });

      it('returns empty context for other errors', function () {
        assert.deepEqual(
          AuthErrors.toContext({
            errno: 109,
            validation: {
              keys: 'uid'
            }
          }), {});
      });
    });

    describe('toCode', function () {
      it('returns the errno from an error object', function () {
        var err = AuthErrors.toError('INVALID_TOKEN', 'bad token, man');
        assert.equal(AuthErrors.toCode(err), 110);
      });

      it('converts a string type to a numeric code, if valid code', function () {
        assert.equal(AuthErrors.toCode('UNKNOWN_ACCOUNT'), 102);
      });

      it('returns the string if an invalid code', function () {
        assert.equal(AuthErrors.toCode('this is an invalid code'), 'this is an invalid code');
      });
    });

    describe('is', function () {
      it('checks if an error returned from the server is of a given type',
          function () {
        assert.isTrue(AuthErrors.is({ errno: 102 }, 'UNKNOWN_ACCOUNT'));
        assert.isFalse(AuthErrors.is({ errno: 103 }, 'UNKNOWN_ACCOUNT'));
      });
    });
  });
});
