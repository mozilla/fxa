/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'chai',
  'sinon',
  'lib/constants',
  'models/verification/reset-password',
  '../../../lib/helpers'
], function (chai, sinon, Constants, Model, TestHelpers) {
  var assert = chai.assert;

  describe('models/verification/reset-password', function () {
    var invalidCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH + 1);
    var validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
    var invalidToken = TestHelpers.createRandomHexString(Constants.UID_LENGTH + 1);
    var validToken = TestHelpers.createRandomHexString(Constants.UID_LENGTH);
    var validEmail = 'testuser@testuser.com';
    var invalidEmail = 'invalid';

    describe('isValid', function () {
      it('returns false if token is missing', function () {
        var model = new Model({
          code: validCode,
          email: validEmail
        });

        assert.isFalse(model.isValid());
      });

      it('returns false if token is invalid', function () {
        var model = new Model({
          token: invalidToken,
          code: validCode,
          email: validEmail
        });

        assert.isFalse(model.isValid());
      });

      it('returns false if code is missing', function () {
        var model = new Model({
          token: validToken,
          email: validEmail
        });

        assert.isFalse(model.isValid());
      });

      it('returns false if code is invalid', function () {
        var model = new Model({
          token: validToken,
          code: invalidCode,
          email: validEmail
        });

        assert.isFalse(model.isValid());
      });

      it('returns false if email is missing', function () {
        var model = new Model({
          token: validToken,
          code: validCode
        });

        assert.isFalse(model.isValid());
      });

      it('returns false if email is invalid', function () {
        var model = new Model({
          token: validToken,
          code: validCode,
          email: invalidEmail
        });

        assert.isFalse(model.isValid());
      });

      it('returns true otherwise', function () {
        var model = new Model({
          token: validToken,
          code: validCode,
          email: validEmail
        });

        assert.isTrue(model.isValid());
      });
    });
  });
});

