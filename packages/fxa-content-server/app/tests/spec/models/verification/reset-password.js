/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import Constants from 'lib/constants';
import Model from 'models/verification/reset-password';
import TestHelpers from '../../../lib/helpers';

var assert = chai.assert;

describe('models/verification/reset-password', function () {
  var invalidCode = TestHelpers.createRandomHexString(
    Constants.CODE_LENGTH + 1
  );
  var validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
  var invalidToken = TestHelpers.createRandomHexString(
    Constants.UID_LENGTH + 1
  );
  var validToken = TestHelpers.createRandomHexString(Constants.UID_LENGTH);
  var validEmail = 'testuser@testuser.com';
  var invalidEmail = 'invalid';

  describe('isValid', function () {
    it('returns false if token is missing', function () {
      var model = new Model({
        code: validCode,
        email: validEmail,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if token is invalid', function () {
      var model = new Model({
        code: validCode,
        email: validEmail,
        token: invalidToken,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if code is missing', function () {
      var model = new Model({
        email: validEmail,
        token: validToken,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if code is invalid', function () {
      var model = new Model({
        code: invalidCode,
        email: validEmail,
        token: validToken,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if email is missing', function () {
      var model = new Model({
        code: validCode,
        token: validToken,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if email is invalid', function () {
      var model = new Model({
        code: validCode,
        email: invalidEmail,
        token: validToken,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if emailToHasWith is invalid', function () {
      var model = new Model({
        code: validCode,
        email: validEmail,
        emailToHashWith: invalidEmail,
        token: validToken,
      });

      assert.isFalse(model.isValid());
    });

    it('returns true otherwise', function () {
      var model = new Model({
        code: validCode,
        email: validEmail,
        token: validToken,
      });

      assert.isTrue(model.isValid());
    });
  });
});
