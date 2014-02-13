/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the interpolated library

'use strict';


define([
  'mocha',
  'chai',
  'lib/auth-errors'
],
function (mocha, chai, AuthErrors) {
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
    });

    describe('toCode', function () {
      it('converts a string type to a numeric code', function () {
        assert.equal(AuthErrors.toCode('UNKNOWN_ACCOUNT'), 102);
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



