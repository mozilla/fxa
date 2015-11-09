/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var ResumeToken = require('models/resume-token');

  var assert = chai.assert;

  var STATE = 'state';
  var CAMPAIGN = 'campaign';
  var ENTRYPOINT = 'entrypoint';
  var VERIFICATION_REDIRECT = 'https://hello.firefox.com';
  var UNIQUE_USER_ID = 'uuid';

  var TOKEN_OBJ = {
    campaign: CAMPAIGN,
    entrypoint: ENTRYPOINT,
    state: STATE,
    uniqueUserId: UNIQUE_USER_ID,
    verificationRedirect: VERIFICATION_REDIRECT
  };

  describe('models/resume-token', function () {
    describe('ResumeToken.stringify', function () {
      it('stringifies an object into an opaque token', function () {
        assert.ok(ResumeToken.stringify(TOKEN_OBJ));
      });
    });

    describe('ResumeToken.parse', function () {
      it('converts the stringified opaque token into an object', function () {
        var stringifiedToken = ResumeToken.stringify(TOKEN_OBJ);
        var parsedToken = ResumeToken.parse(stringifiedToken);
        assert.deepEqual(parsedToken, TOKEN_OBJ);
      });

      it('returns nothing if the token is invalid', function () {
        assert.isUndefined(ResumeToken.parse('asdf'));
      });
    });

    describe('creation', function () {
      it('should populate the resume token', function () {
        var resumeToken = new ResumeToken(TOKEN_OBJ);
        for (var key in TOKEN_OBJ) {
          assert.equal(resumeToken.get(key), TOKEN_OBJ[key]);
        }
      });

      it('should ignore fields that are not explicitly allowed', function () {
        var parsedToken = {
          ignored: true,
          state: STATE
        };
        var resumeToken = new ResumeToken(parsedToken);
        assert.isFalse(resumeToken.has('ignored'));
      });
    });

    describe('stringify', function () {
      it('should stringify explicitly allowed fields', function () {
        var resumeToken = new ResumeToken(TOKEN_OBJ);

        resumeToken.set('notStringified', true);

        // the value is saved, but not stringified.
        assert.equal(resumeToken.get('notStringified'), true);

        var stringified = resumeToken.stringify();
        var parsed = ResumeToken.parse(stringified);
        for (var key in TOKEN_OBJ) {
          assert.equal(parsed[key], TOKEN_OBJ[key]);
        }
        assert.isFalse('notStringified' in parsed);
      });
    });
  });
});
