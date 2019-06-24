/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Model from 'models/verification/account-recovery';

describe('models/verification/account-recovery', () => {
  const validAccountResetToken =
    '237af7c984607e23fadfc0f75d214ac50555d2e5c50acecae6c184d0ebe202c9';
  const validRecoveryKeyId = '63f75aaebc74f912b552da15852fe570';
  const validKb =
    '2e2a6e11551c53db48b742fb4734760c9adce6e75e9610449baebacb2cd52fe3';

  describe('isValid', () => {
    it('returns false if accountResetToken is missing', () => {
      const model = new Model({
        kB: validKb,
        recoveryKeyId: validRecoveryKeyId,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if kB is missing', () => {
      const model = new Model({
        accountResetToken: validAccountResetToken,
        recoveryKeyId: validRecoveryKeyId,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if recoveryKeyId is missing', () => {
      const model = new Model({
        accountResetToken: validAccountResetToken,
        kB: validKb,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if accountResetToken is invalid', () => {
      const model = new Model({
        accountResetToken: '<*_*> notahexstring',
        kB: validKb,
        recoveryKeyId: validRecoveryKeyId,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if kB is invalid', () => {
      const model = new Model({
        accountResetToken: validAccountResetToken,
        kB: '<*_*> notahexstring',
        recoveryKeyId: validRecoveryKeyId,
      });

      assert.isFalse(model.isValid());
    });

    it('returns false if recoveryKeyId is invalid', () => {
      const model = new Model({
        accountResetToken: validAccountResetToken,
        kB: validKb,
        recoveryKeyId: '<*_*> notahexstring',
      });

      assert.isFalse(model.isValid());
    });

    it('returns true if valid', () => {
      const model = new Model({
        accountResetToken: validAccountResetToken,
        kB: validKb,
        recoveryKeyId: validRecoveryKeyId,
      });

      assert.isTrue(model.isValid());
    });
  });
});
