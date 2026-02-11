/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Constants from 'lib/constants';
import helpers from '../../../lib/helpers';
import Model from 'models/verification/report-sign-in';

const { createRandomHexString } = helpers;

describe('models/verification/report-sign-in', () => {
  const invalidUnblockCode = createRandomHexString(
    Constants.UNBLOCK_CODE_LENGTH + 1
  );
  const validUnblockCode = createRandomHexString(Constants.UNBLOCK_CODE_LENGTH);

  const invalidUid = createRandomHexString(Constants.UID_LENGTH + 1);
  const validUid = createRandomHexString(Constants.UID_LENGTH);

  describe('isValid', () => {
    it('returns false if uid is missing', () => {
      const model = new Model({
        unblockCode: validUnblockCode,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if uid is invalid', () => {
      const model = new Model({
        uid: invalidUid,
        unblockCode: validUnblockCode,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if code is missing', () => {
      const model = new Model({
        uid: validUid,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if code is invalid', () => {
      const model = new Model({
        uid: validUid,
        unblockCode: invalidUnblockCode,
      });

      assert.isFalse(model.isValid());
    });

    it('returns true if everything is valid', () => {
      const model = new Model({
        uid: validUid,
        unblockCode: validUnblockCode,
      });

      assert.isTrue(model.isValid());
    });
  });
});
