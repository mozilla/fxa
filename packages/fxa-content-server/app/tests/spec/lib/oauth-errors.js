/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/oauth-errors'
],
function (chai, OAuthErrors) {
  'use strict';

  /*global describe, it*/
  var assert = chai.assert;

  describe('lib/oauth-errors', function () {
    describe('toMessage', function () {
      it('converts a code to a message', function () {
        assert.equal(OAuthErrors.toMessage(101), 'Unknown client');
      });

      it('converts a string type to a message', function () {
        assert.equal(
            OAuthErrors.toMessage('UNKNOWN_CLIENT'), 'Unknown client');
      });

      it('converts an error from the backend containing an errno to a message', function () {
        assert.equal(
          OAuthErrors.toMessage({
            errno: 101
          }), 'Unknown client');
      });

      it('converts an error from the backend containing a message to a message', function () {
        assert.equal(
          OAuthErrors.toMessage({
            message: 'this has no errno'
          }), 'this has no errno');
      });
    });

    describe('toErrno', function () {
      it('returns the errno from an error object', function () {
        var err = OAuthErrors.toError('UNKNOWN_CLIENT', 'dunno');
        assert.equal(OAuthErrors.toErrno(err), 101);
      });

      it('converts a string type to a numeric code, if valid code', function () {
        assert.equal(OAuthErrors.toErrno('UNKNOWN_CLIENT'), 101);
      });

      it('returns the string if an invalid code', function () {
        assert.equal(OAuthErrors.toErrno('this is an invalid code'), 'this is an invalid code');
      });
    });

    describe('is', function () {
      it('checks if an error returned from the server is of a given type',
          function () {
            assert.isTrue(OAuthErrors.is({ errno: 101 }, 'UNKNOWN_CLIENT'));
          });
    });

    describe('toInterpolationContext', function () {
      it('context returns object', function () {
        var result = OAuthErrors.toInterpolationContext(OAuthErrors.toError('UNKNOWN_CLIENT'));
        assert.equal(Object.keys(result).length, 0);
      });

      it('context returns param', function () {
        var err = OAuthErrors.toError('MISSING_PARAMETER');
        err.param = 'param';
        assert.equal(OAuthErrors.toInterpolationContext(err).param, 'param');
      });

      it('context catches data exception', function () {
        assert.equal(Object.keys(OAuthErrors.toInterpolationContext(undefined)).length, 0);
      });
    });
  });
});
