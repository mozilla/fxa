/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import Constants from 'lib/constants';
import Model from 'models/verification/sign-up';
import TestHelpers from '../../../lib/helpers';

var assert = chai.assert;

describe('models/verification/sign-up', function () {
  var invalidCode = TestHelpers.createRandomHexString(
    Constants.CODE_LENGTH + 1
  );
  var validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
  var invalidUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH + 1);
  var validUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH);

  describe('isValid', function () {
    it('returns false if uid is missing', function () {
      var model = new Model({
        code: validCode,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if uid is invalid', function () {
      var model = new Model({
        code: validCode,
        uid: invalidUid,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if code is missing', function () {
      var model = new Model({
        uid: validUid,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if code is invalid', function () {
      var model = new Model({
        code: invalidCode,
        uid: validUid,
      });

      assert.isFalse(model.isValid());
    });

    it('returns true otherwise', function () {
      var model = new Model({
        code: validCode,
        uid: validUid,
      });

      assert.isTrue(model.isValid());
    });
  });
});
