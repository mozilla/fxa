/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'lib/resume-token'
], function (chai, ResumeToken) {
  var assert = chai.assert;

  var TOKEN_OBJ = {
    state: 'STATE'
  };

  describe('lib/resume-token', function () {
    describe('stringify', function () {
      it('stringifies an object into an opaque token', function () {
        assert.ok(ResumeToken.stringify(TOKEN_OBJ));
      });
    });

    describe('parse', function () {
      it('converts the stringified opaque token into an object', function () {
        var stringifiedToken = ResumeToken.stringify(TOKEN_OBJ);
        var parsedToken = ResumeToken.parse(stringifiedToken);
        assert.deepEqual(parsedToken, TOKEN_OBJ);
      });

      it('returns nothing if the token is invalid', function () {
        assert.isUndefined(ResumeToken.parse('asdf'));
      });
    });
  });
});

